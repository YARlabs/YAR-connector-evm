// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { ERC1967ProxyCreate2 } from "./utils/ERC1967ProxyCreate2.sol";
import { ExecutedBlocksList } from "./utils/ExecutedBlocksList.sol";
import { IIssuedERC20 } from "./interfaces/IIssuedERC20.sol";

contract BridgeERC20 is ExecutedBlocksList {
    using SafeERC20 for IERC20Metadata;

    address public validator;

    bytes32 public currentChain;

    uint256 public nonce;

    bool public isProxyChain;

    mapping(bytes32 => bool) public registeredChains;

    mapping(address => bool) public issuedTokens;

    mapping(bytes32 => mapping(uint256 => bool)) registeredNonces;

    address issuedTokenImplementation;

    event TransferToOtherChain(
        bytes32 indexed transferId,
        uint256 nonce,
        bytes32 initialChain,
        bytes32 originalChain,
        bytes originalTokenAddress,
        bytes32 targetChain,
        uint256 tokenAmount,
        bytes sender,
        bytes recipient,
        string tokenName,
        string tokenSymbol,
        uint8 tokenDecimals
    );

    event ERC20DriverTransferFromOtherChain(
        bytes32 indexed transferId,
        uint256 externalNonce,
        bytes32 originalChain,
        bytes originalToken,
        bytes32 initialChain,
        bytes32 targetChain,
        uint256 amount,
        bytes sender,
        bytes recipient
    );

    function enforceIsValidator(address account) internal view {
        require(account == validator, "BridgeERC20: Only validator!");
    }

    function getTransferId(uint256 _nonce, bytes32 _initialChain) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_nonce, _initialChain));
    }

    function tranferToOtherChain(
        address _transferedToken,
        uint256 _amount,
        bytes32 _targetChain,
        bytes calldata _recipient
    ) external {
        require(_amount > 0, "BridgeERC20: _amount < 0");
        require(registeredChains[_targetChain], "BridgeERC20: chain not registered");

        bool isIssuedToken = issuedTokens[_transferedToken];
        bytes32 initialChain = currentChain;
        uint256 _nonce = nonce++;
        bytes32 originalChain;
        bytes memory originalToken;
        string memory tokenName;
        string memory tokenSymbol;
        uint8 tokenDecimals;

        if (isIssuedToken) {
            // There ISSUED token
            IIssuedERC20 issuedToken = IIssuedERC20(_transferedToken);
            (originalChain, originalToken, tokenName, tokenSymbol, tokenDecimals) = issuedToken
                .getOriginalTokenInfo();
            if (originalChain == _targetChain && isProxyChain) {
                issuedToken.permissionedTransferFrom(msg.sender, address(this), _amount);
            } else {
                issuedToken.burn(msg.sender, _amount);
            }
        } else {
            // There ORIGINAL token
            IERC20Metadata token = IERC20Metadata(_transferedToken);
            originalChain = initialChain;
            originalToken = abi.encode(_transferedToken);
            tokenName = token.name();
            tokenSymbol = token.symbol();
            tokenDecimals = token.decimals();
            token.safeTransferFrom(msg.sender, address(this), _amount);
        }

        addExecutedBlock();
        emit TransferToOtherChain(
            getTransferId(_nonce, initialChain),
            _nonce,
            initialChain,
            originalChain,
            originalToken,
            _targetChain,
            _amount,
            abi.encode(msg.sender),
            abi.encode(_recipient),
            tokenName,
            tokenSymbol,
            tokenDecimals
        );
    }

    struct TokenInfo {
        string name;
        string symbol;
        uint8 decimals;
    }

    function tranferFromOtherChain(
        uint256 _externalNonce,
        bytes32 _originalChain,
        bytes calldata _originalToken,
        bytes32 _initialChain,
        bytes32 _targetChain,
        uint256 _amount,
        bytes calldata _sender,
        bytes calldata _recipient,
        TokenInfo calldata _tokenInfo
    ) external {
        enforceIsValidator(msg.sender);

        require(
            registeredNonces[_initialChain][_externalNonce],
            "BridgeERC20: nonce already registered"
        );

        registeredNonces[_initialChain][_externalNonce] = true;

        bytes32 _currentChain = currentChain;

        require(_initialChain != _currentChain, "BridgeERC20: initialChain == currentChain");

        require(registeredChains[_initialChain], "BridgeERC20: Initial chain not registered");

        address recipientAddress = abi.decode(_recipient, (address));

        if (_currentChain == _targetChain) {
            // This is TARGET chain
            if (currentChain == _originalChain) {
                // This is ORIGINAL chain
                address originalTokenAddress = abi.decode(_originalToken, (address));
                IERC20Metadata(originalTokenAddress).safeTransfer(recipientAddress, _amount);
            } else {
                // This is SECONDARY chain
                address issuedTokenAddress = getIssuedTokenAddress(_originalChain, _originalToken);
                if (!isIssuedTokenPublished(issuedTokenAddress))
                    publishNewToken(_originalChain, _originalToken, _tokenInfo);
                IIssuedERC20(issuedTokenAddress).mint(recipientAddress, _amount);
            }

            emit ERC20DriverTransferFromOtherChain(
                getTransferId(_externalNonce, _initialChain),
                _externalNonce,
                _originalChain,
                _originalToken,
                _initialChain,
                _targetChain,
                _amount,
                _sender,
                _recipient
            );
        } else {
            // This is PROXY chain
            require(isProxyChain, "BridgeERC20: Only proxy bridge!");

            address issuedTokenAddress = getIssuedTokenAddress(_originalChain, _originalToken);
            if (!isIssuedTokenPublished(issuedTokenAddress))
                publishNewToken(_originalChain, _originalToken, _tokenInfo);

            if (_targetChain == _originalChain) {
                // BURN PROXY ISSUED TOKENS
                IIssuedERC20(issuedTokenAddress).burn(recipientAddress, _amount);
            } else {
                // LOCK PROXY ISSUED TOKENS
                IIssuedERC20(issuedTokenAddress).mint(recipientAddress, _amount);
            }

            addExecutedBlock();
            emit TransferToOtherChain(
                getTransferId(_externalNonce, _initialChain),
                _externalNonce,
                _initialChain,
                _originalChain,
                _originalToken,
                _targetChain,
                _amount,
                abi.encode(msg.sender),
                abi.encode(_recipient),
                _tokenInfo.name,
                _tokenInfo.symbol,
                _tokenInfo.decimals
            );
        }
    }

    function isIssuedTokenPublished(address _issuedToken) public returns (bool) {
        return issuedTokens[_issuedToken];
    }

    function getIssuedTokenAddress(
        bytes32 _originalChain,
        bytes calldata _originalToken
    ) public returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(_originalChain, _originalToken));
        return
            address(
                uint160(
                    uint(
                        keccak256(
                            abi.encodePacked(
                                bytes1(0xff),
                                address(this),
                                salt,
                                keccak256(abi.encodePacked(type(ERC1967ProxyCreate2).creationCode))
                            )
                        )
                    )
                )
            );
    }

    function publishNewToken(
        bytes32 _originalChain,
        bytes calldata _originalToken,
        TokenInfo calldata _tokenInfo
    ) internal returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(_originalChain, _originalToken));
        ERC1967ProxyCreate2 issuedToken = new ERC1967ProxyCreate2{ salt: salt }();
        issuedToken.initialize(
            issuedTokenImplementation,
            abi.encodeWithSelector(
                IIssuedERC20.initialize.selector,
                _originalChain,
                _originalToken,
                _tokenInfo.name,
                _tokenInfo.symbol,
                _tokenInfo.decimals
            )
        );

        return address(issuedToken);
    }
}

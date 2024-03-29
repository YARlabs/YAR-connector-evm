// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { ERC1967ProxyCreate2 } from "./utils/ERC1967ProxyCreate2.sol";
import { IIssuedERC20 } from "./interfaces/IIssuedERC20.sol";

contract BridgeERC20 {
    using SafeERC20 for IERC20Metadata;

    address public validator;

    bytes32 public currentChain;

    uint256 public nonce;

    bool public isProxyChain;

    mapping(bytes32 => bool) public registeredChains;

    mapping(address => bool) public issuedTokens;

    mapping(bytes32 => mapping(uint256 => bool)) public registeredNonces;

    address public issuedTokenImplementation;

    uint256 public initBlock;

    string public nativeName;
    string public nativeSymbol;
    uint8 public nativeDecimals;
    uint256 public nativeTransferGasLimit;

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

    event TransferFromOtherChain(
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

    constructor(
        bytes32 _currentChain,
        bool _isProxyChain,
        bytes32[] memory _registeredChains,
        address _issuedTokenImplementation,
        address _validator,
        string memory _nativeName,
        string memory _nativeSymbol,
        uint8 _nativeDecimals,
        uint256 _nativeTransferGasLimit
    ) {
        initBlock = block.number;
        currentChain = _currentChain;
        isProxyChain = _isProxyChain;
        issuedTokenImplementation = _issuedTokenImplementation;
        validator = _validator;

        uint256 l = _registeredChains.length;
        for (uint256 i; i < l; i++) {
            registeredChains[_registeredChains[i]] = true;
        }

        nativeName = _nativeName;
        nativeSymbol = _nativeSymbol;
        nativeDecimals = _nativeDecimals;
        nativeTransferGasLimit = _nativeTransferGasLimit;
    }

    function setChainRegister(bytes32 _chain, bool _value) external {
        enforceIsValidator(msg.sender);
        registeredChains[_chain] = _value;
    }

    function enforceIsValidator(address account) internal view {
        require(account == validator, "BridgeERC20: Only validator!");
    }

    function setValidator(address _newValidator) external {
        enforceIsValidator(msg.sender);
        validator = _newValidator;
    }

    function getTransferId(uint256 _nonce, bytes32 _initialChain) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_nonce, _initialChain));
    }

    function tranferToOtherChain(
        address _transferedToken,
        uint256 _amount,
        bytes32 _targetChain,
        bytes calldata _recipient
    ) external payable {
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
            originalChain = initialChain;
            originalToken = abi.encode(_transferedToken);
            if (_transferedToken == address(0)) {
                // Native
                require(_amount == msg.value, "amount < msg.value!");
                tokenName = nativeName;
                tokenSymbol = nativeSymbol;
                tokenDecimals = nativeDecimals;
            } else {
                // ERC20
                IERC20Metadata token = IERC20Metadata(_transferedToken);

                try token.name() returns (string memory _tokenName) {
                    tokenName = _tokenName;
                } catch {
                    tokenName = "";
                }
                try token.symbol() returns (string memory _tokenSymbol) {
                    tokenSymbol = _tokenSymbol;
                } catch {
                    tokenSymbol = "";
                }
                try token.decimals() returns (uint8 _tokenDecimals) {
                    tokenDecimals = _tokenDecimals;
                } catch {
                    tokenDecimals = 1;
                }
                token.safeTransferFrom(msg.sender, address(this), _amount);
            }
        }

        emit TransferToOtherChain(
            getTransferId(_nonce, initialChain),
            _nonce,
            initialChain,
            originalChain,
            originalToken,
            _targetChain,
            _amount,
            abi.encode(msg.sender),
            _recipient,
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
            !registeredNonces[_initialChain][_externalNonce],
            "BridgeERC20: nonce already registered"
        );

        registeredNonces[_initialChain][_externalNonce] = true;

        bytes32 _currentChain = currentChain;

        require(_initialChain != _currentChain, "BridgeERC20: initialChain == currentChain");

        require(registeredChains[_initialChain], "BridgeERC20: Initial chain not registered");

        if (_currentChain == _targetChain) {
            // This is TARGET chain
            address recipientAddress = abi.decode(_recipient, (address));

            if (currentChain == _originalChain) {
                // This is ORIGINAL chain
                address originalTokenAddress = abi.decode(_originalToken, (address));

                if (originalTokenAddress == address(0)) {
                    // Native
                    (bool success, ) = payable(recipientAddress).call{
                        value: _amount,
                        gas: nativeTransferGasLimit
                    }("");
                    require(success, "failed transfer native tokens!");
                } else {
                    // ERC20
                    IERC20Metadata(originalTokenAddress).safeTransfer(recipientAddress, _amount);
                }
            } else {
                // This is SECONDARY chain
                address issuedTokenAddress = getIssuedTokenAddress(_originalChain, _originalToken);
                if (!isIssuedTokenPublished(issuedTokenAddress))
                    publishNewToken(_originalChain, _originalToken, _tokenInfo);
                IIssuedERC20(issuedTokenAddress).mint(recipientAddress, _amount);
            }

            emit TransferFromOtherChain(
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
                IIssuedERC20(issuedTokenAddress).burn(address(this), _amount);
            } else if (_initialChain == _originalChain) {
                // LOCK PROXY ISSUED TOKENS
                IIssuedERC20(issuedTokenAddress).mint(address(this), _amount);
            }

            bytes memory sender = _sender; // TODO: fix Error HH600
            emit TransferToOtherChain(
                getTransferId(_externalNonce, _initialChain),
                _externalNonce,
                _initialChain,
                _originalChain,
                _originalToken,
                _targetChain,
                _amount,
                sender,
                _recipient,
                _tokenInfo.name,
                _tokenInfo.symbol,
                _tokenInfo.decimals
            );
        }
    }

    function isIssuedTokenPublished(address _issuedToken) public view returns (bool) {
        return issuedTokens[_issuedToken];
    }

    function getIssuedTokenAddress(
        bytes32 _originalChain,
        bytes calldata _originalToken
    ) public view returns (address) {
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
        issuedToken.init(
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

        address issuedTokenAddress = address(issuedToken);
        issuedTokens[issuedTokenAddress] = true;
        return issuedTokenAddress;
    }

    function getTranferId(uint256 _nonce, bytes32 _initialChain) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(_nonce, _initialChain));
    }

    function balances(
        bytes32 _originalChain,
        bytes calldata _originalToken,
        address _account
    ) external view returns (uint256) {
        if (currentChain == _originalChain) {
            address originalTokenAddress = abi.decode(_originalToken, (address));
            if (originalTokenAddress == address(0)) {
                return _account.balance;
            } else {
                return IERC20Metadata(abi.decode(_originalToken, (address))).balanceOf(_account);
            }
        }

        address issuedTokenAddress = getIssuedTokenAddress(_originalChain, _originalToken);

        if (!isIssuedTokenPublished(issuedTokenAddress)) return 0;
        return IERC20Metadata(issuedTokenAddress).balanceOf(_account);
    }
}

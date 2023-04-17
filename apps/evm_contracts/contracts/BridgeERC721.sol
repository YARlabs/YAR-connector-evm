// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { IERC721Metadata } from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import { IERC721Receiver } from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

import { ERC1967ProxyCreate2 } from "./utils/ERC1967ProxyCreate2.sol";
import { IIssuedERC721 } from "./interfaces/IIssuedERC721.sol";

contract BridgeERC721 is IERC721Receiver {

    address public validator;

    bytes32 public currentChain;

    uint256 public nonce;

    bool public isProxyChain;

    mapping(bytes32 => bool) public registeredChains;

    mapping(address => bool) public issuedTokens;

    mapping(bytes32 => mapping(uint256 => bool)) public registeredNonces;

    address public issuedTokenImplementation;

    uint256 public initBlock;

    event TransferToOtherChain(
        bytes32 indexed transferId,
        uint256 nonce,
        bytes32 initialChain,
        bytes32 originalChain,
        bytes originalTokenAddress,
        bytes32 targetChain,
        uint256 tokenId,
        bytes sender,
        bytes recipient,
        string tokenName,
        string tokenSymbol
    );

    event TransferFromOtherChain(
        bytes32 indexed transferId,
        uint256 externalNonce,
        bytes32 originalChain,
        bytes originalToken,
        bytes32 initialChain,
        bytes32 targetChain,
        uint256 tokenId,
        bytes sender,
        bytes recipient
    );

    constructor(
        bytes32 _currentChain,
        bool _isProxyChain,
        bytes32[] memory _registeredChains,
        address _issuedTokenImplementation,
        address _validator
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
    }

    function onERC721Received(
        address _operator,
        address _from,
        uint256 _tokenId,
        bytes calldata _data
    ) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function setChainRegister(bytes32 _chain, bool _value) external {
        enforceIsValidator(msg.sender);
        registeredChains[_chain] = _value;
    }

    function enforceIsValidator(address account) internal view {
        require(account == validator, "BridgeERC721: Only validator!");
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
        uint256 _tokenId,
        bytes32 _targetChain,
        bytes calldata _recipient
    ) external {
        require(registeredChains[_targetChain], "BridgeERC721: chain not registered");

        bool isIssuedToken = issuedTokens[_transferedToken];
        bytes32 initialChain = currentChain;
        uint256 _nonce = nonce++;
        bytes32 originalChain;
        bytes memory originalToken;
        string memory tokenName;
        string memory tokenSymbol;

        if (isIssuedToken) {
            // There ISSUED token
            IIssuedERC721 issuedToken = IIssuedERC721(_transferedToken);
            (originalChain, originalToken, tokenName, tokenSymbol) = issuedToken
                .getOriginalTokenInfo();
            if (originalChain == _targetChain && isProxyChain) {
                issuedToken.permissionedTransferFrom(msg.sender, address(this), _tokenId);
            } else {
                issuedToken.burn(_tokenId);
            }
        } else {
            // There ORIGINAL token
            IERC721Metadata token = IERC721Metadata(_transferedToken);
            originalChain = initialChain;
            originalToken = abi.encode(_transferedToken);
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
            token.safeTransferFrom(msg.sender, address(this), _tokenId);
        }

        emit TransferToOtherChain(
            getTransferId(_nonce, initialChain),
            _nonce,
            initialChain,
            originalChain,
            originalToken,
            _targetChain,
            _tokenId,
            abi.encode(msg.sender),
            _recipient,
            tokenName,
            tokenSymbol
        );
    }

    struct TokenInfo {
        string name;
        string symbol;
    }

    function tranferFromOtherChain(
        uint256 _externalNonce,
        bytes32 _originalChain,
        bytes calldata _originalToken,
        bytes32 _initialChain,
        bytes32 _targetChain,
        uint256 _tokenId,
        bytes calldata _sender,
        bytes calldata _recipient,
        TokenInfo calldata _tokenInfo
    ) external {
        enforceIsValidator(msg.sender);

        require(
            !registeredNonces[_initialChain][_externalNonce],
            "BridgeERC721: nonce already registered"
        );

        registeredNonces[_initialChain][_externalNonce] = true;

        bytes32 _currentChain = currentChain;

        require(_initialChain != _currentChain, "BridgeERC721: initialChain == currentChain");

        require(registeredChains[_initialChain], "BridgeERC721: Initial chain not registered");

        if (_currentChain == _targetChain) {
            // This is TARGET chain
            address recipientAddress = abi.decode(_recipient, (address));

            if (currentChain == _originalChain) {
                // This is ORIGINAL chain
                address originalTokenAddress = abi.decode(_originalToken, (address));
                IERC721Metadata(originalTokenAddress).safeTransferFrom(address(this), recipientAddress, _tokenId);
            } else {
                // This is SECONDARY chain
                address issuedTokenAddress = getIssuedTokenAddress(_originalChain, _originalToken);
                if (!isIssuedTokenPublished(issuedTokenAddress))
                    publishNewToken(_originalChain, _originalToken, _tokenInfo);
                IIssuedERC721(issuedTokenAddress).mint(recipientAddress, _tokenId);
            }

            emit TransferFromOtherChain(
                getTransferId(_externalNonce, _initialChain),
                _externalNonce,
                _originalChain,
                _originalToken,
                _initialChain,
                _targetChain,
                _tokenId,
                _sender,
                _recipient
            );

        } else {
            // This is PROXY chain
            require(isProxyChain, "BridgeERC721: Only proxy bridge!");

            address issuedTokenAddress = getIssuedTokenAddress(_originalChain, _originalToken);
            if (!isIssuedTokenPublished(issuedTokenAddress))
                publishNewToken(_originalChain, _originalToken, _tokenInfo);

            if (_targetChain == _originalChain) {
                // BURN PROXY ISSUED TOKENS
                IIssuedERC721(issuedTokenAddress).burn(_tokenId);
            } else if(_initialChain == _originalChain) {
                // LOCK PROXY ISSUED TOKENS
                IIssuedERC721(issuedTokenAddress).mint(address(this), _tokenId);
            }

            bytes memory sender = _sender; // TODO: fix Error HH600
            emit TransferToOtherChain(
                getTransferId(_externalNonce, _initialChain),
                _externalNonce,
                _initialChain,
                _originalChain,
                _originalToken,
                _targetChain,
                _tokenId,
                sender,
                _recipient,
                _tokenInfo.name,
                _tokenInfo.symbol
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
                IIssuedERC721.initialize.selector,
                _originalChain,
                _originalToken,
                _tokenInfo.name,
                _tokenInfo.symbol
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
        if (currentChain == _originalChain)
            return IERC721Metadata(abi.decode(_originalToken, (address))).balanceOf(_account);

        address issuedTokenAddress = getIssuedTokenAddress(_originalChain, _originalToken);

        if (!isIssuedTokenPublished(issuedTokenAddress)) return 0;
        return IERC721Metadata(issuedTokenAddress).balanceOf(_account);
    }
}

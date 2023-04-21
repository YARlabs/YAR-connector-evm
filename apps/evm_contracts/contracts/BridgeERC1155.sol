// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { IERC1155MetadataURI } from "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import { IERC1155Receiver } from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

import { ERC1967ProxyCreate2 } from "./utils/ERC1967ProxyCreate2.sol";
import { IIssuedERC1155 } from "./interfaces/IIssuedERC1155.sol";

contract BridgeERC1155 is IERC1155Receiver {
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
        uint256 amount,
        bytes sender,
        bytes recipient,
        string tokenUri
    );

    event BatchTransferToOtherChain(
        bytes32 indexed transferId,
        uint256 nonce,
        bytes32 initialChain,
        bytes32 originalChain,
        bytes originalTokenAddress,
        bytes32 targetChain,
        uint256[] tokenIds,
        uint256[] amounts,
        bytes sender,
        bytes recipient,
        string[] tokenUris
    );

    event TransferFromOtherChain(
        bytes32 indexed transferId,
        uint256 externalNonce,
        bytes32 originalChain,
        bytes originalToken,
        bytes32 initialChain,
        bytes32 targetChain,
        uint256 tokenId,
        uint256 amount,
        bytes sender,
        bytes recipient
    );

    event BatchTransferFromOtherChain(
        bytes32 indexed transferId,
        uint256 externalNonce,
        bytes32 originalChain,
        bytes originalToken,
        bytes32 initialChain,
        bytes32 targetChain,
        uint256[] tokenIds,
        uint256[] amounts,
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

    function supportsInterface(bytes4 interfaceID) external pure override returns (bool) {
        return
            interfaceID == 0x01ffc9a7 || // ERC-165
            interfaceID == 0x4e2312e0; // ERC-1155
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    function setChainRegister(bytes32 _chain, bool _value) external {
        enforceIsValidator(msg.sender);
        registeredChains[_chain] = _value;
    }

    function enforceIsValidator(address account) internal view {
        require(account == validator, "BridgeERC1155: Only validator!");
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
        uint256 _amount,
        bytes32 _targetChain,
        bytes calldata _recipient
    ) external {
        require(_amount > 0, "BridgeERC1155: amount == 0");
        require(registeredChains[_targetChain], "BridgeERC1155: chain not registered");

        bool isIssuedToken = issuedTokens[_transferedToken];
        bytes32 initialChain = currentChain;
        uint256 _nonce = nonce++;
        bytes32 originalChain;
        bytes memory originalToken;
        string memory tokenUri;

        if (isIssuedToken) {
            // There ISSUED token
            IIssuedERC1155 issuedToken = IIssuedERC1155(_transferedToken);
            (originalChain, originalToken) = issuedToken.getOriginalTokenInfo();
            tokenUri = issuedToken.uri(_tokenId);
            if (originalChain == _targetChain && isProxyChain) {
                issuedToken.permissionedTransferFrom(msg.sender, address(this), _tokenId, _amount);
            } else {
                issuedToken.burn(msg.sender, _tokenId, _amount);
            }
        } else {
            // There ORIGINAL token
            IERC1155MetadataURI token = IERC1155MetadataURI(_transferedToken);
            originalChain = initialChain;
            originalToken = abi.encode(_transferedToken);
            try token.uri(_tokenId) returns (string memory _tokenUri) {
                tokenUri = _tokenUri;
            } catch {
                tokenUri = "";
            }
            token.safeTransferFrom(msg.sender, address(this), _tokenId, _amount, "");
        }

        emit TransferToOtherChain(
            getTransferId(_nonce, initialChain),
            _nonce,
            initialChain,
            originalChain,
            originalToken,
            _targetChain,
            _tokenId,
            _amount,
            abi.encode(msg.sender),
            _recipient,
            tokenUri
        );
    }

    function batchTranferToOtherChain(
        address _transferedToken,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts,
        bytes32 _targetChain,
        bytes calldata _recipient
    ) external {
        uint256 tokensLength = _tokenIds.length;
        require(tokensLength > 0, "BridgeERC1155: _tokenIds.length == 0");
        require(
            tokensLength == _amounts.length,
            "BridgeERC1155: _tokenIds.length != _amounts.length"
        );
        require(registeredChains[_targetChain], "BridgeERC1155: chain not registered");
        for(uint256 i; i < tokensLength; i++) {
            require(_amounts[i] > 0, "BridgeERC1155: _amounts contains zero value!");
        }

        bool isIssuedToken = issuedTokens[_transferedToken];
        bytes32 initialChain = currentChain;
        uint256 _nonce = nonce++;
        bytes32 originalChain;
        bytes memory originalToken;
        string[] memory tokenUris;

        if (isIssuedToken) {
            // There ISSUED token
            IIssuedERC1155 issuedToken = IIssuedERC1155(_transferedToken);

            (originalChain, originalToken) = issuedToken.getOriginalTokenInfo();
            tokenUris = issuedToken.uriBatch(_tokenIds);
            if (originalChain == _targetChain && isProxyChain) {
                issuedToken.permissionedBatchTransferFrom(
                    msg.sender,
                    address(this),
                    _tokenIds,
                    _amounts
                );
            } else {
                issuedToken.burnBatch(msg.sender, _tokenIds, _amounts);
            }
        } else {
            // There ORIGINAL token
            IERC1155MetadataURI token = IERC1155MetadataURI(_transferedToken);
            originalChain = initialChain;
            originalToken = abi.encode(_transferedToken);
            tokenUris = new string[](tokensLength);
            for (uint256 i; i < tokensLength; i++) {
                try token.uri(_tokenIds[i]) returns (string memory _tokenUri) {
                    tokenUris[i] = _tokenUri;
                } catch {}
            }
            token.safeBatchTransferFrom(msg.sender, address(this), _tokenIds, _amounts, "");
        }

        emit BatchTransferToOtherChain(
            getTransferId(_nonce, initialChain),
            _nonce,
            initialChain,
            originalChain,
            originalToken,
            _targetChain,
            _tokenIds,
            _amounts,
            abi.encode(msg.sender),
            _recipient,
            tokenUris
        );
    }

    struct TokenInfo {
        string uri;
    }

    function tranferFromOtherChain(
        uint256 _externalNonce,
        bytes32 _originalChain,
        bytes calldata _originalToken,
        bytes32 _initialChain,
        bytes32 _targetChain,
        uint256 _tokenId,
        uint256 _amount,
        bytes calldata _sender,
        bytes calldata _recipient,
        string calldata _tokenUri
    ) external {
        enforceIsValidator(msg.sender);

        require(
            !registeredNonces[_initialChain][_externalNonce],
            "BridgeERC1155: nonce already registered"
        );

        registeredNonces[_initialChain][_externalNonce] = true;

        bytes32 _currentChain = currentChain;

        require(_initialChain != _currentChain, "BridgeERC1155: initialChain == currentChain");

        require(registeredChains[_initialChain], "BridgeERC1155: Initial chain not registered");

        if (_currentChain == _targetChain) {
            // This is TARGET chain
            address recipientAddress = abi.decode(_recipient, (address));

            if (currentChain == _originalChain) {
                // This is ORIGINAL chain
                address originalTokenAddress = abi.decode(_originalToken, (address));
                IERC1155MetadataURI(originalTokenAddress).safeTransferFrom(
                    address(this),
                    recipientAddress,
                    _tokenId,
                    _amount,
                    ""
                );
            } else {
                // This is SECONDARY chain
                address issuedTokenAddress = getIssuedTokenAddress(_originalChain, _originalToken);
                if (!isIssuedTokenPublished(issuedTokenAddress))
                    publishNewToken(_originalChain, _originalToken);
                IIssuedERC1155(issuedTokenAddress).mint(
                    recipientAddress,
                    _tokenId,
                    _amount,
                    _tokenUri
                );
            }

            emit TransferFromOtherChain(
                getTransferId(_externalNonce, _initialChain),
                _externalNonce,
                _originalChain,
                _originalToken,
                _initialChain,
                _targetChain,
                _tokenId,
                _amount,
                _sender,
                _recipient
            );
        } else {
            // This is PROXY chain
            require(isProxyChain, "BridgeERC1155: Only proxy bridge!");

            address issuedTokenAddress = getIssuedTokenAddress(_originalChain, _originalToken);
            if (!isIssuedTokenPublished(issuedTokenAddress))
                publishNewToken(_originalChain, _originalToken);

            if (_targetChain == _originalChain) {
                // BURN PROXY ISSUED TOKENS
                IIssuedERC1155(issuedTokenAddress).burn(address(this), _tokenId, _amount);
            } else if (_initialChain == _originalChain) {
                // LOCK PROXY ISSUED TOKENS
                IIssuedERC1155(issuedTokenAddress).mint(
                    address(this),
                    _tokenId,
                    _amount,
                    _tokenUri
                );
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
                _amount,
                sender,
                _recipient,
                _tokenUri
            );
        }
    }

    function batchTranferFromOtherChain(
        uint256 _externalNonce,
        bytes32 _originalChain,
        bytes calldata _originalToken,
        bytes32 _initialChain,
        bytes32 _targetChain,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts,
        bytes calldata _sender,
        bytes calldata _recipient,
        string[] memory _tokenUris
    ) external {
        enforceIsValidator(msg.sender);

        require(_tokenIds.length > 0, "BridgeERC1155: _tokenIds.length == 0");
        require(
            _tokenIds.length == _amounts.length,
            "BridgeERC1155: _tokenIds.length != _amounts.length"
        );
        require(
            !registeredNonces[_initialChain][_externalNonce],
            "BridgeERC1155: nonce already registered"
        );

        registeredNonces[_initialChain][_externalNonce] = true;

        bytes32 _currentChain = currentChain;

        require(_initialChain != _currentChain, "BridgeERC1155: initialChain == currentChain");

        require(registeredChains[_initialChain], "BridgeERC1155: Initial chain not registered");

        if (_currentChain == _targetChain) {
            // This is TARGET chain
            address recipientAddress = abi.decode(_recipient, (address));

            if (currentChain == _originalChain) {
                // This is ORIGINAL chain
                address originalTokenAddress = abi.decode(_originalToken, (address));
                IERC1155MetadataURI(originalTokenAddress).safeBatchTransferFrom(
                    address(this),
                    recipientAddress,
                    _tokenIds,
                    _amounts,
                    ""
                );
            } else {
                // This is SECONDARY chain
                address issuedTokenAddress = getIssuedTokenAddress(_originalChain, _originalToken);
                if (!isIssuedTokenPublished(issuedTokenAddress))
                    publishNewToken(_originalChain, _originalToken);

                IIssuedERC1155(issuedTokenAddress).mintBatch(
                    recipientAddress,
                    _tokenIds,
                    _amounts,
                    _tokenUris
                );
            }

            emit BatchTransferFromOtherChain(
                getTransferId(_externalNonce, _initialChain),
                _externalNonce,
                _originalChain,
                _originalToken,
                _initialChain,
                _targetChain,
                _tokenIds,
                _amounts,
                _sender,
                _recipient
            );
        } else {
            // This is PROXY chain
            require(isProxyChain, "BridgeERC1155: Only proxy bridge!");

            address issuedTokenAddress = getIssuedTokenAddress(_originalChain, _originalToken);
            if (!isIssuedTokenPublished(issuedTokenAddress))
                publishNewToken(_originalChain, _originalToken);

            if (_targetChain == _originalChain) {
                // BURN PROXY ISSUED TOKENS
                IIssuedERC1155(issuedTokenAddress).burnBatch(address(this), _tokenIds, _amounts);
            } else if (_initialChain == _originalChain) {
                // LOCK PROXY ISSUED TOKENS
                IIssuedERC1155(issuedTokenAddress).mintBatch(
                    address(this),
                    _tokenIds,
                    _amounts,
                    _tokenUris
                );
            }

            bytes memory sender = _sender; // TODO: fix Error HH600
            emit BatchTransferToOtherChain(
                getTransferId(_externalNonce, _initialChain),
                _externalNonce,
                _initialChain,
                _originalChain,
                _originalToken,
                _targetChain,
                _tokenIds,
                _amounts,
                sender,
                _recipient,
                _tokenUris
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
        bytes calldata _originalToken
    ) internal returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(_originalChain, _originalToken));
        ERC1967ProxyCreate2 issuedToken = new ERC1967ProxyCreate2{ salt: salt }();
        issuedToken.init(
            issuedTokenImplementation,
            abi.encodeWithSelector(
                IIssuedERC1155.initialize.selector,
                _originalChain,
                _originalToken
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
        address _account,
        uint256 _tokenId
    ) external view returns (uint256) {
        if (currentChain == _originalChain)
            return
                IERC1155MetadataURI(abi.decode(_originalToken, (address))).balanceOf(
                    _account,
                    _tokenId
                );

        address issuedTokenAddress = getIssuedTokenAddress(_originalChain, _originalToken);

        if (!isIssuedTokenPublished(issuedTokenAddress)) return 0;
        return IERC1155MetadataURI(issuedTokenAddress).balanceOf(_account, _tokenId);
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IIssuedToken } from "../interfaces/IIssuedToken.sol";
import { LibChainInfo } from "./LibChainInfo.sol";

library LibERC20Driver {
    bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("LibERC20Driver.storage");

    struct ERC20DriverStorage {
        uint256 initialBlockNumber;
        address issuedTokenImplementation;
        mapping(bytes32 => address) issuedTokenByTokenId;
        mapping(address => bytes32) tokenIdByIssuedToken;
        uint256 withdrawNonce;
        uint256 crossTheBridgeNonce;
        mapping(string => bool) registeredChains;
        mapping(string => address) originalTokenAddressByString;
        uint256 nonce;
        mapping(string => mapping(uint256 => bool)) registeredExternalNoncesByChainName;
    }

    function diamondStorage() internal pure returns (ERC20DriverStorage storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    event ERC20DriverPublishedToken(
        string originalChainName,
        string originalTokenAddress,
        bytes32 indexed tokenId,
        address createdToken
    );

    struct TokenCreateInfo {
        string tokenName;
        string tokenSymbol;
        uint8 tokenDecimals;
    }

    function balances(
        string calldata _originalChainName,
        string calldata _originalTokenAddress,
        address _account
    ) internal view returns (uint256) {
        ERC20DriverStorage storage ds = diamondStorage();
        LibChainInfo.ChainInfoStorage storage chainInfoStorage = LibChainInfo.diamondStorage();

        bytes32 currentChainNameHash = keccak256(abi.encodePacked(chainInfoStorage.chainName));
        bytes32 originalChainNameHash = keccak256(abi.encodePacked(_originalChainName));

        address tokenInCurrentChain = currentChainNameHash == originalChainNameHash
            ? ds.originalTokenAddressByString[_originalTokenAddress]
            : getIssuedTokenAddress(_originalChainName, _originalTokenAddress);

        if (tokenInCurrentChain != address(0)) {
            return IERC20(tokenInCurrentChain).balanceOf(_account);
        }
        return 0;
    }

    function initialBlockNumber() internal view returns (uint256) {
        return diamondStorage().initialBlockNumber;
    }

    function setChainRegistration(string calldata _chainName, bool _value) internal {
        diamondStorage().registeredChains[_chainName] = _value;
    }

    function setIssuedTokenImplementation(address _issuedTokenImplementation) internal {
        diamondStorage().issuedTokenImplementation = _issuedTokenImplementation;
    }

    function getTranferId(uint256 _nonce, string memory _initialChainName) internal pure returns(bytes32) {
        return keccak256(abi.encodePacked(_nonce, _initialChainName));
    }

    function publishNewToken(
        string calldata _originalChainName,
        string calldata _originalTokenAddress,
        TokenCreateInfo calldata _tokenCreateInfo
    ) internal returns (address) {
        // Connect to storage
        ERC20DriverStorage storage ds = diamondStorage();

        // Get token info
        bytes32 tokenId = getTokenId(_originalChainName, _originalTokenAddress);
        address issuedTokenAddress = ds.issuedTokenByTokenId[tokenId];

        // Check already published
        require(issuedTokenAddress == address(0), "Token already published");
        // Check create data
        require(!isEmptyTokenCreateInfo(_tokenCreateInfo), "Not has token create info!");

        // Deploy new token
        issuedTokenAddress = address(
            new ERC1967Proxy(
                ds.issuedTokenImplementation,
                abi.encodeWithSelector(
                    IIssuedToken.initialize.selector,
                    _originalChainName,
                    _originalTokenAddress,
                    _tokenCreateInfo.tokenName,
                    _tokenCreateInfo.tokenSymbol,
                    _tokenCreateInfo.tokenDecimals
                )
            )
        );

        // Save token info to storage
        ds.tokenIdByIssuedToken[issuedTokenAddress] = tokenId;
        ds.issuedTokenByTokenId[tokenId] = issuedTokenAddress;
        // Send event
        emit ERC20DriverPublishedToken(
            _originalChainName,
            _originalTokenAddress,
            tokenId,
            issuedTokenAddress
        );

        return issuedTokenAddress;
    }

    function getIssuedTokenAddress(
        string calldata _originalChainName,
        string calldata _originalTokenAddress
    ) internal view returns (address) {
        bytes32 tokenId = getTokenId(_originalChainName, _originalTokenAddress);
        return diamondStorage().issuedTokenByTokenId[tokenId];
    }

    function isExternalNonceAlreadyRegistered(
        string calldata _initialChainName,
        uint256 _externalNonce
    ) internal view returns (bool) {
        return
            diamondStorage().registeredExternalNoncesByChainName[_initialChainName][_externalNonce];
    }

    function isIssuedTokenCreated(
        string calldata _originalChainName,
        string calldata _originalTokenAddress
    ) internal view returns (bool) {
        return getIssuedTokenAddress(_originalChainName, _originalTokenAddress) != address(0);
    }

    function isEmptyTokenCreateInfo(TokenCreateInfo calldata _tokenCreateInfo)
        internal
        pure
        returns (bool)
    {
        bytes memory tokenInfoBytes = abi.encodePacked(
            _tokenCreateInfo.tokenName,
            _tokenCreateInfo.tokenSymbol,
            _tokenCreateInfo.tokenDecimals
        );
        return tokenInfoBytes.length <= 32 && bytes32(tokenInfoBytes) == "";
    }

    function getTokenId(string calldata _originalChainName, string calldata _originalTokenAddress)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_originalChainName, _originalTokenAddress));
    }

    function getIssuedTokenAddressOrPublishTokenIfNotExists(
        string calldata _originalChainName,
        string calldata _originalTokenAddress,
        TokenCreateInfo calldata _tokenCreateInfo
    ) internal returns (address) {
        bytes32 tokenId = getTokenId(_originalChainName, _originalTokenAddress);
        address issuedTokenAddress = diamondStorage().issuedTokenByTokenId[tokenId];

        // If token not exists, deploy new contract
        if (issuedTokenAddress == address(0)) {
            issuedTokenAddress = publishNewToken(
                _originalChainName,
                _originalTokenAddress,
                _tokenCreateInfo
            );
        }
        return issuedTokenAddress;
    }

    function nonce() internal view returns (uint256) {
        return diamondStorage().nonce;
    }
}

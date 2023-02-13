// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { UniversalAddressUtils } from "../../utils/UniversalAddressUtils.sol";
import { LibERC20Driver } from "../libraries/LibERC20Driver.sol";

interface IERC20Driver {
    event ERC20DriverPublishedToken(
        string originalChainName,
        string originalTokenAddress,
        bytes32 indexed tokenId,
        address createdToken
    );

    event ERC20DriverTransferToOtherChain(
        bytes32 indexed transferId,
        uint256 nonce,
        string initialChainName,
        string originalChainName,
        string originalTokenAddress,
        string targetChainName,
        uint256 tokenAmount,
        string sender,
        string recipient
    );

    event ERC20DriverTransferFromOtherChain(
        bytes32 indexed transferId,
        uint256 externalNonce,
        string originalChainName,
        string originalTokenAddress,
        string initialChainName,
        string targetChainName,
        uint256 amount,
        string sender,
        string recipient
    );

    function getIssuedTokenAddressERC20(
        string calldata _originalChainName,
        string calldata _originalTokenAddress
    ) external view returns (address);

    function getTokenIdERC20(
        string calldata _originalChainName,
        string calldata _originalTokenAddress
    ) external pure returns (bytes32);

    function isIssuedTokenCreatedERC20(
        string calldata _originalChainName,
        string calldata _originalTokenAddress
    ) external view returns (bool);

    function tranferToOtherChainERC20(
        address _transferedToken,
        uint256 _amount,
        string calldata _targetChainName,
        UniversalAddressUtils.UniversalAddress calldata _recipient
    ) external;

    function tranferFromOtherChainERC20(
        uint256 _externalNonce,
        string calldata _originalChainName,
        string calldata _originalTokenAddress,
        string calldata _initialChainName,
        string calldata _targetChainName,
        uint256 _amount,
        string calldata _sender,
        UniversalAddressUtils.UniversalAddress calldata _recipient,
        LibERC20Driver.TokenCreateInfo calldata _tokenCreateInfo
    ) external;

    function initialBlockNumberERC20() external view returns (uint256);

    function isExternalNonceAlreadyRegisteredERC20(
        string calldata _initialChainName,
        uint256 _externalNonce
    ) external view returns (bool);

    function setChainRegistrationERC20(string calldata _chainName, bool _value) external;

    function nonceERC20() external view returns (uint256);

    function balancesERC20(
        string calldata _originalChainName,
        string calldata _originalTokenAddress,
        address _account
    ) external view returns (uint256);

    function setIssuedTokenImplementation(address _issuedTokenImplementation) external;

    function getTranferIdERC20(uint256 _nonce, string calldata _initialChainName) external pure returns(bytes32);
    
    function isIssuedToken(address _token) external view returns(bool);
}

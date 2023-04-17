// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

interface IIssuedERC20 {
    function initialize(
        bytes32 _originalChain,
        bytes memory _originalToken,
        string memory _originalTokenName,
        string memory _originalTokenSymbol,
        uint8 _originalTokenDecimals
    ) external;

    function getOriginalTokenInfo()
        external
        view
        returns (bytes32, bytes memory, string memory, string memory, uint8);

    function mint(address _recipient, uint256 _amount) external;

    function burn(address _from, uint256 _amount) external;

    function permissionedTransferFrom(address from, address to, uint256 amount) external;
}

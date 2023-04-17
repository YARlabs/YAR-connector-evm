// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

interface IIssuedERC721 {
    function initialize(
        bytes32 _originalChain,
        bytes memory _originalToken,
        string memory _originalTokenName,
        string memory _originalTokenSymbol
    ) external;

    function getOriginalTokenInfo()
        external
        view
        returns (bytes32, bytes memory, string memory, string memory);

    function mint(address _recipient, uint256 _tokenId) external;

    function burn(uint256 _tokenId) external;

    function permissionedTransferFrom(address _from, address _to, uint256 _tokenId) external;
}

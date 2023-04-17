// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

interface IIssuedERC1155 {
    function uri(uint256 _tokenId) external view returns (string memory);

    function uriBatch(uint256[] memory _tokenIds) external view returns (string[] memory);

    function initialize(bytes32 _originalChain, bytes memory _originalToken) external;

    function getOriginalTokenInfo() external view returns (bytes32, bytes memory);

    function mint(
        address _recipient,
        uint256 _tokenId,
        uint256 _amount,
        string calldata _uri
    ) external;

    function mintBatch(
        address _recipient,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts,
        string[] memory _uris
    ) external;

    function burn(address _account, uint256 _tokenId, uint256 _amount) external;

    function burnBatch(
        address _account,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts
    ) external;

    function permissionedTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        uint256 _amount
    ) external;

    function permissionedBatchTransferFrom(
        address _from,
        address _to,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts
    ) external;
}

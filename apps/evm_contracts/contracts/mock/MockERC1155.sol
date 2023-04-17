// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { ERC1155 } from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MockERC1155 is ERC1155 {
    constructor() ERC1155("testUri") {}

    function mint(address _recipient, uint256 _tokenId, uint256 _amount) external {
        _mint(_recipient, _tokenId, _amount, "");
    }

    function mintBatch(address _recipient, uint256[] memory _tokenIds, uint256[] memory _amounts) external {
        _mintBatch(_recipient, _tokenIds, _amounts, "");
    }
}
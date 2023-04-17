// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721 {
    constructor() ERC721("MockERC721", "MockERC721") {}

    function mint(uint256 _tokenId, address _recipient) external {
        _mint(_recipient, _tokenId);
    }
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract IssuedERC721 is Initializable, ERC721Upgradeable, OwnableUpgradeable {
    bytes32 public originalChain;
    bytes public originalToken;
    string public originalTokenName;
    string public originalTokenSymbol;

    function initialize(
        bytes32 _originalChain,
        bytes memory _originalToken,
        string memory _originalTokenName,
        string memory _originalTokenSymbol
    ) external initializer {

        ERC721Upgradeable.__ERC721_init(
            string(abi.encodePacked("y", _originalTokenName)),
            string(abi.encodePacked("y", _originalTokenSymbol))
        );
        OwnableUpgradeable.__Ownable_init();
        originalTokenName = _originalTokenName;
        originalTokenSymbol = _originalTokenSymbol;
        originalChain = _originalChain;
        originalToken = _originalToken;
    }

    function getOriginalTokenInfo() external view returns (bytes32, bytes memory, string memory, string memory) {
        return (originalChain, originalToken, originalTokenName, originalTokenSymbol);
    }

    function mint(address _recipient, uint256 _tokenId) external onlyOwner {
        _safeMint(_recipient, _tokenId);
    }

    function burn( uint256 _tokenId) external onlyOwner {
        _burn(_tokenId);
    }

    function permissionedTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external onlyOwner {
        _safeTransfer(_from, _to, _tokenId, "");
    }
}

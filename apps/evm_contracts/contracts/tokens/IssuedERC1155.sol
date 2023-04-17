// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { ERC1155Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract IssuedERC1155 is Initializable, ERC1155Upgradeable, OwnableUpgradeable {
    bytes32 public originalChain;
    bytes public originalToken;
    mapping(uint256 => string) uris;

    function uri(uint256 _tokenId) public view override returns (string memory) {
        return uris[_tokenId];
    }

    function uriBatch(uint256[] memory _tokenIds) public view returns (string[] memory) {
        uint256 l = _tokenIds.length;
        string[] memory _uris = new string[](l);
        for(uint256 i; i < l; i++) {
            _uris[i] = uris[_tokenIds[i]];
        }
        return _uris;
    }

    function initialize(bytes32 _originalChain, bytes memory _originalToken) external initializer {
        ERC1155Upgradeable.__ERC1155_init("");
        OwnableUpgradeable.__Ownable_init();
        originalChain = _originalChain;
        originalToken = _originalToken;
    }

    function getOriginalTokenInfo() external view returns (bytes32, bytes memory) {
        return (originalChain, originalToken);
    }

    function mint(address _recipient, uint256 _tokenId, uint256 _amount, string calldata _uri) external onlyOwner {
        uris[_tokenId] = _uri;
        _mint(_recipient, _tokenId, _amount, "");
    }

    function mintBatch(
        address _recipient,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts,
        string[] memory _uris
    ) external onlyOwner {
        require(_tokenIds.length == _uris.length, "IssuedERC1155: _tokenIds and _uris length mismatch");
        uint256 l = _tokenIds.length;
        for(uint256 i; i < l; i++) {
            uris[_tokenIds[i]] = _uris[i];
        }
        _mintBatch(_recipient, _tokenIds, _amounts, "");
    }

    function burn(address _account, uint256 _tokenId, uint256 _amount) external onlyOwner {
        _burn(_account, _tokenId, _amount);
    }

    function burnBatch(
        address _account,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts
    ) external onlyOwner {
        _burnBatch(_account, _tokenIds, _amounts);
    }

    function permissionedTransferFrom(
        address _from,
        address _to,
        uint256 _tokenId,
        uint256 _amount
    ) external onlyOwner {
        _safeTransferFrom(_from, _to, _tokenId, _amount, "");
    }

    function permissionedBatchTransferFrom(
        address _from,
        address _to,
        uint256[] memory _tokenIds,
        uint256[] memory _amounts
    ) external onlyOwner {
        _safeBatchTransferFrom(_from, _to, _tokenIds, _amounts, "");
    }
}

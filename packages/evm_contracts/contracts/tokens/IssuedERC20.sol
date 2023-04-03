// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract IssuedERC20 is Initializable, ERC20Upgradeable, OwnableUpgradeable {
    bytes32 public originalChain;
    bytes public originalToken;
    uint8 internal originalTokenDecimals;
    string public originalTokenName;
    string public originalTokenSymbol;

    function initialize(
        bytes32 _originalChain,
        bytes memory _originalToken,
        string memory _originalTokenName,
        string memory _originalTokenSymbol,
        uint8 _originalTokenDecimals
    ) external initializer {

        ERC20Upgradeable.__ERC20_init(
            string(abi.encodePacked("y", _originalTokenName)),
            string(abi.encodePacked("y", _originalTokenSymbol))
        );
        OwnableUpgradeable.__Ownable_init();
        originalTokenName = _originalTokenName;
        originalTokenSymbol = _originalTokenSymbol;
        originalChain = _originalChain;
        originalToken = _originalToken;
        originalTokenDecimals = _originalTokenDecimals;
    }

    function getOriginalTokenInfo() external view returns (bytes32, bytes memory, string memory, string memory, uint8) {
        return (originalChain, originalToken, originalTokenName, originalTokenSymbol, decimals());
    }

    function mint(address _recipient, uint256 _amount) external onlyOwner {
        _mint(_recipient, _amount);
    }

    function burn(address _from, uint256 _amount) external onlyOwner {
        _burn(_from, _amount);
    }

    function permissionedTransferFrom(
        address from,
        address to,
        uint256 amount
    ) external onlyOwner {
        _transfer(from, to, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return originalTokenDecimals;
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract IssuedTokenImplementation is Initializable, ERC20Upgradeable, OwnableUpgradeable {
    string public originalChainName;
    string public originalTokenAddress;
    uint8 internal originalTokenDecimals;

    function initialize(
        string memory _originalChainName,
        string memory _originalTokenAddress,
        string memory _originalTokenName,
        string memory _originalTokenSymbol,
        uint8 _originalTokenDecimals
    ) external initializer {
        ERC20Upgradeable.__ERC20_init(
            string(abi.encodePacked("YAR_", _originalTokenName)),
            string(abi.encodePacked("YAR_", _originalTokenSymbol))
        );
        OwnableUpgradeable.__Ownable_init();
        originalChainName = _originalChainName;
        originalTokenAddress = _originalTokenAddress;
        originalTokenDecimals = _originalTokenDecimals;
    }

    function getOriginalTokenInfo() external view returns (string memory, string memory) {
        return (originalChainName, originalTokenAddress);
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

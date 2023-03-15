// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { IIssuedERC20 } from "./IIssuedERC20.sol";

contract BridgeERC20 {
    using SafeERC20 for IERC20Metadata;

    address public validator;

    bytes32 public currentChain;

    uint256 public nonce;

    bool public isProxyChain;

    mapping(bytes32 => bool) public registeredChains;

    mapping(address => bool) public issuedTokens;

    event TransferToOtherChain(
        bytes32 indexed transferId,
        uint256 nonce,
        bytes32 initialChain,
        bytes32 originalChain,
        bytes originalTokenAddress,
        bytes32 targetChain,
        uint256 tokenAmount,
        bytes sender,
        bytes recipient,
        string tokenName,
        string tokenSymbol,
        uint8 tokenDecimals
    );

    function enforceIsValidator(address account) internal view {
        require(account == validator, "BridgeERC20: Only validator!");
    }

    function getTransferId(uint256 _nonce, bytes32 _initialChain) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_nonce, _initialChain));
    }

    function tranferToOtherChain(
        address _transferedToken,
        uint256 _amount,
        bytes32 _targetChain,
        bytes calldata _recipient
    ) external {
        require(_amount > 0, "BridgeERC20: _amount < 0");
        require(registeredChains[_targetChain], "BridgeERC20: chain not registered");

        bool isIssuedToken = issuedTokens[_transferedToken];
        bytes32 initialChain = currentChain;
        uint256 _nonce = nonce++;
        bytes32 originalChain;
        bytes memory originalToken;
        string memory tokenName;
        string memory tokenSymbol;
        uint8 tokenDecimals;

        if (isIssuedToken) {
            // There ISSUED token
            IIssuedERC20 issuedToken = IIssuedERC20(_transferedToken);
            (originalChain, originalToken, tokenName, tokenSymbol, tokenDecimals) = issuedToken.getOriginalTokenInfo();
            if(originalChain == _targetChain && isProxyChain) {
                issuedToken.permissionedTransferFrom(msg.sender, address(this), _amount);
            } else {
                issuedToken.burn(msg.sender, _amount);
            }
        } else {
            // There ORIGINAL token
            IERC20Metadata token = IERC20Metadata(_transferedToken);
            originalChain = initialChain;
            originalToken = abi.encode(_transferedToken);
            tokenName = token.name();
            tokenSymbol = token.symbol();
            tokenDecimals = token.decimals();
            token.safeTransferFrom(msg.sender, address(this), _amount);
        }

        emit TransferToOtherChain(
            getTransferId(_nonce, initialChain),
            _nonce,
            initialChain,
            originalChain,
            originalToken,
            _targetChain,
            _amount,
            abi.encode(msg.sender),
            abi.encode(_recipient),
            tokenName,
            tokenSymbol,
            tokenDecimals
        );
    }

    struct TokenInfo {
        string name;
        string symbol;
        uint8 decimals;
    }

    function tranferFromOtherChain(
        uint256 _externalNonce,
        bytes32 _originalChain,
        bytes calldata _originalToken,
        bytes32 _initialChain,
        bytes32 _targetChain,
        uint256 _amount,
        bytes calldata _sender,
        bytes calldata _recipient,
        TokenInfo _tokenCreateInfo
    ) external {
        enforceIsValidator(msg.sender);
    }
}

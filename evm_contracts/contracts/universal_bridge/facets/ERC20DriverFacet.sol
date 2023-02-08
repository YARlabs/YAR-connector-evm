// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { LibERC20Driver } from "../libraries/LibERC20Driver.sol";
import { LibValidatorController } from "../libraries/LibValidatorController.sol";
import { LibChainInfo } from "../libraries/LibChainInfo.sol";
import { IERC20Driver } from "../interfaces/IERC20Driver.sol";
import { IIssuedToken } from "../interfaces/IIssuedToken.sol";
import { UniversalAddressUtils } from "../../utils/UniversalAddressUtils.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ERC20DriverFacet is IERC20Driver {
    using SafeERC20 for IERC20;

    function getIssuedTokenAddressERC20(
        string calldata _originalChainName,
        string calldata _originalTokenAddress
    ) external view returns (address) {
        return LibERC20Driver.getIssuedTokenAddress(_originalChainName, _originalTokenAddress);
    }

    function getTokenIdERC20(
        string calldata _originalChainName,
        string calldata _originalTokenAddress
    ) external pure returns (bytes32) {
        return LibERC20Driver.getTokenId(_originalChainName, _originalTokenAddress);
    }

    function isIssuedTokenCreatedERC20(
        string calldata _originalChainName,
        string calldata _originalTokenAddress
    ) external view returns (bool) {
        return LibERC20Driver.isIssuedTokenCreated(_originalChainName, _originalTokenAddress);
    }

    function initialBlockNumberERC20() external view returns (uint256) {
        return LibERC20Driver.initialBlockNumber();
    }

    function isExternalNonceAlreadyRegisteredERC20(
        string calldata _initialChainName,
        uint256 _externalNonce
    ) external view returns (bool) {
        return LibERC20Driver.isExternalNonceAlreadyRegistered(_initialChainName, _externalNonce);
    }

    function tranferToOtherChainERC20(
        address _transferedToken,
        uint256 _amount,
        string calldata _targetChainName,
        UniversalAddressUtils.UniversalAddress calldata _recipient
    ) external {
        // Connect to storage
        LibERC20Driver.ERC20DriverStorage storage ds = LibERC20Driver.diamondStorage();
        LibChainInfo.ChainInfoStorage storage chainInfoStorage = LibChainInfo.diamondStorage();

        require(_amount > 0, "LibERC20Driver.tranferToOtherChain: amount <= 0");

        require(
            ds.registeredChains[_targetChainName],
            "LibERC20Driver.tranferToOtherChain: chain not registered"
        );

        require(
            UniversalAddressUtils.isValidUniversalAddress(_recipient),
            "LibERC20Driver.tranferToOtherChain: recipient address not valid"
        );

        bytes32 tokenId = ds.tokenIdByIssuedToken[_transferedToken];

        string memory initialChainName = chainInfoStorage.chainName;
        string memory originalChainName;
        string memory originalTokenAddress;

        if (tokenId != 0) {
            // There ISSUED token
            IIssuedToken issuedToken = IIssuedToken(_transferedToken);
            (originalChainName, originalTokenAddress) = issuedToken.getOriginalTokenInfo();

            bytes32 originalChainNameHash = keccak256(abi.encodePacked(originalChainName));
            bytes32 targetChainNameHash = keccak256(abi.encodePacked(_targetChainName));

            if (originalChainNameHash != targetChainNameHash && chainInfoStorage.isProxyChain) {
                // In proxy chain
                // LOCK ISSUED TOKENS
                issuedToken.permissionedTransferFrom(msg.sender, address(this), _amount);
            } else {
                // BURN ISSUED TOKENS
                issuedToken.burn(msg.sender, _amount);
            }
        } else {
            // There ORIGINAL token
            originalChainName = initialChainName;
            originalTokenAddress = Strings.toHexString(_transferedToken);

            ds.originalTokenAddressByString[originalTokenAddress] = _transferedToken;

            // LOCK ORIGIANL TOKENS
            // Need approve first
            IERC20(_transferedToken).safeTransferFrom(msg.sender, address(this), _amount);
        }

        // Send event to validator [required]
        uint256 nonce = ds.nonce++;
        emit ERC20DriverTransferToOtherChain(
            LibERC20Driver.getTranferId(nonce, initialChainName),
            nonce,
            initialChainName,
            originalChainName,
            originalTokenAddress,
            _targetChainName,
            _amount,
            UniversalAddressUtils.toString(msg.sender),
            UniversalAddressUtils.toString(_recipient)
        );
    }

    function tranferFromOtherChainERC20(
        uint256 _externalNonce,
        string calldata _originalChainName,
        string calldata _originalTokenAddress,
        string calldata _initialChainName,
        string calldata _targetChainName,
        uint256 _amount,
        string calldata _sender,
        UniversalAddressUtils.UniversalAddress calldata _recipient,
        LibERC20Driver.TokenCreateInfo calldata _tokenCreateInfo
    ) external {
        // Only Validator
        LibValidatorController.enforceIsValidator();

        // Connect to storage
        LibERC20Driver.ERC20DriverStorage storage ds = LibERC20Driver.diamondStorage();

        require(
            !ds.registeredExternalNoncesByChainName[_initialChainName][_externalNonce],
            "LibERC20Driver: nonce already registered"
        );
        ds.registeredExternalNoncesByChainName[_initialChainName][_externalNonce] = true;

        require(
            UniversalAddressUtils.isValidUniversalAddress(_recipient),
            "LibERC20Driver.tranferFromOtherChain: recipient address not valid"
        );

        LibChainInfo.ChainInfoStorage storage chainInfoStorage = LibChainInfo.diamondStorage();
        bytes32 currentChainNameHash = keccak256(abi.encodePacked(chainInfoStorage.chainName));
        bytes32 originalChainNameHash = keccak256(abi.encodePacked(_originalChainName));
        bytes32 targetChainNameHash = keccak256(abi.encodePacked(_targetChainName));
        bytes32 initialChainNameHash = keccak256(abi.encodePacked(_initialChainName));

        require(
            initialChainNameHash != currentChainNameHash,
            "LibERC20Driver.tranferFromOtherChain: Initial chain can not be equal current chain"
        );

        require(
            ds.registeredChains[_initialChainName],
            "LibERC20Driver.tranferFromOtherChain: Initial chain not registered"
        );

        if (currentChainNameHash == targetChainNameHash) {
            // This target chain

            require(
                UniversalAddressUtils.hasEvmAddress(_recipient),
                "LibERC20Driver: recipient not has evm address"
            );

            if (currentChainNameHash == originalChainNameHash) {
                // This Original chain
                // Withdraw original tokens
                IERC20(ds.originalTokenAddressByString[_originalTokenAddress]).safeTransfer(
                    _recipient.evmAddress,
                    _amount
                );
            } else {
                // This Secondary chain
                // Mint issued tokens

                address issuedTokenAddress = LibERC20Driver
                    .getIssuedTokenAddressOrPublishTokenIfNotExists(
                        _originalChainName,
                        _originalTokenAddress,
                        _tokenCreateInfo
                    );

                IIssuedToken(issuedTokenAddress).mint(_recipient.evmAddress, _amount);
            }

            emit ERC20DriverTransferFromOtherChain(
                LibERC20Driver.getTranferId(_externalNonce, _initialChainName),
                _externalNonce,
                _originalChainName,
                _originalTokenAddress,
                _initialChainName,
                _targetChainName,
                _amount,
                _sender,
                UniversalAddressUtils.toString(_recipient)
            );
        } else {
            // This Proxy chain
            // Mint and lock issued tokens
            // And send event to target bridge
            require(
                chainInfoStorage.isProxyChain,
                "LibERC20Driver: Only proxy bridge can be currentChainName != targetChainName"
            );

            address issuedTokenAddress = LibERC20Driver
                .getIssuedTokenAddressOrPublishTokenIfNotExists(
                    _originalChainName,
                    _originalTokenAddress,
                    _tokenCreateInfo
                );

            if (targetChainNameHash == originalChainNameHash) {
                // BURN PROXY ISSUED TOKENS
                IIssuedToken(issuedTokenAddress).burn(address(this), _amount);
            } else if (initialChainNameHash == originalChainNameHash) {
                // LOCK PROXY ISSUED TOKENS
                IIssuedToken(issuedTokenAddress).mint(address(this), _amount);
            }

            // Send event to validator [required]
            emit ERC20DriverTransferToOtherChain(
                LibERC20Driver.getTranferId(_externalNonce, _initialChainName),
                _externalNonce,
                _initialChainName,
                _originalChainName,
                _originalTokenAddress,
                _targetChainName,
                _amount,
                _sender,
                UniversalAddressUtils.toString(_recipient)
            );
        }
    }

    function setChainRegistrationERC20(string calldata _chainName, bool _value) external {
        // Only Validator
        LibValidatorController.enforceIsValidator();
        LibERC20Driver.setChainRegistration(_chainName, _value);
    }

    function nonceERC20() external view returns (uint256) {
        return LibERC20Driver.nonce();
    }

    function balancesERC20(
        string calldata _originalChainName,
        string calldata _originalTokenAddress,
        address _account
    ) external view returns (uint256) {
        return LibERC20Driver.balances(_originalChainName, _originalTokenAddress, _account);
    }

    function setIssuedTokenImplementation(address _issuedTokenImplementation) external {
        // Only Validator
        LibValidatorController.enforceIsValidator();

        LibERC20Driver.setIssuedTokenImplementation(_issuedTokenImplementation);
    }

    function getTranferIdERC20(uint256 _nonce, string calldata _initialChainName)
        external
        pure
        returns (bytes32)
    {
        return LibERC20Driver.getTranferId(_nonce, _initialChainName);
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

library UniversalAddressUtils {
    struct UniversalAddress {
        address evmAddress;
        string noEvmAddress;
    }

    function isValidUniversalAddress(UniversalAddress calldata _universalAddress)
        internal
        pure
        returns (bool)
    {
        return
            (_universalAddress.evmAddress == address(0)) !=
            (bytes(_universalAddress.noEvmAddress).length == 0);
    }

    function toString(UniversalAddress calldata _universalAddress) internal pure returns(string memory) {
        if(hasEvmAddress(_universalAddress)) {
            return toString(_universalAddress.evmAddress);
        } else {
            return _universalAddress.noEvmAddress;
        }
    }

    function toString(address _account) internal pure returns(string memory) {
        return Strings.toHexString(_account);
    }
    
    function hasEvmAddress(UniversalAddress calldata _universalAddress) internal pure returns(bool ) {
        return _universalAddress.evmAddress != address(0);
    }
}

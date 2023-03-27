// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { Proxy } from "@openzeppelin/contracts/proxy/Proxy.sol";
import { ERC1967Upgrade } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Upgrade.sol";

contract ERC1967ProxyCreate2 is Proxy, ERC1967Upgrade {
    /**
     * @dev Initializes the upgradeable proxy with an initial implementation specified by `_logic`.
     *
     * If `_data` is nonempty, it's used as data in a delegate call to `_logic`. This will typically be an encoded
     * function call, and allows initializing the storage of the proxy like a Solidity constructor.
     */
    bool internal isInit;

    function init(address _logic, bytes memory _data) external {
        require(!isInit, "ERC1967ProxyCreate2: already init");
        _upgradeToAndCall(_logic, _data, false);
        isInit = true;
    }

    /**
     * @dev Returns the current implementation address.
     */
    function _implementation() internal view virtual override returns (address impl) {
        return ERC1967Upgrade._getImplementation();
    }
}

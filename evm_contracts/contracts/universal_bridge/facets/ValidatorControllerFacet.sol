// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import { LibValidatorController } from "../libraries/LibValidatorController.sol";
import { IValidatorController } from "../interfaces/IValidatorController.sol";

contract ValidatorControllerFacet is IValidatorController {
    function setValidator(address _newValidator) external {
        // Only validator
        LibValidatorController.enforceIsValidator();
        LibValidatorController.setValidator(_newValidator);
    }

    function validator() external view returns (address) {
        return LibValidatorController.validator();
    }
}

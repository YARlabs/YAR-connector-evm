// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

interface IValidatorController {
    event ValidatorTransferred(address indexed previousOwner, address indexed newOwner);

    function setValidator(address _newValidator) external;

    function validator() external view returns (address);
}

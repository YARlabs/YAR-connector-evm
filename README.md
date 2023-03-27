YAR - 0x88243e88525a258200bf5ca869571208956d07a0fa57c175fe0c198c7a0c5c26
POLYGON - 0xc5a260213bed973cb2f8d4637aa3ef27b0571649e067f5604af98967165ee957
BINANCE - 0x888ddba0dff61733aea9d240a62a83cee02ac4a5c8e58fbc448c21d3b250d4bb
ETHEREUM - 0xf9b1779dd736d62f9a5815f9f11cb752f6342e8584a01f22e1b19b9a8cb5694e

Legacy ->

# YAR-bridge

# Architecture

[PDF](arch.pdf)

# EVM Contracts



Create config file evm_contracts/config.json, see example evm_contracts/config.example.json
If you just want to run local tests, you don't have to change anything.
If you are going to deploy or verify, fill in the fields "validatorPrivateKey" and "etherscan.apiKey"

Then install all dependencies with the command

```shell
./evm_contracts$ npm i
```

## Local tests 

```shell
./evm_contracts$ npm run test
```

*The test uses the etherscan API, if it is not available, then the test will fail with an error approximately in the ERC20Minter file

## Deploy and Verify

Scripts for deployment and verification can be found in evm_contracts/package.json
Their settings can be found in evm_contracts/config.json

For deployment
```shell
./evm_contracts$ npm run deploy:*
```

For verification
```shell
./evm_contracts$ npm run verify:*
```


# Validator

Install all dependencies with the command

```shell
./validator/app$ npm i
```

Having previously deployed all smart contracts, you need to enter their addresses and private keys corresponding to the role of the validator of these contracts in the validator/app/config.json configuration file.
If you do not have this file, you must create it from validator/app/config.example.json by filling in all fields

## Validator config

```json
{
  "bridges": [
    {
      "chainName": "YAR", - Network name in uppercase
      "driver": "EvmBridgeDriver", - Default value
      "startFromBlock": 0, - *Optional field*, if it is not present, the validator starts from the current block, if it is, it synchronizes from the specified block (or the block when the bridge was deployed, if it is higher)
      "blockConfirmationsCount": 1, - The number of blocks that must pass to within its execution. Minimum 1
      "address": "0xCA9df7271c2411e83D3fdfD1e916C6077a8a6BD1", - bridge smart contract address
      "providerUrl": "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", - RPC provider url
      "validatorPrivateKey": "0x30265a84a58ee2c2bd9e6ec64963d098535b6a1b9f985ca45d9834ae5bf79ce8" - private key of the validator
    },
  ]
}
```

## Validator tests

First you need to raise a local node

```shell
./evm_contracts$ npx hardhat node --fulltrace
```

Then run the validator with the command

```shell
./validator/app$ npm run dev
```

After that, you need to run scripts of elementary translations from ./evm_contracts/scripts in semi-automatic mode, waiting after each script for the validator to execute the transaction

```shell
./evm_contracts$ npx hardhat --network localhost run ./scripts/100-original_to_yar.ts
```

```shell
./evm_contracts$ npx hardhat --network localhost run ./scripts/100-yar_to_original.ts
```

```shell
./evm_contracts$ npx hardhat --network localhost run ./scripts/200-original_to_secondary.ts
```

```shell
./evm_contracts$ npx hardhat --network localhost run ./scripts/200-secondary_to_original.ts
```

```shell
./evm_contracts$ npx hardhat --network localhost run ./scripts/200-original_to_secondary.ts
```

```shell
./evm_contracts$ npx hardhat --network localhost run ./scripts/300-secondary_to_third.ts
```

```shell
./evm_contracts$ npx hardhat --network localhost run ./scripts/300-third_to_secondary.ts
```

```shell
./evm_contracts$ npx hardhat --network localhost run ./scripts/400-yar_original_to_secondary.ts
```

```shell
./evm_contracts$ npx hardhat --network localhost run ./scripts/401-secondary_to_yar_original.ts
```

Transaction information can be viewed in the validator terminal, or in the node terminal (if the --fulltrace flag is enabled)

## Run validator

Build a docker container

```shell
./validator$  docker build . -t admin/validator
```

And run

```shell
./validator$ docker run -p 49160:8080 -d admin/validator
```

*Docker ports don't matter
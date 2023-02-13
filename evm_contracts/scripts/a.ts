import { IERC20Metadata__factory } from '../typechain-types'
import { UniversalBridgeContracts } from '../utils/UniversalBridgeContracts'
import { Wallet, ethers } from 'ethers'

// Количество транзакций
const COUNT = 10

// Отправляет токены из ExternalBridge в InternalBridge
async function main() {
  const yarValidator = new Wallet('0x30265a84a58ee2c2bd9e6ec64963d098535b6a1b9f985ca45d9834ae5bf79ce8', new ethers.providers.JsonRpcProvider('http://95.217.57.15:18545'))
//   const polygonValidator = new Wallet('0x30265a84a58ee2c2bd9e6ec64963d098535b6a1b9f985ca45d9834ae5bf79ce8', new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com'))
//   const binanceValidator = new Wallet('0x30265a84a58ee2c2bd9e6ec64963d098535b6a1b9f985ca45d9834ae5bf79ce8', new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-2-s3.binance.org:8545'))
//   const ethereumValidator = new Wallet('0x30265a84a58ee2c2bd9e6ec64963d098535b6a1b9f985ca45d9834ae5bf79ce8', new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/avalanche_fuji'))
  
//   const user1 = polygonValidator
  const user2 = yarValidator
  const yarBridge = await UniversalBridgeContracts.factory('0x983ebfF923351fA707007663f9dBF83A34A84279', yarValidator)
//   const polygonBridge = await UniversalBridgeContracts.factory('0x24F93153E0b9780A99c328B1D12276B3D3D54C93', polygonValidator)
//   const binanceBridge = await UniversalBridgeContracts.factory('0xaA9578F472cCC04ea340c6EE58fd3992931b8c5D', binanceValidator)
//   const ethereumBridge = await UniversalBridgeContracts.factory('0x983ebfF923351fA707007663f9dBF83A34A84279', ethereumValidator)

//   const originalBridge = polygonBridge
//   const secondaryBridge = binanceBridge
//   const thirdBridge = ethereumBridge
//   const sender = ethereumValidator
//   const recipient = polygonValidator

  // Token
//   const testToken = IERC20Metadata__factory.connect('0xfe4f5145f6e09952a5ba9e956ed0c25e3fa4c7f1', yarBridge)
  // const testTokenAmount = await testToken.balanceOf(sender.address)
  //  await testToken.approve(originalBridge.address, testTokenAmount, {gasLimit: 800000})

  const issuedTokenAddress = await yarBridge.erc20Driver.getIssuedTokenAddressERC20(
    'POLYGON',
    '0xA1a80A39b28cbD0E96b737C5D366d24b8783C85C'.toLowerCase()
  )

  console.log(issuedTokenAddress)
//   const issuedToken = IERC20Metadata__factory.connect(issuedTokenAddress, sender)
//   const issuedTokenBalance = await issuedToken.balanceOf(sender.address)

//   await (await thirdBridge.erc20Driver.connect(sender).tranferToOtherChainERC20(
//     issuedToken.address, // _transferedToken
//     issuedTokenBalance, // _amount
//     originalBridge.chainName, // _targetChainName
//     {
//       evmAddress: recipient.address,
//       noEvmAddress: '',
//     }, // _recipient
//     {gasLimit: 800000}
//   )).wait()
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
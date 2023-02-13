import { IERC20Metadata__factory } from '../typechain-types'
import { DiamondUtils } from '../utils/DiamondUtils'
import { UniversalBridgeContracts } from '../utils/UniversalBridgeContracts'
import { Wallet, ethers } from 'ethers'

// Количество транзакций
const COUNT = 10

// Отправляет токены из ExternalBridge в InternalBridge
async function main() {
  const yarValidator = new Wallet(
    '0x30265a84a58ee2c2bd9e6ec64963d098535b6a1b9f985ca45d9834ae5bf79ce8',
    new ethers.providers.JsonRpcProvider('http://95.217.57.15:18545'),
  )
  const polygonValidator = new Wallet(
    '0x30265a84a58ee2c2bd9e6ec64963d098535b6a1b9f985ca45d9834ae5bf79ce8',
    new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com'),
  )
  const binanceValidator = new Wallet(
    '0x30265a84a58ee2c2bd9e6ec64963d098535b6a1b9f985ca45d9834ae5bf79ce8',
    new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-2-s3.binance.org:8545'),
  )
  const ethereumValidator = new Wallet(
    '0x30265a84a58ee2c2bd9e6ec64963d098535b6a1b9f985ca45d9834ae5bf79ce8',
    new ethers.providers.JsonRpcProvider(
      'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    ),
  )

  const yarBridge = await UniversalBridgeContracts.factory(
    '0x983ebfF923351fA707007663f9dBF83A34A84279',
    yarValidator,
  )
  const polygonBridge = await UniversalBridgeContracts.factory(
    '0x427f5831e930af1d6de95007e080109621bf1ea0',
    polygonValidator,
  )
  const binanceBridge = await UniversalBridgeContracts.factory(
    '0x4992e252ff1a7c9544b58dbbd82ca408a24b8ca2',
    binanceValidator,
  )
  const ethereumBridge = await UniversalBridgeContracts.factory(
    '0xf52452e644789e18878edd32abdcff31a79dac19',
    ethereumValidator,
  )

  console.log('BEFORE')
  const tx = await ethereumBridge.dimondCut.diamondCut(
    [
      {
        facetAddress: '0x292e94BfFae39A26cc0994E03386E830018f5B82',
        action: DiamondUtils.FacetCutAction.Replace,
        functionSelectors: ['0x335fe99e'],
      },
    ],
    ethers.constants.AddressZero,
    ethers.constants.HashZero,
    {
      gasLimit: '800000'
    }
  )

  await tx.wait()

  console.log(await ethereumBridge.erc20Driver.isIssuedToken('0x427f5831e930af1d6de95007e080109621bf1ea0'))
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})

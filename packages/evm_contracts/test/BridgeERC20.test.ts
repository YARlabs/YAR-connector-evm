import { deployments, ethers } from 'hardhat'
import { BridgeERC20, BridgeERC20__factory, IERC20Metadata__factory } from '../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  ALETH,
  CRV3,
  DAI,
  FRAX,
  HBTC,
  LUSD,
  MIM,
  RENBTC,
  SBTC,
  STETH,
  USDC,
  USDT,
  WBTC,
  WETH,
} from '../constants/externalAddresses'
import ERC20MinterV2 from './utils/ERC20MinterV2'
import {
  proxyTranferFromOtherChainERC20,
  tranferFromOtherChainERC20,
  tranferToOtherChainERC20,
} from './BridgeERC20.utils'

interface ITestCase {
  token: string
}

const testCases: Array<ITestCase> = [
  {
    token: USDT,
  },
  {
    token: DAI,
  },
  {
    token: CRV3,
  },
  {
    token: HBTC,
  },
  {
    token: RENBTC,
  },
  {
    token: ALETH,
  },
  {
    token: LUSD,
  },
  {
    token: SBTC,
  },
]

describe('BridgeERC20 Unit test', () => {
  for (const testCase of testCases) {
    test(testCase)
  }
})

function test(testCase: ITestCase) {
  const testTokenAddress = testCase.token

  describe(`BridgeERC20 case data: ${JSON.stringify(testCase)}`, () => {
    let yarBridge: BridgeERC20
    let polygonBridge: BridgeERC20
    let binanceBridge: BridgeERC20
    let ethereumBridge: BridgeERC20

    let initSnapshot: string

    let validator: SignerWithAddress
    let user1: SignerWithAddress
    let user2: SignerWithAddress

    before(async () => {
      const accounts = await ethers.getSigners()
      validator = accounts[0]
      user1 = accounts[9]
      user2 = accounts[8]

      await deployments.fixture([
        'YarBridgeERC20',
        'PolygonBridgeERC20',
        'BinanceBridgeERC20',
        'EthereumBridgeERC20',
      ])
      const YarBridgeDeployment = await deployments.get('YarBridgeERC20')
      const PolygonBridgeDeployment = await deployments.get('PolygonBridgeERC20')
      const BinanceBridgeDeployment = await deployments.get('BinanceBridgeERC20')
      const EthereumBridgeDeployment = await deployments.get('EthereumBridgeERC20')

      yarBridge = BridgeERC20__factory.connect(YarBridgeDeployment.address, validator)
      polygonBridge = BridgeERC20__factory.connect(PolygonBridgeDeployment.address, validator)
      binanceBridge = BridgeERC20__factory.connect(BinanceBridgeDeployment.address, validator)
      ethereumBridge = BridgeERC20__factory.connect(EthereumBridgeDeployment.address, validator)

      initSnapshot = await ethers.provider.send('evm_snapshot', [])
    })

    afterEach(async () => {
      await ethers.provider.send('evm_revert', [initSnapshot])
      initSnapshot = await ethers.provider.send('evm_snapshot', [])
    })

    it('Regular unit: ORIGINAL <---> YAR(issued tokens)', async () => {
      // Used bridges
      // YarBridge and:
      const originalBridge = polygonBridge

      // Test token
      const testToken = IERC20Metadata__factory.connect(testTokenAddress, user1)
      await ERC20MinterV2.mint(testToken.address, user1.address, 1000)
      const testTokenAmount = await testToken.balanceOf(user1.address)

      // Original approve first
      await testToken.connect(user1).approve(originalBridge.address, testTokenAmount)

      // User ORIGINAL -> YAR
      const eventStep1 = await tranferToOtherChainERC20({
        logId: 'logId-100',
        transferedTokenAddress: testToken.address,
        originalTokenAddress: testToken.address,
        amount: testTokenAmount,
        originalChain: originalBridge,
        initialChain: originalBridge,
        targetChain: yarBridge,
        sender: user1,
        recipient: user2,
      })

      // VALIDATOR ORIGINAL -> YAR
      const yarIssuedTokenAddress = await tranferFromOtherChainERC20({
        logId: 'logId-200',
        event: eventStep1,
        targetChain: yarBridge,
        validator: validator,
      })

      // *** REVERSE

      // User YAR ---> ORIGINAL
      const eventStep2 = await tranferToOtherChainERC20({
        logId: 'logId-300',
        transferedTokenAddress: yarIssuedTokenAddress,
        originalTokenAddress: testToken.address,
        amount: testTokenAmount,
        originalChain: originalBridge,
        initialChain: yarBridge,
        targetChain: originalBridge,
        sender: user2,
        recipient: user1,
      })

      // VALIDATOR YAR -> ORIGINAL
      await tranferFromOtherChainERC20({
        logId: 'logId-400',
        event: eventStep2,
        targetChain: originalBridge,
        validator: validator,
      })
    })

    it('Regular unit: SECONDARY <---> YAR(issued tokens)', async () => {
      // Used bridges
      // YarBridge and:
      const originalBridge = polygonBridge
      const secondaryBridge = binanceBridge

      // Test token
      const testToken = IERC20Metadata__factory.connect(testTokenAddress, user1)
      await ERC20MinterV2.mint(testToken.address, user1.address, 1000)
      const testTokenAmount = await testToken.balanceOf(user1.address)

      // *** Before cretate ISSUED tokens on YAR

      // Original approve first
      await testToken.connect(user1).approve(originalBridge.address, testTokenAmount)

      // User ORIGIINAL ---> YAR
      const eventStep1 = await tranferToOtherChainERC20({
        logId: 'logId-500',
        transferedTokenAddress: testToken.address,
        originalTokenAddress: testToken.address,
        amount: testTokenAmount,
        originalChain: originalBridge,
        initialChain: originalBridge,
        targetChain: yarBridge,
        sender: user1,
        recipient: user2,
      })

      // VALIDATOR ORIGINAL -> YAR
      const yarIssuedTokenAddress = await tranferFromOtherChainERC20({
        logId: 'logId-600',
        event: eventStep1,
        targetChain: yarBridge,
        validator: validator,
      })

      // *** Then test

      // User YAR ---> SECONDARY
      const eventStep2 = await tranferToOtherChainERC20({
        logId: 'logId-700',
        transferedTokenAddress: yarIssuedTokenAddress,
        originalTokenAddress: testToken.address,
        amount: testTokenAmount,
        originalChain: originalBridge,
        initialChain: yarBridge,
        targetChain: secondaryBridge,
        sender: user2,
        recipient: user1,
      })

      // VALIDATOR YAR -> SECONDARY
      const secondaryIssuedTokenAddress = await tranferFromOtherChainERC20({
        logId: 'logId-800',
        event: eventStep2,
        targetChain: secondaryBridge,
        validator: validator,
      })

      // *** Reverse

      // User SECONDARY ---> YAR
      const eventStep3 = await tranferToOtherChainERC20({
        logId: 'logId-900',
        transferedTokenAddress: secondaryIssuedTokenAddress,
        originalTokenAddress: testToken.address,
        amount: testTokenAmount,
        originalChain: originalBridge,
        initialChain: secondaryBridge,
        targetChain: yarBridge,
        sender: user1,
        recipient: user2,
      })

      // VALIDATOR SECONDARY -> YAR
      // const yarIssuedTokenAddress =
      await tranferFromOtherChainERC20({
        logId: 'logId-1000',
        event: eventStep3,
        targetChain: yarBridge,
        validator: validator,
      })
    })

    it('Regular unit: ORIGINAL <---> YAR(issued tokens) <---> SECONDARY', async () => {
      // Used bridges
      // Yar and:
      const originalBridge = polygonBridge
      const secondaryBridge = binanceBridge

      // Test token
      const testToken = IERC20Metadata__factory.connect(testTokenAddress, user1)
      await ERC20MinterV2.mint(testToken.address, user1.address, 1000)
      const testTokenAmount = await testToken.balanceOf(user1.address)

      await testToken.connect(user1).approve(originalBridge.address, testTokenAmount)

      // User ORIGIINAL ---> SECONDARY
      const eventStep1 = await tranferToOtherChainERC20({
        logId: 'logId-1100',
        transferedTokenAddress: testToken.address,
        originalTokenAddress: testToken.address,
        amount: testTokenAmount,
        originalChain: originalBridge,
        initialChain: originalBridge,
        targetChain: secondaryBridge,
        sender: user1,
        recipient: user2,
      })

      // VALIDATOR ORIGINAL --PROXY--> SECONDARY
      const secondaryIssuedTokenAddress = await proxyTranferFromOtherChainERC20({
        logId: 'logId-1200',
        event: eventStep1,
        yarChain: yarBridge,
        targetChain: secondaryBridge,
        validator,
      })

      // *** REVERSE

      // User SECONDARY ---> ORIGINAL
      const eventStep2 = await tranferToOtherChainERC20({
        logId: 'logId-1300',
        transferedTokenAddress: secondaryIssuedTokenAddress,
        originalTokenAddress: testToken.address,
        amount: testTokenAmount,
        originalChain: originalBridge,
        initialChain: secondaryBridge,
        targetChain: originalBridge,
        sender: user2,
        recipient: user1,
      })

      // VALIDATOR SECONDARY --PROXY--> ORIGINAL
      await proxyTranferFromOtherChainERC20({
        logId: 'logId-1400',
        event: eventStep2,
        yarChain: yarBridge,
        targetChain: originalBridge,
        validator,
      })
    })

    it('Regular unit: SECONDARY <---> YAR(issued tokens) <---> THIRD', async () => {
      // Used bridges
      // Yar and:
      const originalBridge = polygonBridge
      const secondaryBridge = binanceBridge
      const thirdBridge = ethereumBridge

      // Test token
      const testToken = IERC20Metadata__factory.connect(testTokenAddress, user1)
      await ERC20MinterV2.mint(testToken.address, user1.address, 1000)
      const testTokenAmount = await testToken.balanceOf(user1.address)

      /// *** Before trasfer from ORIGIANL to SECONDARY

      await testToken.connect(user1).approve(originalBridge.address, testTokenAmount)

      // User ORIGINAL to SECONDARY
      const eventStep1 = await tranferToOtherChainERC20({
        logId: 'logId-1500',
        transferedTokenAddress: testToken.address,
        originalTokenAddress: testToken.address,
        amount: testTokenAmount,
        originalChain: originalBridge,
        initialChain: originalBridge,
        targetChain: secondaryBridge,
        sender: user1,
        recipient: user2,
      })

      // VALIDATOR ORIGINAL --PROXY--> SECONDARY
      const secondaryIssuedTokenAddress = await proxyTranferFromOtherChainERC20({
        logId: 'logId-1600',
        event: eventStep1,
        yarChain: yarBridge,
        targetChain: secondaryBridge,
        validator,
      })

      // *** Then test

      // User SECONDARY ---> THIRD
      const eventStep2 = await tranferToOtherChainERC20({
        logId: 'logId-1700',
        transferedTokenAddress: secondaryIssuedTokenAddress,
        originalTokenAddress: testToken.address,
        amount: testTokenAmount,
        originalChain: originalBridge,
        initialChain: secondaryBridge,
        targetChain: thirdBridge,
        sender: user2,
        recipient: user1,
      })

      // VALIDATOR SECONDARY --PROXY--> THIRD
      const thirdIssuedTokenAddress = await proxyTranferFromOtherChainERC20({
        logId: 'logId-1800',
        event: eventStep2,
        yarChain: yarBridge,
        targetChain: thirdBridge,
        validator,
      })

      // *** REVERSE

      // User THIRD ---> SECONDARY
      const eventStep3 = await tranferToOtherChainERC20({
        logId: 'logId-1900',
        transferedTokenAddress: thirdIssuedTokenAddress,
        originalTokenAddress: testToken.address,
        amount: testTokenAmount,
        originalChain: originalBridge,
        initialChain: thirdBridge,
        targetChain: secondaryBridge,
        sender: user1,
        recipient: user2,
      })

      // VALIDATOR THIRD --PROXY--> SECONDARY
      await proxyTranferFromOtherChainERC20({
        logId: 'logId-2000',
        event: eventStep3,
        yarChain: yarBridge,
        targetChain: secondaryBridge,
        validator,
      })
    })

    it('Regular unit: YAR(is ORIGINAL, not issued tokens) <---> SECONDARY', async () => {
      // Used bridges
      // YarBridge and:
      const originalBridge = yarBridge
      const secondaryBridge = polygonBridge

      // Test token
      const testToken = IERC20Metadata__factory.connect(testTokenAddress, user1)
      await ERC20MinterV2.mint(testToken.address, user1.address, 1000)
      const testTokenAmount = await testToken.balanceOf(user1.address)

      // Original approve first
      await testToken.connect(user1).approve(originalBridge.address, testTokenAmount)

      // User YAR(ORIGINAL) ---> SECONDARY
      const eventStep1 = await tranferToOtherChainERC20({
        transferedTokenAddress: testToken.address,
        logId: 'logId-2100',
        originalTokenAddress: testToken.address,
        amount: testTokenAmount,
        originalChain: originalBridge,
        initialChain: originalBridge,
        targetChain: secondaryBridge,
        sender: user1,
        recipient: user2,
      })

      // VALIDATOR YAR(Original) --PROXY--> SECONDARY
      const secondaryIssuedTokenAddress = await tranferFromOtherChainERC20({
        logId: 'logId-2200',
        event: eventStep1,
        targetChain: secondaryBridge,
        validator: validator,
      })

      // *** REVERSE

      // User SECONDARY ---> YAR(ORIGINAL)
      const eventStep2 = await tranferToOtherChainERC20({
        logId: 'logId-2300',
        transferedTokenAddress: secondaryIssuedTokenAddress,
        originalTokenAddress: testToken.address,
        amount: testTokenAmount,
        originalChain: originalBridge,
        initialChain: secondaryBridge,
        targetChain: originalBridge,
        sender: user2,
        recipient: user1,
      })

      // VALIDATOR SECONDARY ---> YAR(Original)
      await tranferFromOtherChainERC20({
        logId: 'logId-2400',
        event: eventStep2,
        targetChain: originalBridge,
        validator: validator,
      })
    })
  })
}

import { deployments, ethers } from 'hardhat'
import { IERC20Metadata__factory } from '../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ALETH, CRV3, DAI, FRAX, HBTC, LUSD, MIM, RENBTC, SBTC, STETH, USDC, USDT, WBTC, WETH } from '../constants/externalAddresses'
import { assert, expect } from 'chai'
import { UniversalBridgeContracts } from '../utils/UniversalBridgeContracts'
import ERC20MinterV2 from './utils/ERC20MinterV2'
import { BigNumber } from 'ethers'
import {
  parseBridgeTransferEvent,
  proxyTranferFromOtherChainERC20,
  tranferFromOtherChainERC20,
  tranferToOtherChainERC20,
} from './UniversalBridges.utils'

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
    token: USDC,
  },
  {
    token: CRV3,
  },
  {
    token: FRAX,
  },
  {
    token: HBTC,
  },
  {
    token: MIM,
  },
  {
    token: RENBTC,
  },
  {
    token: ALETH,
  },
  {
    token: STETH,
  },
  {
    token: LUSD,
  },
  {
    token: SBTC,
  },
]

describe('UniversalBridge Unit test', () => {
  for (const testCase of testCases) {
    test(testCase)
  }
})

function test(testCase: ITestCase) {
  const testTokenAddress = testCase.token

  describe(`UniversalBridge case data: ${JSON.stringify(testCase)}`, () => {
    let yarBridge: UniversalBridgeContracts
    let polygonBridge: UniversalBridgeContracts
    let binanceBridge: UniversalBridgeContracts
    let ethereumBridge: UniversalBridgeContracts

    let initSnapshot: string

    let owner: SignerWithAddress
    let yarValidator: SignerWithAddress
    let polygonValidator: SignerWithAddress
    let binanceValidator: SignerWithAddress
    let ethereumValidator: SignerWithAddress
    let user1: SignerWithAddress
    let user2: SignerWithAddress

    before(async () => {
      const accounts = await ethers.getSigners()
      owner = accounts[0]
      yarValidator = accounts[1]
      polygonValidator = accounts[2]
      binanceValidator = accounts[3]
      ethereumValidator = accounts[4]
      user1 = accounts[9]
      user2 = accounts[8]

      await deployments.fixture(['diamondTest'])
      const YarBridgeDeployment = await deployments.get('YarBridge')
      const PolygonBridgeDeployment = await deployments.get('PolygonBridge')
      const BinanceBridgeDeployment = await deployments.get('BinanceBridge')
      const EthereumBridgeDeployment = await deployments.get('EthereumBridge')

      yarBridge = await UniversalBridgeContracts.factory(YarBridgeDeployment.address, yarValidator)
      polygonBridge = await UniversalBridgeContracts.factory(
        PolygonBridgeDeployment.address,
        polygonValidator,
      )
      binanceBridge = await UniversalBridgeContracts.factory(
        BinanceBridgeDeployment.address,
        binanceValidator,
      )
      ethereumBridge = await UniversalBridgeContracts.factory(
        EthereumBridgeDeployment.address,
        ethereumValidator,
      )

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
      // Validators
      const originalValidator = polygonValidator

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

      // Get event data
      const parsedEventStep1 = await parseBridgeTransferEvent({
        callSigner: user1,
        event: eventStep1,
        hasTokenCreateInfo: true,
      })

      // VALIDATOR ORIGINAL -> YAR
      const yarIssuedTokenAddress = await tranferFromOtherChainERC20({
        logId: 'logId-200',
        parsedEvent: parsedEventStep1,
        targetChain: yarBridge,
        validator: yarValidator,
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

      // Get event data
      const parsedEventStep2 = await parseBridgeTransferEvent({
        callSigner: user1,
        event: eventStep2,
        hasTokenCreateInfo: false,
      })

      // VALIDATOR YAR -> ORIGINAL
      await tranferFromOtherChainERC20({
        logId: 'logId-400',
        parsedEvent: parsedEventStep2,
        targetChain: originalBridge,
        validator: originalValidator,
      })
    })

    it('Regular unit: SECONDARY <---> YAR(issued tokens)', async () => {
      // Used bridges
      // YarBridge and:
      const originalBridge = polygonBridge
      const secondaryBridge = binanceBridge
      // Validators
      const secondaryValidator = binanceValidator

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

      // Get event data
      const parsedEventStep1 = await parseBridgeTransferEvent({
        callSigner: user1,
        event: eventStep1,
        hasTokenCreateInfo: true,
      })

      // VALIDATOR ORIGINAL -> YAR
      const yarIssuedTokenAddress = await tranferFromOtherChainERC20({
        logId: 'logId-600',
        parsedEvent: parsedEventStep1,
        targetChain: yarBridge,
        validator: yarValidator,
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

      // Get event data
      const parsedEventStep2 = await parseBridgeTransferEvent({
        callSigner: user1,
        event: eventStep2,
        hasTokenCreateInfo: true,
      })

      // VALIDATOR YAR -> SECONDARY
      const secondaryIssuedTokenAddress = await tranferFromOtherChainERC20({
        logId: 'logId-800',
        parsedEvent: parsedEventStep2,
        targetChain: secondaryBridge,
        validator: secondaryValidator,
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

      // Get event data
      const parsedEventStep3 = await parseBridgeTransferEvent({
        callSigner: user1,
        event: eventStep3,
        hasTokenCreateInfo: false,
      })

      // VALIDATOR SECONDARY -> YAR
      // const yarIssuedTokenAddress =
      await tranferFromOtherChainERC20({
        logId: 'logId-1000',
        parsedEvent: parsedEventStep3,
        targetChain: yarBridge,
        validator: yarValidator,
      })
    })

    it('Regular unit: ORIGINAL <---> YAR(issued tokens) <---> SECONDARY', async () => {
      // Used bridges
      // Yar and:
      const originalBridge = polygonBridge
      const secondaryBridge = binanceBridge
      // Validators
      const originalValidator = polygonValidator
      const secondaryValidator = binanceValidator

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

      // Get event data
      const parsedEventStep1 = await parseBridgeTransferEvent({
        callSigner: user1,
        event: eventStep1,
        hasTokenCreateInfo: true,
      })

      // VALIDATOR ORIGINAL --PROXY--> SECONDARY
      const secondaryIssuedTokenAddress = await proxyTranferFromOtherChainERC20({
        logId: 'logId-1200',
        parsedEvent: parsedEventStep1,
        yarChain: yarBridge,
        targetChain: secondaryBridge,
        yarValidator: yarValidator,
        targetValidator: secondaryValidator,
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

      // Get event data
      const parsedEventStep2 = await parseBridgeTransferEvent({
        callSigner: user1,
        event: eventStep2,
        hasTokenCreateInfo: false,
      })

      // VALIDATOR SECONDARY --PROXY--> ORIGINAL
      await proxyTranferFromOtherChainERC20({
        logId: 'logId-1400',
        parsedEvent: parsedEventStep2,
        yarChain: yarBridge,
        targetChain: originalBridge,
        yarValidator: yarValidator,
        targetValidator: originalValidator,
      })
    })

    it('Regular unit: SECONDARY <---> YAR(issued tokens) <---> THIRD', async () => {
      // Used bridges
      // Yar and:
      const originalBridge = polygonBridge
      const secondaryBridge = binanceBridge
      const thirdBridge = ethereumBridge
      // Validators
      const originalValidator = polygonValidator
      const secondaryValidator = binanceValidator
      const thirdValidator = ethereumValidator

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

      // Get event data
      const parsedEventStep1 = await parseBridgeTransferEvent({
        callSigner: user1,
        event: eventStep1,
        hasTokenCreateInfo: true,
      })

      // VALIDATOR ORIGINAL --PROXY--> SECONDARY
      const secondaryIssuedTokenAddress = await proxyTranferFromOtherChainERC20({
        logId: 'logId-1600',
        parsedEvent: parsedEventStep1,
        yarChain: yarBridge,
        targetChain: secondaryBridge,
        yarValidator: yarValidator,
        targetValidator: secondaryValidator,
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

      // Get event data
      const parsedEventStep2 = await parseBridgeTransferEvent({
        callSigner: user1,
        event: eventStep2,
        hasTokenCreateInfo: true,
      })

      // VALIDATOR SECONDARY --PROXY--> THIRD
      const thirdIssuedTokenAddress = await proxyTranferFromOtherChainERC20({
        logId: 'logId-1800',
        parsedEvent: parsedEventStep2,
        yarChain: yarBridge,
        targetChain: thirdBridge,
        yarValidator: yarValidator,
        targetValidator: thirdValidator,
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

      // Get event data
      const parsedEventStep3 = await parseBridgeTransferEvent({
        callSigner: user1,
        event: eventStep3,
        hasTokenCreateInfo: false,
      })

      // VALIDATOR THIRD --PROXY--> SECONDARY
      await proxyTranferFromOtherChainERC20({
        logId: 'logId-2000',
        parsedEvent: parsedEventStep3,
        yarChain: yarBridge,
        targetChain: secondaryBridge,
        yarValidator: yarValidator,
        targetValidator: secondaryValidator,
      })
    })

    it('Regular unit: YAR(is ORIGINAL, not issued tokens) <---> SECONDARY', async () => {
      // Used bridges
      // YarBridge and:
      const originalBridge = yarBridge
      const secondaryBridge = polygonBridge
      // Validators
      const secondaryValidator = polygonValidator

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

      // Get event data
      const parsedEventStep1 = await parseBridgeTransferEvent({
        callSigner: user1,
        event: eventStep1,
        hasTokenCreateInfo: true,
      })

      // VALIDATOR YAR(Original) --PROXY--> SECONDARY
      const secondaryIssuedTokenAddress = await tranferFromOtherChainERC20({
        logId: 'logId-2200',
        parsedEvent: parsedEventStep1,
        targetChain: secondaryBridge,
        validator: secondaryValidator,
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

      // Get event data
      const parsedEventStep2 = await parseBridgeTransferEvent({
        callSigner: user1,
        event: eventStep2,
        hasTokenCreateInfo: false,
      })

      // VALIDATOR SECONDARY ---> YAR(Original)
      await tranferFromOtherChainERC20({
        logId: 'logId-2400',
        parsedEvent: parsedEventStep2,
        targetChain: originalBridge,
        validator: yarValidator,
      })
    })
  })
}

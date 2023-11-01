import { deployments, ethers } from 'hardhat'
import {
  BridgeERC20,
  BridgeERC20__factory,
  IERC20Metadata,
  IERC20Metadata__factory,
} from '../../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  ALETH,
  CRV3,
  DAI,
  FRAX,
  HBTC,
  LUSD,
  MIM,
  NATIVE_TOKEN,
  RENBTC,
  SBTC,
  STETH,
  USDC,
  USDT,
  WBTC,
  WETH,
} from '../../constants/externalAddresses'
import ERC20MinterV2 from '../utils/ERC20MinterV2'
import {
  proxyTranferFromOtherChainERC20,
  tranferFromOtherChainERC20,
  tranferToOtherChainERC20,
} from './BridgeERC20.utils'
import { BigNumber } from 'ethers'

const TEST_DATA = {
  tokens: [
    NATIVE_TOKEN,
    USDT, //
  ],
  chains: [
    {
      original: 'PolygonBridgeERC20',
      second: 'BinanceBridgeERC20',
      third: 'EthereumBridgeERC20',
    },
    {
      original: 'BinanceBridgeERC20',
      second: 'AvaxBridgeERC20',
      third: 'OptimismBridgeERC20',
    },
    {
      original: 'OptimismBridgeERC20',
      second: 'ArbitrumBridgeERC20',
      third: 'BaseBridgeERC20',
    },
  ],
}

describe('test_key_unit BridgeERC20', () => {
  for (const token of TEST_DATA.tokens) {
    describe(`token ${token}`, () => {
      let yarBridge: BridgeERC20

      let testToken: IERC20Metadata
      let testTokenAmount: BigNumber
      let initSnapshot: string

      let validator: SignerWithAddress
      let user1: SignerWithAddress
      let user2: SignerWithAddress

      before(async () => {
        const accounts = await ethers.getSigners()
        validator = accounts[0]
        user1 = accounts[9]
        user2 = accounts[8]

        await deployments.fixture()

        const YarBridgeDeployment = await deployments.get('YarBridgeERC20')
        yarBridge = BridgeERC20__factory.connect(YarBridgeDeployment.address, validator)

        testToken = IERC20Metadata__factory.connect(token, user1)
        await ERC20MinterV2.mint(testToken.address, user1.address, 1000)
        if(testToken.address == NATIVE_TOKEN) {
          testTokenAmount = ethers.utils.parseEther(`${1000}`)
        } else {
          testTokenAmount = await testToken.balanceOf(user1.address)
        }
        initSnapshot = await ethers.provider.send('evm_snapshot', [])
      })

      afterEach(async () => {
        await ethers.provider.send('evm_revert', [initSnapshot])
        initSnapshot = await ethers.provider.send('evm_snapshot', [])
      })

      for (const chains of TEST_DATA.chains)
        describe(`chain ${JSON.stringify(chains)}`, () => {
          let originalBridge: BridgeERC20
          let secondBridge: BridgeERC20
          let thirdBridge: BridgeERC20

          beforeEach(async () => {
            const OriginalBridgeDeployment = await deployments.get(chains.original)
            originalBridge = BridgeERC20__factory.connect(
              OriginalBridgeDeployment.address,
              validator,
            )

            if (testToken.address != NATIVE_TOKEN)
              await testToken.connect(user1).approve(originalBridge.address, testTokenAmount)

            const SecondBridgeDeployment = await deployments.get(chains.second)
            secondBridge = BridgeERC20__factory.connect(SecondBridgeDeployment.address, validator)

            const ThirdBridgeDeployment = await deployments.get(chains.third)
            thirdBridge = BridgeERC20__factory.connect(ThirdBridgeDeployment.address, validator)
          })

          it('Regular unit: ORIGINAL <---> YAR(issued tokens)', async () => {
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
              targetChain: secondBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR YAR -> SECONDARY
            const secondaryIssuedTokenAddress = await tranferFromOtherChainERC20({
              logId: 'logId-800',
              event: eventStep2,
              targetChain: secondBridge,
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
              initialChain: secondBridge,
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
            // User ORIGIINAL ---> SECONDARY
            const eventStep1 = await tranferToOtherChainERC20({
              logId: 'logId-1100',
              transferedTokenAddress: testToken.address,
              originalTokenAddress: testToken.address,
              amount: testTokenAmount,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR ORIGINAL --PROXY--> SECONDARY
            const secondaryIssuedTokenAddress = await proxyTranferFromOtherChainERC20({
              logId: 'logId-1200',
              event: eventStep1,
              yarChain: yarBridge,
              originalChain: originalBridge,
              targetChain: secondBridge,
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
              initialChain: secondBridge,
              targetChain: originalBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR SECONDARY --PROXY--> ORIGINAL
            await proxyTranferFromOtherChainERC20({
              logId: 'logId-1400',
              event: eventStep2,
              yarChain: yarBridge,
              originalChain: originalBridge,
              targetChain: originalBridge,
              validator,
            })
          })

          it('Regular unit: SECONDARY <---> YAR(issued tokens) <---> THIRD', async () => {
            // User ORIGINAL to SECONDARY
            const eventStep1 = await tranferToOtherChainERC20({
              logId: 'logId-1500',
              transferedTokenAddress: testToken.address,
              originalTokenAddress: testToken.address,
              amount: testTokenAmount,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR ORIGINAL --PROXY--> SECONDARY
            const secondaryIssuedTokenAddress = await proxyTranferFromOtherChainERC20({
              logId: 'logId-1600',
              event: eventStep1,
              yarChain: yarBridge,
              originalChain: originalBridge,
              targetChain: secondBridge,
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
              initialChain: secondBridge,
              targetChain: thirdBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR SECONDARY --PROXY--> THIRD
            const thirdIssuedTokenAddress = await proxyTranferFromOtherChainERC20({
              logId: 'logId-1800',
              event: eventStep2,
              yarChain: yarBridge,
              originalChain: originalBridge,
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
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR THIRD --PROXY--> SECONDARY
            await proxyTranferFromOtherChainERC20({
              logId: 'logId-2000',
              event: eventStep3,
              yarChain: yarBridge,
              originalChain: originalBridge,
              targetChain: secondBridge,
              validator,
            })
          })

          it('Regular unit: YAR(is ORIGINAL, not issued tokens) <---> SECONDARY', async () => {
            // Used bridges
            // YarBridge and:
            const originalBridge = yarBridge

            if (testToken.address != NATIVE_TOKEN)
              await testToken.connect(user1).approve(originalBridge.address, testTokenAmount)

            // User YAR(ORIGINAL) ---> SECONDARY
            const eventStep1 = await tranferToOtherChainERC20({
              transferedTokenAddress: testToken.address,
              logId: 'logId-2100',
              originalTokenAddress: testToken.address,
              amount: testTokenAmount,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR YAR(Original) --PROXY--> SECONDARY
            const secondaryIssuedTokenAddress = await tranferFromOtherChainERC20({
              logId: 'logId-2200',
              event: eventStep1,
              targetChain: secondBridge,
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
              initialChain: secondBridge,
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
    })
  }
})

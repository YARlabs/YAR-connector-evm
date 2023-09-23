import { deployments, ethers } from 'hardhat'
import {
  BridgeERC721,
  BridgeERC721__factory,
  IERC721Metadata,
  IERC721Metadata__factory,
} from '../../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { XEN_TORENT_ERC721 } from '../../constants/externalAddresses'
import ERC721MinterV2 from '../utils/ERC721MinterV2'
import {
  proxyTranferFromOtherChainERC721,
  tranferFromOtherChainERC721,
  tranferToOtherChainERC721,
} from './BridgeERC721.utils'

const TEST_DATA = {
  tokens: [
    XEN_TORENT_ERC721, //
  ],
  chains: [
    {
      original: 'PolygonBridgeERC721',
      second: 'BinanceBridgeERC721',
      third: 'EthereumBridgeERC721',
    },
    {
      original: 'BinanceBridgeERC721',
      second: 'AvaxBridgeERC721',
      third: 'OptimismBridgeERC721',
    },
    {
      original: 'OptimismBridgeERC721',
      second: 'ArbitrumBridgeERC721',
      third: 'BaseBridgeERC721',
    },
  ],
}

describe('test_key_unit BridgeERC721', () => {
  for (const token of TEST_DATA.tokens) {
    describe(`token ${token}`, () => {
      let yarBridge: BridgeERC721

      let testToken: IERC721Metadata
      const tokenId = 1
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

        const YarBridgeDeployment = await deployments.get('YarBridgeERC721')
        yarBridge = BridgeERC721__factory.connect(YarBridgeDeployment.address, validator)

        testToken = IERC721Metadata__factory.connect(token, user1)
        await ERC721MinterV2.mint(testToken.address, user1.address, tokenId)

        initSnapshot = await ethers.provider.send('evm_snapshot', [])
      })

      afterEach(async () => {
        await ethers.provider.send('evm_revert', [initSnapshot])
        initSnapshot = await ethers.provider.send('evm_snapshot', [])
      })

      for (const chains of TEST_DATA.chains)
        describe(`chain ${chains}`, () => {
          let originalBridge: BridgeERC721
          let secondBridge: BridgeERC721
          let thirdBridge: BridgeERC721

          beforeEach(async () => {
            const OriginalBridgeDeployment = await deployments.get(chains.original)
            originalBridge = BridgeERC721__factory.connect(
              OriginalBridgeDeployment.address,
              validator,
            )

            await testToken.connect(user1).approve(originalBridge.address, tokenId)

            const SecondBridgeDeployment = await deployments.get(chains.second)
            secondBridge = BridgeERC721__factory.connect(SecondBridgeDeployment.address, validator)

            const ThirdBridgeDeployment = await deployments.get(chains.third)
            thirdBridge = BridgeERC721__factory.connect(ThirdBridgeDeployment.address, validator)
          })

          it('Regular unit: ORIGINAL <---> YAR(issued tokens)', async () => {
            // User ORIGINAL -> YAR
            const eventStep1 = await tranferToOtherChainERC721({
              logId: 'logId-100',
              transferedTokenAddress: testToken.address,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: yarBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR ORIGINAL -> YAR
            const yarIssuedTokenAddress = await tranferFromOtherChainERC721({
              logId: 'logId-200',
              event: eventStep1,
              targetChain: yarBridge,
              validator: validator,
            })

            // *** REVERSE

            // User YAR ---> ORIGINAL
            const eventStep2 = await tranferToOtherChainERC721({
              logId: 'logId-300',
              transferedTokenAddress: yarIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              originalChain: originalBridge,
              initialChain: yarBridge,
              targetChain: originalBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR YAR -> ORIGINAL
            await tranferFromOtherChainERC721({
              logId: 'logId-400',
              event: eventStep2,
              targetChain: originalBridge,
              validator: validator,
            })
          })

          it('Regular unit: SECONDARY <---> YAR(issued tokens)', async () => {
            // *** Before cretate ISSUED tokens on YAR

            // Original approve first
            await testToken.connect(user1).approve(originalBridge.address, tokenId)

            // User ORIGIINAL ---> YAR
            const eventStep1 = await tranferToOtherChainERC721({
              logId: 'logId-500',
              transferedTokenAddress: testToken.address,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: yarBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR ORIGINAL -> YAR
            const yarIssuedTokenAddress = await tranferFromOtherChainERC721({
              logId: 'logId-600',
              event: eventStep1,
              targetChain: yarBridge,
              validator: validator,
            })

            // *** Then test

            // User YAR ---> SECONDARY
            const eventStep2 = await tranferToOtherChainERC721({
              logId: 'logId-700',
              transferedTokenAddress: yarIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              originalChain: originalBridge,
              initialChain: yarBridge,
              targetChain: secondBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR YAR -> SECONDARY
            const secondaryIssuedTokenAddress = await tranferFromOtherChainERC721({
              logId: 'logId-800',
              event: eventStep2,
              targetChain: secondBridge,
              validator: validator,
            })

            // *** Reverse

            // User SECONDARY ---> YAR
            const eventStep3 = await tranferToOtherChainERC721({
              logId: 'logId-900',
              transferedTokenAddress: secondaryIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              originalChain: originalBridge,
              initialChain: secondBridge,
              targetChain: yarBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR SECONDARY -> YAR
            // const yarIssuedTokenAddress =
            await tranferFromOtherChainERC721({
              logId: 'logId-1000',
              event: eventStep3,
              targetChain: yarBridge,
              validator: validator,
            })
          })

          it('Regular unit: ORIGINAL <---> YAR(issued tokens) <---> SECONDARY', async () => {
            // User ORIGIINAL ---> SECONDARY
            const eventStep1 = await tranferToOtherChainERC721({
              logId: 'logId-1100',
              transferedTokenAddress: testToken.address,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR ORIGINAL --PROXY--> SECONDARY
            const secondaryIssuedTokenAddress = await proxyTranferFromOtherChainERC721({
              logId: 'logId-1200',
              event: eventStep1,
              yarChain: yarBridge,
              targetChain: secondBridge,
              validator,
            })

            // *** REVERSE

            // User SECONDARY ---> ORIGINAL
            const eventStep2 = await tranferToOtherChainERC721({
              logId: 'logId-1300',
              transferedTokenAddress: secondaryIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              originalChain: originalBridge,
              initialChain: secondBridge,
              targetChain: originalBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR SECONDARY --PROXY--> ORIGINAL
            await proxyTranferFromOtherChainERC721({
              logId: 'logId-1400',
              event: eventStep2,
              yarChain: yarBridge,
              targetChain: originalBridge,
              validator,
            })
          })

          it('Regular unit: SECONDARY <---> YAR(issued tokens) <---> THIRD', async () => {
            /// *** Before trasfer from ORIGIANL to SECONDARY

            await testToken.connect(user1).approve(originalBridge.address, tokenId)

            // User ORIGINAL to SECONDARY
            const eventStep1 = await tranferToOtherChainERC721({
              logId: 'logId-1500',
              transferedTokenAddress: testToken.address,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR ORIGINAL --PROXY--> SECONDARY
            const secondaryIssuedTokenAddress = await proxyTranferFromOtherChainERC721({
              logId: 'logId-1600',
              event: eventStep1,
              yarChain: yarBridge,
              targetChain: secondBridge,
              validator,
            })

            // *** Then test

            // User SECONDARY ---> THIRD
            const eventStep2 = await tranferToOtherChainERC721({
              logId: 'logId-1700',
              transferedTokenAddress: secondaryIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              originalChain: originalBridge,
              initialChain: secondBridge,
              targetChain: thirdBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR SECONDARY --PROXY--> THIRD
            const thirdIssuedTokenAddress = await proxyTranferFromOtherChainERC721({
              logId: 'logId-1800',
              event: eventStep2,
              yarChain: yarBridge,
              targetChain: thirdBridge,
              validator,
            })

            // *** REVERSE

            // User THIRD ---> SECONDARY
            const eventStep3 = await tranferToOtherChainERC721({
              logId: 'logId-1900',
              transferedTokenAddress: thirdIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              originalChain: originalBridge,
              initialChain: thirdBridge,
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR THIRD --PROXY--> SECONDARY
            await proxyTranferFromOtherChainERC721({
              logId: 'logId-2000',
              event: eventStep3,
              yarChain: yarBridge,
              targetChain: secondBridge,
              validator,
            })
          })

          it('Regular unit: YAR(is ORIGINAL, not issued tokens) <---> SECONDARY', async () => {
            const originalBridge = yarBridge

            await testToken.connect(user1).approve(originalBridge.address, tokenId)

            // User YAR(ORIGINAL) ---> SECONDARY
            const eventStep1 = await tranferToOtherChainERC721({
              transferedTokenAddress: testToken.address,
              logId: 'logId-2100',
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR YAR(Original) --PROXY--> SECONDARY
            const secondaryIssuedTokenAddress = await tranferFromOtherChainERC721({
              logId: 'logId-2200',
              event: eventStep1,
              targetChain: secondBridge,
              validator: validator,
            })

            // *** REVERSE

            // User SECONDARY ---> YAR(ORIGINAL)
            const eventStep2 = await tranferToOtherChainERC721({
              logId: 'logId-2300',
              transferedTokenAddress: secondaryIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              originalChain: originalBridge,
              initialChain: secondBridge,
              targetChain: originalBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR SECONDARY ---> YAR(Original)
            await tranferFromOtherChainERC721({
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

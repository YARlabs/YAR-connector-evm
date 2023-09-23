import { deployments, ethers } from 'hardhat'
import {
  BridgeERC1155,
  BridgeERC1155__factory,
  MockERC1155,
  MockERC1155__factory,
} from '../../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  batchTranferFromOtherChainERC1155,
  batchTranferToOtherChainERC1155,
  proxyBatchTranferFromOtherChainERC1155,
  proxyTranferFromOtherChainERC1155,
  tranferFromOtherChainERC1155,
  tranferToOtherChainERC1155,
} from './BridgeERC1155.utils'

const TEST_DATA = {
  tokens: {
    single: [
      {
        amount: 1,
        tokenId: 1,
      },
      {
        amount: 100,
        tokenId: 1,
      },
    ],
    batch: [
      {
        amounts: [1],
        tokenIds: [1],
      },
      {
        amounts: [1, 2, 10],
        tokenIds: [1, 100, 115],
      },
    ],
  },
  chains: [
    {
      original: 'PolygonBridgeERC1155',
      second: 'BinanceBridgeERC1155',
      third: 'EthereumBridgeERC1155',
    },
    {
      original: 'BinanceBridgeERC1155',
      second: 'AvaxBridgeERC1155',
      third: 'OptimismBridgeERC1155',
    },
    {
      original: 'OptimismBridgeERC1155',
      second: 'ArbitrumBridgeERC1155',
      third: 'BaseBridgeERC1155',
    },
  ],
}

describe('test_key_unit BridgeERC1155', () => {
  for (const chains of TEST_DATA.chains) {
    describe(`chain ${JSON.stringify(chains)}`, () => {
      let yarBridge: BridgeERC1155

      let testToken: MockERC1155

      let validator: SignerWithAddress
      let user1: SignerWithAddress
      let user2: SignerWithAddress

      let initSnapshot: string

      let originalBridge: BridgeERC1155
      let secondBridge: BridgeERC1155
      let thirdBridge: BridgeERC1155

      beforeEach(async () => {
        const accounts = await ethers.getSigners()
        validator = accounts[0]
        user1 = accounts[9]
        user2 = accounts[8]

        await deployments.fixture()

        const YarBridgeDeployment = await deployments.get('YarBridgeERC1155')
        yarBridge = BridgeERC1155__factory.connect(YarBridgeDeployment.address, validator)

        const OriginalBridgeDeployment = await deployments.get(chains.original)
        originalBridge = BridgeERC1155__factory.connect(OriginalBridgeDeployment.address, validator)

        const SecondBridgeDeployment = await deployments.get(chains.second)
        secondBridge = BridgeERC1155__factory.connect(SecondBridgeDeployment.address, validator)

        const ThirdBridgeDeployment = await deployments.get(chains.third)
        thirdBridge = BridgeERC1155__factory.connect(ThirdBridgeDeployment.address, validator)

        const MockERC1155Deployment = await deployments.get('MockERC1155')
        testToken = MockERC1155__factory.connect(MockERC1155Deployment.address, validator)

        initSnapshot = await ethers.provider.send('evm_snapshot', [])
      })

      afterEach(async () => {
        await ethers.provider.send('evm_revert', [initSnapshot])
        initSnapshot = await ethers.provider.send('evm_snapshot', [])
      })

      for (const { tokenId, amount } of TEST_DATA.tokens.single) {
        describe(`single token ${JSON.stringify({ tokenId, amount })}`, () => {
          beforeEach(async () => {
            await testToken.mint(user1.address, tokenId, amount)
            await testToken.connect(user1).setApprovalForAll(originalBridge.address, true)
          })

          it('Regular unit: ORIGINAL <---> YAR(issued tokens)', async () => {
            // User ORIGINAL -> YAR
            const eventStep1 = await tranferToOtherChainERC1155({
              logId: 'logId-100',
              transferedTokenAddress: testToken.address,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              amount: amount,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: yarBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR ORIGINAL -> YAR
            const yarIssuedTokenAddress = await tranferFromOtherChainERC1155({
              logId: 'logId-200',
              event: eventStep1,
              targetChain: yarBridge,
              validator: validator,
            })

            // *** REVERSE

            // User YAR ---> ORIGINAL
            const eventStep2 = await tranferToOtherChainERC1155({
              logId: 'logId-300',
              transferedTokenAddress: yarIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              amount: amount,
              originalChain: originalBridge,
              initialChain: yarBridge,
              targetChain: originalBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR YAR -> ORIGINAL
            await tranferFromOtherChainERC1155({
              logId: 'logId-400',
              event: eventStep2,
              targetChain: originalBridge,
              validator: validator,
            })
          })

          it('Regular unit: SECONDARY <---> YAR(issued tokens)', async () => {
            // User ORIGIINAL ---> YAR
            const eventStep1 = await tranferToOtherChainERC1155({
              logId: 'logId-500',
              transferedTokenAddress: testToken.address,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              amount: amount,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: yarBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR ORIGINAL -> YAR
            const yarIssuedTokenAddress = await tranferFromOtherChainERC1155({
              logId: 'logId-600',
              event: eventStep1,
              targetChain: yarBridge,
              validator: validator,
            })

            // *** Then test

            // User YAR ---> SECONDARY
            const eventStep2 = await tranferToOtherChainERC1155({
              logId: 'logId-700',
              transferedTokenAddress: yarIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              amount: amount,
              originalChain: originalBridge,
              initialChain: yarBridge,
              targetChain: secondBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR YAR -> SECONDARY
            const secondaryIssuedTokenAddress = await tranferFromOtherChainERC1155({
              logId: 'logId-800',
              event: eventStep2,
              targetChain: secondBridge,
              validator: validator,
            })

            // *** Reverse

            // User SECONDARY ---> YAR
            const eventStep3 = await tranferToOtherChainERC1155({
              logId: 'logId-900',
              transferedTokenAddress: secondaryIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              amount: amount,
              originalChain: originalBridge,
              initialChain: secondBridge,
              targetChain: yarBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR SECONDARY -> YAR
            // const yarIssuedTokenAddress =
            await tranferFromOtherChainERC1155({
              logId: 'logId-1000',
              event: eventStep3,
              targetChain: yarBridge,
              validator: validator,
            })
          })

          it('Regular unit: ORIGINAL <---> YAR(issued tokens) <---> SECONDARY', async () => {
            // User ORIGIINAL ---> SECONDARY
            const eventStep1 = await tranferToOtherChainERC1155({
              logId: 'logId-1100',
              transferedTokenAddress: testToken.address,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              amount: amount,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR ORIGINAL --PROXY--> SECONDARY
            const secondaryIssuedTokenAddress = await proxyTranferFromOtherChainERC1155({
              logId: 'logId-1200',
              event: eventStep1,
              yarChain: yarBridge,
              targetChain: secondBridge,
              validator,
            })

            // *** REVERSE

            // User SECONDARY ---> ORIGINAL
            const eventStep2 = await tranferToOtherChainERC1155({
              logId: 'logId-1300',
              transferedTokenAddress: secondaryIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              amount: amount,
              originalChain: originalBridge,
              initialChain: secondBridge,
              targetChain: originalBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR SECONDARY --PROXY--> ORIGINAL
            await proxyTranferFromOtherChainERC1155({
              logId: 'logId-1400',
              event: eventStep2,
              yarChain: yarBridge,
              targetChain: originalBridge,
              validator,
            })
          })

          it('Regular unit: SECONDARY <---> YAR(issued tokens) <---> THIRD', async () => {
            // User ORIGINAL to SECONDARY
            const eventStep1 = await tranferToOtherChainERC1155({
              logId: 'logId-1500',
              transferedTokenAddress: testToken.address,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              amount: amount,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR ORIGINAL --PROXY--> SECONDARY
            const secondaryIssuedTokenAddress = await proxyTranferFromOtherChainERC1155({
              logId: 'logId-1600',
              event: eventStep1,
              yarChain: yarBridge,
              targetChain: secondBridge,
              validator,
            })

            // *** Then test

            // User SECONDARY ---> THIRD
            const eventStep2 = await tranferToOtherChainERC1155({
              logId: 'logId-1700',
              transferedTokenAddress: secondaryIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              amount: amount,
              originalChain: originalBridge,
              initialChain: secondBridge,
              targetChain: thirdBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR SECONDARY --PROXY--> THIRD
            const thirdIssuedTokenAddress = await proxyTranferFromOtherChainERC1155({
              logId: 'logId-1800',
              event: eventStep2,
              yarChain: yarBridge,
              targetChain: thirdBridge,
              validator,
            })

            // *** REVERSE

            // User THIRD ---> SECONDARY
            const eventStep3 = await tranferToOtherChainERC1155({
              logId: 'logId-1900',
              transferedTokenAddress: thirdIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              amount: amount,
              originalChain: originalBridge,
              initialChain: thirdBridge,
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR THIRD --PROXY--> SECONDARY
            await proxyTranferFromOtherChainERC1155({
              logId: 'logId-2000',
              event: eventStep3,
              yarChain: yarBridge,
              targetChain: secondBridge,
              validator,
            })
          })

          it('Regular unit: YAR(is ORIGINAL, not issued tokens) <---> SECONDARY', async () => {
            const originalBridge = yarBridge

            // Original approve first
            await testToken.connect(user1).setApprovalForAll(originalBridge.address, true)

            // User YAR(ORIGINAL) ---> SECONDARY
            const eventStep1 = await tranferToOtherChainERC1155({
              transferedTokenAddress: testToken.address,
              logId: 'logId-2100',
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              amount: amount,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR YAR(Original) --PROXY--> SECONDARY
            const secondaryIssuedTokenAddress = await tranferFromOtherChainERC1155({
              logId: 'logId-2200',
              event: eventStep1,
              targetChain: secondBridge,
              validator: validator,
            })

            // *** REVERSE

            // User SECONDARY ---> YAR(ORIGINAL)
            const eventStep2 = await tranferToOtherChainERC1155({
              logId: 'logId-2300',
              transferedTokenAddress: secondaryIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenId: tokenId,
              amount: amount,
              originalChain: originalBridge,
              initialChain: secondBridge,
              targetChain: originalBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR SECONDARY ---> YAR(Original)
            await tranferFromOtherChainERC1155({
              logId: 'logId-2400',
              event: eventStep2,
              targetChain: originalBridge,
              validator: validator,
            })
          })
        })
      }

      for (const { tokenIds, amounts } of TEST_DATA.tokens.batch) {
        describe(`batch token ${JSON.stringify({ tokenIds, amounts })}`, () => {
          beforeEach(async () => {
            await testToken.mintBatch(user1.address, tokenIds, amounts)
            await testToken.connect(user1).setApprovalForAll(originalBridge.address, true)
          })

          it('Regular(batch) unit: ORIGINAL <---> YAR(issued tokens)', async () => {
            // User ORIGINAL -> YAR
            const eventStep1 = await batchTranferToOtherChainERC1155({
              logId: 'logId-100',
              transferedTokenAddress: testToken.address,
              originalTokenAddress: testToken.address,
              tokenIds: tokenIds,
              amounts: amounts,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: yarBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR ORIGINAL -> YAR
            const yarIssuedTokenAddress = await batchTranferFromOtherChainERC1155({
              logId: 'logId-200',
              event: eventStep1,
              targetChain: yarBridge,
              validator: validator,
            })

            // *** REVERSE

            // User YAR ---> ORIGINAL
            const eventStep2 = await batchTranferToOtherChainERC1155({
              logId: 'logId-300',
              transferedTokenAddress: yarIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenIds: tokenIds,
              amounts: amounts,
              originalChain: originalBridge,
              initialChain: yarBridge,
              targetChain: originalBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR YAR -> ORIGINAL
            await batchTranferFromOtherChainERC1155({
              logId: 'logId-400',
              event: eventStep2,
              targetChain: originalBridge,
              validator: validator,
            })
          })

          it('Regular(batch) unit: SECONDARY <---> YAR(issued tokens)', async () => {
            // User ORIGIINAL ---> YAR
            const eventStep1 = await batchTranferToOtherChainERC1155({
              logId: 'logId-500',
              transferedTokenAddress: testToken.address,
              originalTokenAddress: testToken.address,
              tokenIds: tokenIds,
              amounts: amounts,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: yarBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR ORIGINAL -> YAR
            const yarIssuedTokenAddress = await batchTranferFromOtherChainERC1155({
              logId: 'logId-600',
              event: eventStep1,
              targetChain: yarBridge,
              validator: validator,
            })

            // *** Then test

            // User YAR ---> SECONDARY
            const eventStep2 = await batchTranferToOtherChainERC1155({
              logId: 'logId-700',
              transferedTokenAddress: yarIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenIds: tokenIds,
              amounts: amounts,
              originalChain: originalBridge,
              initialChain: yarBridge,
              targetChain: secondBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR YAR -> SECONDARY
            const secondaryIssuedTokenAddress = await batchTranferFromOtherChainERC1155({
              logId: 'logId-800',
              event: eventStep2,
              targetChain: secondBridge,
              validator: validator,
            })

            // *** Reverse

            // User SECONDARY ---> YAR
            const eventStep3 = await batchTranferToOtherChainERC1155({
              logId: 'logId-900',
              transferedTokenAddress: secondaryIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenIds: tokenIds,
              amounts: amounts,
              originalChain: originalBridge,
              initialChain: secondBridge,
              targetChain: yarBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR SECONDARY -> YAR
            // const yarIssuedTokenAddress =
            await batchTranferFromOtherChainERC1155({
              logId: 'logId-1000',
              event: eventStep3,
              targetChain: yarBridge,
              validator: validator,
            })
          })

          it('Regular(batch) unit: ORIGINAL <---> YAR(issued tokens) <---> SECONDARY', async () => {
            // User ORIGIINAL ---> SECONDARY
            const eventStep1 = await batchTranferToOtherChainERC1155({
              logId: 'logId-1100',
              transferedTokenAddress: testToken.address,
              originalTokenAddress: testToken.address,
              tokenIds: tokenIds,
              amounts: amounts,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR ORIGINAL --PROXY--> SECONDARY
            const secondaryIssuedTokenAddress = await proxyBatchTranferFromOtherChainERC1155({
              logId: 'logId-1200',
              event: eventStep1,
              yarChain: yarBridge,
              targetChain: secondBridge,
              validator,
            })

            // *** REVERSE

            // User SECONDARY ---> ORIGINAL
            const eventStep2 = await batchTranferToOtherChainERC1155({
              logId: 'logId-1300',
              transferedTokenAddress: secondaryIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenIds: tokenIds,
              amounts: amounts,
              originalChain: originalBridge,
              initialChain: secondBridge,
              targetChain: originalBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR SECONDARY --PROXY--> ORIGINAL
            await proxyBatchTranferFromOtherChainERC1155({
              logId: 'logId-1400',
              event: eventStep2,
              yarChain: yarBridge,
              targetChain: originalBridge,
              validator,
            })
          })

          it('Regular(batch) unit: SECONDARY <---> YAR(issued tokens) <---> THIRD', async () => {
            // User ORIGINAL to SECONDARY
            const eventStep1 = await batchTranferToOtherChainERC1155({
              logId: 'logId-1500',
              transferedTokenAddress: testToken.address,
              originalTokenAddress: testToken.address,
              tokenIds: tokenIds,
              amounts: amounts,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR ORIGINAL --PROXY--> SECONDARY
            const secondaryIssuedTokenAddress = await proxyBatchTranferFromOtherChainERC1155({
              logId: 'logId-1600',
              event: eventStep1,
              yarChain: yarBridge,
              targetChain: secondBridge,
              validator,
            })

            // *** Then test

            // User SECONDARY ---> THIRD
            const eventStep2 = await batchTranferToOtherChainERC1155({
              logId: 'logId-1700',
              transferedTokenAddress: secondaryIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenIds: tokenIds,
              amounts: amounts,
              originalChain: originalBridge,
              initialChain: secondBridge,
              targetChain: thirdBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR SECONDARY --PROXY--> THIRD
            const thirdIssuedTokenAddress = await proxyBatchTranferFromOtherChainERC1155({
              logId: 'logId-1800',
              event: eventStep2,
              yarChain: yarBridge,
              targetChain: thirdBridge,
              validator,
            })

            // *** REVERSE

            // User THIRD ---> SECONDARY
            const eventStep3 = await batchTranferToOtherChainERC1155({
              logId: 'logId-1900',
              transferedTokenAddress: thirdIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenIds: tokenIds,
              amounts: amounts,
              originalChain: originalBridge,
              initialChain: thirdBridge,
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR THIRD --PROXY--> SECONDARY
            await proxyBatchTranferFromOtherChainERC1155({
              logId: 'logId-2000',
              event: eventStep3,
              yarChain: yarBridge,
              targetChain: secondBridge,
              validator,
            })
          })

          it('Regular(batch) unit: YAR(is ORIGINAL, not issued tokens) <---> SECONDARY', async () => {
            const originalBridge = yarBridge
            await testToken.connect(user1).setApprovalForAll(originalBridge.address, true)

            // User YAR(ORIGINAL) ---> SECONDARY
            const eventStep1 = await batchTranferToOtherChainERC1155({
              transferedTokenAddress: testToken.address,
              logId: 'logId-2100',
              originalTokenAddress: testToken.address,
              tokenIds: tokenIds,
              amounts: amounts,
              originalChain: originalBridge,
              initialChain: originalBridge,
              targetChain: secondBridge,
              sender: user1,
              recipient: user2,
            })

            // VALIDATOR YAR(Original) --PROXY--> SECONDARY
            const secondaryIssuedTokenAddress = await batchTranferFromOtherChainERC1155({
              logId: 'logId-2200',
              event: eventStep1,
              targetChain: secondBridge,
              validator: validator,
            })

            // *** REVERSE

            // User SECONDARY ---> YAR(ORIGINAL)
            const eventStep2 = await batchTranferToOtherChainERC1155({
              logId: 'logId-2300',
              transferedTokenAddress: secondaryIssuedTokenAddress,
              originalTokenAddress: testToken.address,
              tokenIds: tokenIds,
              amounts: amounts,
              originalChain: originalBridge,
              initialChain: secondBridge,
              targetChain: originalBridge,
              sender: user2,
              recipient: user1,
            })

            // VALIDATOR SECONDARY ---> YAR(Original)
            await batchTranferFromOtherChainERC1155({
              logId: 'logId-2400',
              event: eventStep2,
              targetChain: originalBridge,
              validator: validator,
            })
          })
        })
      }
    })
  }
})

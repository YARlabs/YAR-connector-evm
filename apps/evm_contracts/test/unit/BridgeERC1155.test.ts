import { deployments, ethers } from 'hardhat'
import {
  BridgeERC1155,
  BridgeERC1155__factory,
  IERC1155MetadataURI__factory,
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

interface ITestCase {
  amount: number,
  tokenId: number,
  amounts: number[],
  tokenIds: number[],
}

const testCases: Array<ITestCase> = [
  {
    amount: 1,
    tokenId: 1,
    amounts: [1],
    tokenIds: [1],
  },
  {
    amount: 100,
    tokenId: 1,
    amounts: [1,2,10],
    tokenIds: [1, 100, 115],
  },
]

describe('test_key_unit BridgeERC1155', () => {
  for (const testCase of testCases) {
    test(testCase)
  }
})

function test(testCase: ITestCase) {
  const {tokenId, amount, tokenIds, amounts} = testCase
  describe(`BridgeERC1155 ${JSON.stringify(testCase)}`, () => {
    let yarBridge: BridgeERC1155
    let polygonBridge: BridgeERC1155
    let binanceBridge: BridgeERC1155
    let ethereumBridge: BridgeERC1155
    let initSnapshot: string
    let validator: SignerWithAddress
    let user1: SignerWithAddress
    let user2: SignerWithAddress
    let testToken: MockERC1155

    before(async () => {
      const accounts = await ethers.getSigners()
      validator = accounts[0]
      user1 = accounts[9]
      user2 = accounts[8]

      await deployments.fixture([
        'YarBridgeERC1155',
        'PolygonBridgeERC1155',
        'BinanceBridgeERC1155',
        'EthereumBridgeERC1155',
        'MockERC1155',
      ])
      const YarBridgeDeployment = await deployments.get('YarBridgeERC1155')
      const PolygonBridgeDeployment = await deployments.get('PolygonBridgeERC1155')
      const BinanceBridgeDeployment = await deployments.get('BinanceBridgeERC1155')
      const EthereumBridgeDeployment = await deployments.get('EthereumBridgeERC1155')
      const MockERC1155Deployment = await deployments.get('MockERC1155')

      yarBridge = BridgeERC1155__factory.connect(YarBridgeDeployment.address, validator)
      polygonBridge = BridgeERC1155__factory.connect(PolygonBridgeDeployment.address, validator)
      binanceBridge = BridgeERC1155__factory.connect(BinanceBridgeDeployment.address, validator)
      ethereumBridge = BridgeERC1155__factory.connect(EthereumBridgeDeployment.address, validator)
      testToken = MockERC1155__factory.connect(MockERC1155Deployment.address, validator)

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
      await testToken.mint(user1.address, tokenId, amount)

      // Original approve first
      await testToken.connect(user1).setApprovalForAll(originalBridge.address, true)

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
      // Used bridges
      // YarBridge and:
      const originalBridge = polygonBridge
      const secondaryBridge = binanceBridge

      // Test token
      await testToken.mint(user1.address, tokenId, amount)

      // *** Before cretate ISSUED tokens on YAR

      // Original approve first
      await testToken.connect(user1).setApprovalForAll(originalBridge.address, true)

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
        targetChain: secondaryBridge,
        sender: user2,
        recipient: user1,
      })

      // VALIDATOR YAR -> SECONDARY
      const secondaryIssuedTokenAddress = await tranferFromOtherChainERC1155({
        logId: 'logId-800',
        event: eventStep2,
        targetChain: secondaryBridge,
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
        initialChain: secondaryBridge,
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
      // Used bridges
      // Yar and:
      const originalBridge = polygonBridge
      const secondaryBridge = binanceBridge

      // Test token
      await testToken.mint(user1.address, tokenId, amount)

      await testToken.connect(user1).setApprovalForAll(originalBridge.address, true)

      // User ORIGIINAL ---> SECONDARY
      const eventStep1 = await tranferToOtherChainERC1155({
        logId: 'logId-1100',
        transferedTokenAddress: testToken.address,
        originalTokenAddress: testToken.address,
        tokenId: tokenId,
        amount: amount,
        originalChain: originalBridge,
        initialChain: originalBridge,
        targetChain: secondaryBridge,
        sender: user1,
        recipient: user2,
      })

      // VALIDATOR ORIGINAL --PROXY--> SECONDARY
      const secondaryIssuedTokenAddress = await proxyTranferFromOtherChainERC1155({
        logId: 'logId-1200',
        event: eventStep1,
        yarChain: yarBridge,
        targetChain: secondaryBridge,
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
        initialChain: secondaryBridge,
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
      // Used bridges
      // Yar and:
      const originalBridge = polygonBridge
      const secondaryBridge = binanceBridge
      const thirdBridge = ethereumBridge

      // Test token
      await testToken.mint(user1.address, tokenId, amount)

      /// *** Before trasfer from ORIGIANL to SECONDARY

      await testToken.connect(user1).setApprovalForAll(originalBridge.address, true)

      // User ORIGINAL to SECONDARY
      const eventStep1 = await tranferToOtherChainERC1155({
        logId: 'logId-1500',
        transferedTokenAddress: testToken.address,
        originalTokenAddress: testToken.address,
        tokenId: tokenId,
        amount: amount,
        originalChain: originalBridge,
        initialChain: originalBridge,
        targetChain: secondaryBridge,
        sender: user1,
        recipient: user2,
      })

      // VALIDATOR ORIGINAL --PROXY--> SECONDARY
      const secondaryIssuedTokenAddress = await proxyTranferFromOtherChainERC1155({
        logId: 'logId-1600',
        event: eventStep1,
        yarChain: yarBridge,
        targetChain: secondaryBridge,
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
        initialChain: secondaryBridge,
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
        targetChain: secondaryBridge,
        sender: user1,
        recipient: user2,
      })

      // VALIDATOR THIRD --PROXY--> SECONDARY
      await proxyTranferFromOtherChainERC1155({
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
      await testToken.mint(user1.address, tokenId, amount)

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
        targetChain: secondaryBridge,
        sender: user1,
        recipient: user2,
      })

      // VALIDATOR YAR(Original) --PROXY--> SECONDARY
      const secondaryIssuedTokenAddress = await tranferFromOtherChainERC1155({
        logId: 'logId-2200',
        event: eventStep1,
        targetChain: secondaryBridge,
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
        initialChain: secondaryBridge,
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


    /// ------------------------------------------------------------------------------
    ///
    /// BATCH
    ///
    ///-------------------------------------------------------------------------------

    it('Regular(batch) unit: ORIGINAL <---> YAR(issued tokens)', async () => {
      // Used bridges
      // YarBridge and:
      const originalBridge = polygonBridge
      // Test token
      await testToken.mintBatch(user1.address, tokenIds, amounts)

      // Original approve first
      await testToken.connect(user1).setApprovalForAll(originalBridge.address, true)

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
      // Used bridges
      // YarBridge and:
      const originalBridge = polygonBridge
      const secondaryBridge = binanceBridge

      // Test token
      await testToken.mintBatch(user1.address, tokenIds, amounts)

      // *** Before cretate ISSUED tokens on YAR

      // Original approve first
      await testToken.connect(user1).setApprovalForAll(originalBridge.address, true)

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
        targetChain: secondaryBridge,
        sender: user2,
        recipient: user1,
      })

      // VALIDATOR YAR -> SECONDARY
      const secondaryIssuedTokenAddress = await batchTranferFromOtherChainERC1155({
        logId: 'logId-800',
        event: eventStep2,
        targetChain: secondaryBridge,
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
        initialChain: secondaryBridge,
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
      // Used bridges
      // Yar and:
      const originalBridge = polygonBridge
      const secondaryBridge = binanceBridge

      // Test token
      await testToken.mintBatch(user1.address, tokenIds, amounts)

      await testToken.connect(user1).setApprovalForAll(originalBridge.address, true)

      // User ORIGIINAL ---> SECONDARY
      const eventStep1 = await batchTranferToOtherChainERC1155({
        logId: 'logId-1100',
        transferedTokenAddress: testToken.address,
        originalTokenAddress: testToken.address,
        tokenIds: tokenIds,
        amounts: amounts,
        originalChain: originalBridge,
        initialChain: originalBridge,
        targetChain: secondaryBridge,
        sender: user1,
        recipient: user2,
      })

      // VALIDATOR ORIGINAL --PROXY--> SECONDARY
      const secondaryIssuedTokenAddress = await proxyBatchTranferFromOtherChainERC1155({
        logId: 'logId-1200',
        event: eventStep1,
        yarChain: yarBridge,
        targetChain: secondaryBridge,
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
        initialChain: secondaryBridge,
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
      // Used bridges
      // Yar and:
      const originalBridge = polygonBridge
      const secondaryBridge = binanceBridge
      const thirdBridge = ethereumBridge

      // Test token
      await testToken.mintBatch(user1.address, tokenIds, amounts)

      /// *** Before trasfer from ORIGIANL to SECONDARY

      await testToken.connect(user1).setApprovalForAll(originalBridge.address, true)

      // User ORIGINAL to SECONDARY
      const eventStep1 = await batchTranferToOtherChainERC1155({
        logId: 'logId-1500',
        transferedTokenAddress: testToken.address,
        originalTokenAddress: testToken.address,
        tokenIds: tokenIds,
        amounts: amounts,
        originalChain: originalBridge,
        initialChain: originalBridge,
        targetChain: secondaryBridge,
        sender: user1,
        recipient: user2,
      })

      // VALIDATOR ORIGINAL --PROXY--> SECONDARY
      const secondaryIssuedTokenAddress = await proxyBatchTranferFromOtherChainERC1155({
        logId: 'logId-1600',
        event: eventStep1,
        yarChain: yarBridge,
        targetChain: secondaryBridge,
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
        initialChain: secondaryBridge,
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
        targetChain: secondaryBridge,
        sender: user1,
        recipient: user2,
      })

      // VALIDATOR THIRD --PROXY--> SECONDARY
      await proxyBatchTranferFromOtherChainERC1155({
        logId: 'logId-2000',
        event: eventStep3,
        yarChain: yarBridge,
        targetChain: secondaryBridge,
        validator,
      })
    })

    it('Regular(batch) unit: YAR(is ORIGINAL, not issued tokens) <---> SECONDARY', async () => {
      // Used bridges
      // YarBridge and:
      const originalBridge = yarBridge
      const secondaryBridge = polygonBridge

      // Test token
      await testToken.mintBatch(user1.address, tokenIds, amounts)

      // Original approve first
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
        targetChain: secondaryBridge,
        sender: user1,
        recipient: user2,
      })

      // VALIDATOR YAR(Original) --PROXY--> SECONDARY
      const secondaryIssuedTokenAddress = await batchTranferFromOtherChainERC1155({
        logId: 'logId-2200',
        event: eventStep1,
        targetChain: secondaryBridge,
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
        initialChain: secondaryBridge,
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

import { ethers, deployments } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  BridgeERC1155,
  BridgeERC1155__factory,
  MockERC1155,
  MockERC1155__factory,
} from '../../typechain-types'
import { EthersUtils } from 'ethers_utils'
import { ContractReceipt } from 'ethers'

export class BridgeERC1155E2EUtils {
  private _validator: SignerWithAddress
  private _user1: SignerWithAddress
  private _user2: SignerWithAddress
  private _yarBridge: BridgeERC1155
  private _polygonBridge: BridgeERC1155
  private _binanceBridge: BridgeERC1155
  private _ethereumBridge: BridgeERC1155
  private _testToken: MockERC1155

  private amount = 100
  private amounts = [100, 200, 1]

  async init() {
    const accounts = await ethers.getSigners()
    this._validator = accounts[0]
    this._user1 = accounts[8]
    this._user2 = accounts[9]

    const YarBridgeDeployment = await deployments.get('YarBridgeERC1155')
    const PolygonBridgeDeployment = await deployments.get('PolygonBridgeERC1155')
    const BinanceBridgeDeployment = await deployments.get('BinanceBridgeERC1155')
    const EthereumBridgeDeployment = await deployments.get('EthereumBridgeERC1155')
    const MockERC1155Deployment = await deployments.get('MockERC1155')

    this._yarBridge = BridgeERC1155__factory.connect(YarBridgeDeployment.address, this._validator)
    this._polygonBridge = BridgeERC1155__factory.connect(
      PolygonBridgeDeployment.address,
      this._validator,
    )
    this._binanceBridge = BridgeERC1155__factory.connect(
      BinanceBridgeDeployment.address,
      this._validator,
    )
    this._ethereumBridge = BridgeERC1155__factory.connect(
      EthereumBridgeDeployment.address,
      this._validator,
    )
    this._testToken = MockERC1155__factory.connect(MockERC1155Deployment.address, this._validator)
  }

  async originalToYar(tokenId: number): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const sender = this._user1
      const recipient = this._user2
      const _testToken = this._testToken.connect(sender)
      const originalBridge = this._polygonBridge
      const _yarBridge = this._yarBridge

      await (await _testToken.mint(sender.address, tokenId, this.amount)).wait()

      await (await _testToken.setApprovalForAll(originalBridge.address, true)).wait()

      const tx = await originalBridge.connect(sender).tranferToOtherChain(
        _testToken.address, // _transferedToken
        tokenId, // _tokenId
        this.amount, // _tokenId
        await _yarBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      _yarBridge.once(_yarBridge.filters.TransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async yarToOriginal(tokenId: number): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._polygonBridge
      const sender = this._user2
      const recipient = this._user1
      const _yarBridge = this._yarBridge
      const _testToken = this._testToken.connect(sender)

      const issuedTokenAddress = await _yarBridge.getIssuedTokenAddress(
        await originalBridge.currentChain(),
        EthersUtils.addressToBytes(_testToken.address),
      )

      const tx = await _yarBridge.connect(sender).tranferToOtherChain(
        issuedTokenAddress, // _transferedToken
        tokenId, // _tokenId
        this.amount, // amount
        await originalBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
        // _recipient
      )

      let receipt: ContractReceipt
      originalBridge.once(originalBridge.filters.TransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async originalToSecondary(tokenId: number): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._polygonBridge
      const secondaryBridge = this._binanceBridge
      const sender = this._user1
      const recipient = this._user2
      const _testToken = this._testToken.connect(sender)

      await (await _testToken.mint(sender.address, tokenId, this.amount)).wait()

      await (await _testToken.setApprovalForAll(originalBridge.address, true)).wait()

      const tx = await originalBridge.connect(sender).tranferToOtherChain(
        _testToken.address, // _transferedToken
        tokenId, // _tokenId
        this.amount, // amount
        await secondaryBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      secondaryBridge.once(secondaryBridge.filters.TransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async secondaryToOriginal(tokenId: number): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._polygonBridge
      const secondaryBridge = this._binanceBridge
      const sender = this._user2
      const recipient = this._user1
      const _testToken = this._testToken.connect(sender)

      const issuedTokenAddress = await secondaryBridge.getIssuedTokenAddress(
        await originalBridge.currentChain(),
        EthersUtils.addressToBytes(_testToken.address),
      )

      const tx = await secondaryBridge.connect(sender).tranferToOtherChain(
        issuedTokenAddress, // _transferedToken
        tokenId, // _tokenId
        this.amount, // amount
        await originalBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
        // _recipient
      )

      let receipt: ContractReceipt
      originalBridge.once(originalBridge.filters.TransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async secondaryToThird(tokenId: number): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._polygonBridge
      const secondaryBridge = this._binanceBridge
      const thirdBridge = this._ethereumBridge
      const sender = this._user2
      const recipient = this._user1
      const _testToken = this._testToken.connect(sender)

      const issuedTokenAddress = await secondaryBridge.getIssuedTokenAddress(
        await originalBridge.currentChain(),
        EthersUtils.addressToBytes(_testToken.address),
      )

      const tx = await secondaryBridge.connect(sender).tranferToOtherChain(
        issuedTokenAddress, // _transferedToken
        tokenId, // _tokenId
        this.amount, // amount
        await thirdBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
        // _recipient
      )

      let receipt: ContractReceipt
      thirdBridge.once(thirdBridge.filters.TransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async thirdToSecondary(tokenId: number): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._polygonBridge
      const secondaryBridge = this._binanceBridge
      const thirdBridge = this._ethereumBridge
      const sender = this._user1
      const recipient = this._user2
      const testToken = this._testToken.connect(sender)

      const issuedTokenAddress = await thirdBridge.getIssuedTokenAddress(
        await originalBridge.currentChain(),
        EthersUtils.addressToBytes(testToken.address),
      )

      const tx = await thirdBridge.connect(sender).tranferToOtherChain(
        issuedTokenAddress, // _transferedToken
        tokenId, // _tokenId
        this.amount, // amount
        await secondaryBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      secondaryBridge.once(secondaryBridge.filters.TransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async yarOriginalToSecondary(tokenId: number): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const yarBridge = this._yarBridge
      const secondaryBridge = this._polygonBridge
      const sender = this._user1
      const recipient = this._user2
      const testToken = this._testToken.connect(sender)

      await (await testToken.mint(sender.address, tokenId, this.amount)).wait()

      await (await testToken.setApprovalForAll(yarBridge.address, true)).wait()

      const tx = await yarBridge.connect(sender).tranferToOtherChain(
        testToken.address, // _transferedToken
        tokenId, // _tokenId
        this.amount, // amount
        await secondaryBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      secondaryBridge.once(secondaryBridge.filters.TransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async secondaryToYarOriginal(tokenId: number): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._yarBridge
      const secondaryBridge = this._polygonBridge
      const sender = this._user2
      const recipient = this._user1
      const testToken = this._testToken.connect(sender)

      const issuedTokenAddress = await secondaryBridge.getIssuedTokenAddress(
        await originalBridge.currentChain(),
        EthersUtils.addressToBytes(testToken.address),
      )

      const tx = await secondaryBridge.connect(sender).tranferToOtherChain(
        issuedTokenAddress, // _transferedToken
        tokenId, // _tokenId
        this.amount, // amount
        await originalBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      originalBridge.once(originalBridge.filters.TransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  /// ----------------------------------------------------------------------------------------------------
  /// Batch
  /// ----------------------------------------------------------------------------------------------------

  
  async batchOriginalToYar(tokenIds: number[]): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const sender = this._user1
      const recipient = this._user2
      const _testToken = this._testToken.connect(sender)
      const originalBridge = this._polygonBridge
      const _yarBridge = this._yarBridge

      await (await _testToken.mintBatch(sender.address, tokenIds, this.amounts)).wait()

      await (await _testToken.setApprovalForAll(originalBridge.address, true)).wait()

      const tx = await originalBridge.connect(sender).batchTranferToOtherChain(
        _testToken.address, // _transferedToken
        tokenIds, // _tokenIds
        this.amounts, // amountss
        await _yarBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      _yarBridge.once(_yarBridge.filters.BatchTransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async batchYarToOriginal(tokenIds: number[]): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._polygonBridge
      const sender = this._user2
      const recipient = this._user1
      const _yarBridge = this._yarBridge
      const _testToken = this._testToken.connect(sender)

      const issuedTokenAddress = await _yarBridge.getIssuedTokenAddress(
        await originalBridge.currentChain(),
        EthersUtils.addressToBytes(_testToken.address),
      )

      const tx = await _yarBridge.connect(sender).batchTranferToOtherChain(
        issuedTokenAddress, // _transferedToken
        tokenIds, // _tokenIds
        this.amounts, // amounts
        await originalBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
        // _recipient
      )

      let receipt: ContractReceipt
      originalBridge.once(originalBridge.filters.BatchTransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async batchOriginalToSecondary(tokenIds: number[]): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._polygonBridge
      const secondaryBridge = this._binanceBridge
      const sender = this._user1
      const recipient = this._user2
      const _testToken = this._testToken.connect(sender)

      await (await _testToken.mintBatch(sender.address, tokenIds, this.amounts)).wait()

      await (await _testToken.setApprovalForAll(originalBridge.address, true)).wait()

      const tx = await originalBridge.connect(sender).batchTranferToOtherChain(
        _testToken.address, // _transferedToken
        tokenIds, // _tokenIds
        this.amounts, // amounts
        await secondaryBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      secondaryBridge.once(secondaryBridge.filters.BatchTransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async batchSecondaryToOriginal(tokenIds: number[]): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._polygonBridge
      const secondaryBridge = this._binanceBridge
      const sender = this._user2
      const recipient = this._user1
      const _testToken = this._testToken.connect(sender)

      const issuedTokenAddress = await secondaryBridge.getIssuedTokenAddress(
        await originalBridge.currentChain(),
        EthersUtils.addressToBytes(_testToken.address),
      )

      const tx = await secondaryBridge.connect(sender).batchTranferToOtherChain(
        issuedTokenAddress, // _transferedToken
        tokenIds, // _tokenIds
        this.amounts, // amounts
        await originalBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
        // _recipient
      )

      originalBridge.once(originalBridge.filters.BatchTransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      const receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async batchSecondaryToThird(tokenIds: number[]): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._polygonBridge
      const secondaryBridge = this._binanceBridge
      const thirdBridge = this._ethereumBridge
      const sender = this._user2
      const recipient = this._user1
      const _testToken = this._testToken.connect(sender)

      const issuedTokenAddress = await secondaryBridge.getIssuedTokenAddress(
        await originalBridge.currentChain(),
        EthersUtils.addressToBytes(_testToken.address),
      )

      const tx = await secondaryBridge.connect(sender).batchTranferToOtherChain(
        issuedTokenAddress, // _transferedToken
        tokenIds, // _tokenId
        this.amounts, // amounts
        await thirdBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
        // _recipient
      )

      let receipt: ContractReceipt
      thirdBridge.once(thirdBridge.filters.BatchTransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async batchThirdToSecondary(tokenIds: number[]): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._polygonBridge
      const secondaryBridge = this._binanceBridge
      const thirdBridge = this._ethereumBridge
      const sender = this._user1
      const recipient = this._user2
      const testToken = this._testToken.connect(sender)

      const issuedTokenAddress = await thirdBridge.getIssuedTokenAddress(
        await originalBridge.currentChain(),
        EthersUtils.addressToBytes(testToken.address),
      )

      const tx = await thirdBridge.connect(sender).batchTranferToOtherChain(
        issuedTokenAddress, // _transferedToken
        tokenIds, // _tokenIds
        this.amounts, // amounts
        await secondaryBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      secondaryBridge.once(secondaryBridge.filters.BatchTransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async batchYarOriginalToSecondary(tokenIds: number[]): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const yarBridge = this._yarBridge
      const secondaryBridge = this._polygonBridge
      const sender = this._user1
      const recipient = this._user2
      const testToken = this._testToken.connect(sender)

      await (await testToken.mintBatch(sender.address, tokenIds, this.amounts)).wait()

      await (await testToken.setApprovalForAll(yarBridge.address, true)).wait()

      const tx = await yarBridge.connect(sender).batchTranferToOtherChain(
        testToken.address, // _transferedToken
        tokenIds, // _tokenIds
        this.amounts, // amounts
        await secondaryBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      secondaryBridge.once(secondaryBridge.filters.BatchTransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async batchSecondaryToYarOriginal(tokenIds: number[]): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._yarBridge
      const secondaryBridge = this._polygonBridge
      const sender = this._user2
      const recipient = this._user1
      const testToken = this._testToken.connect(sender)

      const issuedTokenAddress = await secondaryBridge.getIssuedTokenAddress(
        await originalBridge.currentChain(),
        EthersUtils.addressToBytes(testToken.address),
      )

      const tx = await secondaryBridge.connect(sender).batchTranferToOtherChain(
        issuedTokenAddress, // _transferedToken
        tokenIds, // _tokenIds
        this.amounts, // amounts
        await originalBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      originalBridge.once(originalBridge.filters.BatchTransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }
}

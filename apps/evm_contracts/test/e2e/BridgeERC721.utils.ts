import { ethers, deployments } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  BridgeERC721,
  BridgeERC721__factory,
  MockERC721,
  IERC721Metadata__factory,
  MockERC721__factory,
} from '../../typechain-types'
import { EthersUtils } from 'ethers_utils'
import { ContractReceipt } from 'ethers'

export class BridgeERC721E2EUtils {
  private _validator: SignerWithAddress
  private _user1: SignerWithAddress
  private _user2: SignerWithAddress
  private _yarBridge: BridgeERC721
  private _polygonBridge: BridgeERC721
  private _binanceBridge: BridgeERC721
  private _ethereumBridge: BridgeERC721
  private _testToken: MockERC721

  async init() {
    const accounts = await ethers.getSigners()
    this._validator = accounts[0]
    this._user1 = accounts[8]
    this._user2 = accounts[9]

    const YarBridgeDeployment = await deployments.get('YarBridgeERC721')
    const PolygonBridgeDeployment = await deployments.get('PolygonBridgeERC721')
    const BinanceBridgeDeployment = await deployments.get('BinanceBridgeERC721')
    const EthereumBridgeDeployment = await deployments.get('EthereumBridgeERC721')
    const MockERC721Deployment = await deployments.get('MockERC721')

    this._yarBridge = BridgeERC721__factory.connect(YarBridgeDeployment.address, this._validator)
    this._polygonBridge = BridgeERC721__factory.connect(
      PolygonBridgeDeployment.address,
      this._validator,
    )
    this._binanceBridge = BridgeERC721__factory.connect(
      BinanceBridgeDeployment.address,
      this._validator,
    )
    this._ethereumBridge = BridgeERC721__factory.connect(
      EthereumBridgeDeployment.address,
      this._validator,
    )
    this._testToken = MockERC721__factory.connect(MockERC721Deployment.address, this._validator)
  }

  async originalToYar(tokenId: number): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const sender = this._user1
      const recipient = this._user2
      const _testToken = this._testToken.connect(sender)
      const originalBridge = this._polygonBridge
      const _yarBridge = this._yarBridge

      await (await _testToken.mint(tokenId, sender.address)).wait()

      await (await _testToken.approve(originalBridge.address, tokenId)).wait()

      const tx = await originalBridge.connect(sender).tranferToOtherChain(
        _testToken.address, // _transferedToken
        tokenId, // _tokenId
        await _yarBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      _yarBridge.once(_yarBridge.filters.TransferFromOtherChain(), async () => {
        resolve(receipt)
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
      const issuedToken = IERC721Metadata__factory.connect(issuedTokenAddress, sender)

      const tx = await _yarBridge.connect(sender).tranferToOtherChain(
        issuedToken.address, // _transferedToken
        tokenId, // _tokenId
        await originalBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
        // _recipient
      )

      let receipt: ContractReceipt
      originalBridge.once(originalBridge.filters.TransferFromOtherChain(), async () => {
        resolve(receipt)
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

      await (await _testToken.mint(tokenId, sender.address)).wait()

      await (await _testToken.approve(originalBridge.address, tokenId)).wait()

      const tx = await originalBridge.connect(sender).tranferToOtherChain(
        _testToken.address, // _transferedToken
        tokenId, // _tokenId
        await secondaryBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      secondaryBridge.once(secondaryBridge.filters.TransferFromOtherChain(), async () => {
        resolve(receipt)
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
      const issuedToken = IERC721Metadata__factory.connect(issuedTokenAddress, sender)

      const tx = await secondaryBridge.connect(sender).tranferToOtherChain(
        issuedToken.address, // _transferedToken
        tokenId, // _tokenId
        await originalBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
        // _recipient
      )

      let receipt: ContractReceipt
      originalBridge.once(originalBridge.filters.TransferFromOtherChain(), async () => {
        resolve(receipt)
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
      const issuedToken = IERC721Metadata__factory.connect(issuedTokenAddress, sender)

      const tx = await secondaryBridge.connect(sender).tranferToOtherChain(
        issuedToken.address, // _transferedToken
        tokenId, // _tokenId
        await thirdBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
        // _recipient
      )

      let receipt: ContractReceipt
      thirdBridge.once(thirdBridge.filters.TransferFromOtherChain(), async () => {
        resolve(receipt)
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

      const issuedToken = IERC721Metadata__factory.connect(issuedTokenAddress, sender)

      const tx = await thirdBridge.connect(sender).tranferToOtherChain(
        issuedToken.address, // _transferedToken
        tokenId, // _tokenId
        await secondaryBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      secondaryBridge.once(secondaryBridge.filters.TransferFromOtherChain(), async () => {
        resolve(receipt)
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

      await (await testToken.mint(tokenId, sender.address)).wait()

      await (await testToken.approve(yarBridge.address, tokenId)).wait()

      const tx = await yarBridge.connect(sender).tranferToOtherChain(
        testToken.address, // _transferedToken
        tokenId, // _tokenId
        await secondaryBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      secondaryBridge.once(secondaryBridge.filters.TransferFromOtherChain(), async () => {
        resolve(receipt)
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
      const issuedToken = IERC721Metadata__factory.connect(issuedTokenAddress, sender)

      const tx = await secondaryBridge.connect(sender).tranferToOtherChain(
        issuedToken.address, // _transferedToken
        tokenId, // _tokenId
        await originalBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      originalBridge.once(originalBridge.filters.TransferFromOtherChain(), async () => {
        resolve(receipt)
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }
}

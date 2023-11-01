import { ethers, deployments } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  BridgeERC20,
  BridgeERC20__factory,
  IERC20Metadata,
  IERC20Metadata__factory,
} from '../../typechain-types'
import { NATIVE_TOKEN, WETH } from '../../constants/externalAddresses'
import ERC20MinterV2 from '../../test/utils/ERC20MinterV2'
import { EthersUtils } from 'ethers_utils'
import { ContractReceipt } from 'ethers'

export class BridgeERC20E2EUtils {
  private _validator: SignerWithAddress
  private _user1: SignerWithAddress
  private _user2: SignerWithAddress
  private _yarBridge: BridgeERC20
  private _polygonBridge: BridgeERC20
  private _binanceBridge: BridgeERC20
  private _ethereumBridge: BridgeERC20
  // private _testToken: IERC20Metadata
  private _testTokenAddress: string

  async init(testTokenAddress: string) {
    this._testTokenAddress = testTokenAddress

    const accounts = await ethers.getSigners()
    this._validator = accounts[0]
    this._user1 = accounts[8]
    this._user2 = accounts[9]

    const YarBridgeDeployment = await deployments.get('YarBridgeERC20')
    const PolygonBridgeDeployment = await deployments.get('PolygonBridgeERC20')
    const BinanceBridgeDeployment = await deployments.get('BinanceBridgeERC20')
    const EthereumBridgeDeployment = await deployments.get('EthereumBridgeERC20')

    this._yarBridge = BridgeERC20__factory.connect(YarBridgeDeployment.address, this._validator)
    this._polygonBridge = BridgeERC20__factory.connect(
      PolygonBridgeDeployment.address,
      this._validator,
    )
    this._binanceBridge = BridgeERC20__factory.connect(
      BinanceBridgeDeployment.address,
      this._validator,
    )
    this._ethereumBridge = BridgeERC20__factory.connect(
      EthereumBridgeDeployment.address,
      this._validator,
    )

    // this._testToken = IERC20Metadata__factory.connect(WETH, this._validator)
  }

  async originalToYar(): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const sender = this._user1
      const recipient = this._user2
      const originalBridge = this._polygonBridge
      const _yarBridge = this._yarBridge
      const _testTokenAddress = this._testTokenAddress

      const formatedAmount = 10000
      await ERC20MinterV2.mint(_testTokenAddress, sender.address, formatedAmount)
      let testTokenAmount = ethers.utils.parseUnits(`${formatedAmount}`, 18)

      if(_testTokenAddress != NATIVE_TOKEN) {
        const testToken = IERC20Metadata__factory.connect(_testTokenAddress, sender)
        testTokenAmount = await testToken.balanceOf(sender.address)
        await (await testToken.approve(originalBridge.address, testTokenAmount)).wait(1)
      }

      const tx = await originalBridge.connect(sender).tranferToOtherChain(
        _testTokenAddress, // _transferedToken
        testTokenAmount, // _amount
        await _yarBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
        {
          value: _testTokenAddress == NATIVE_TOKEN ? testTokenAmount : 0
        }
      )

      let receipt: ContractReceipt
      _yarBridge.once(_yarBridge.filters.TransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async yarToOriginal(): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._polygonBridge
      const sender = this._user2
      const recipient = this._user1
      const _yarBridge = this._yarBridge
      const _testTokenAddress = this._testTokenAddress

      const issuedTokenAddress = await _yarBridge.getIssuedTokenAddress(
        await originalBridge.currentChain(),
        EthersUtils.addressToBytes(_testTokenAddress),
      )
      const issuedToken = IERC20Metadata__factory.connect(issuedTokenAddress, sender)
      const issuedTokenBalance = await issuedToken.balanceOf(sender.address)
      const tx = await _yarBridge.connect(sender).tranferToOtherChain(
        issuedToken.address, // _transferedToken
        issuedTokenBalance, // _amount
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

  async originalToSecondary(): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._polygonBridge
      const secondaryBridge = this._binanceBridge
      const sender = this._user1
      const recipient = this._user2
      const _testTokenAddress = this._testTokenAddress

      const formatedAmount = 10000
      await ERC20MinterV2.mint(_testTokenAddress, sender.address, formatedAmount)
      let testTokenAmount = ethers.utils.parseUnits(`${formatedAmount}`, 18)

      if(_testTokenAddress != NATIVE_TOKEN) {
        const testToken = IERC20Metadata__factory.connect(_testTokenAddress, sender)
        testTokenAmount = await testToken.balanceOf(sender.address)
        await (await testToken.approve(originalBridge.address, testTokenAmount)).wait(1)
      }

      const tx = await originalBridge.connect(sender).tranferToOtherChain(
        _testTokenAddress, // _transferedToken
        testTokenAmount, // _amount
        await secondaryBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
        {
          value: _testTokenAddress == NATIVE_TOKEN ? testTokenAmount : 0
        }
      )

      let receipt: ContractReceipt
      secondaryBridge.once(secondaryBridge.filters.TransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async secondaryToOriginal(): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._polygonBridge
      const secondaryBridge = this._binanceBridge
      const sender = this._user2
      const recipient = this._user1
      const _testTokenAddress = this._testTokenAddress

      const issuedTokenAddress = await secondaryBridge.getIssuedTokenAddress(
        await originalBridge.currentChain(),
        EthersUtils.addressToBytes(_testTokenAddress),
      )
      const issuedToken = IERC20Metadata__factory.connect(issuedTokenAddress, sender)
      const issuedTokenBalance = await issuedToken.balanceOf(sender.address)

      const tx = await secondaryBridge.connect(sender).tranferToOtherChain(
        issuedToken.address, // _transferedToken
        issuedTokenBalance, // _amount
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

  async secondaryToThird(): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._polygonBridge
      const secondaryBridge = this._binanceBridge
      const thirdBridge = this._ethereumBridge
      const sender = this._user2
      const recipient = this._user1
      const _testTokenAddress = this._testTokenAddress

      const issuedTokenAddress = await secondaryBridge.getIssuedTokenAddress(
        await originalBridge.currentChain(),
        EthersUtils.addressToBytes(_testTokenAddress),
      )
      const issuedToken = IERC20Metadata__factory.connect(issuedTokenAddress, sender)
      const issuedTokenBalance = await issuedToken.balanceOf(sender.address)

      const tx = await secondaryBridge.connect(sender).tranferToOtherChain(
        issuedToken.address, // _transferedToken
        issuedTokenBalance, // _amount
        await thirdBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
      )

      let receipt: ContractReceipt
      thirdBridge.once(thirdBridge.filters.TransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async thirdToSecondary(): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._polygonBridge
      const secondaryBridge = this._binanceBridge
      const thirdBridge = this._ethereumBridge
      const sender = this._user1
      const recipient = this._user2
      const _testTokenAddress = this._testTokenAddress

      const issuedTokenAddress = await thirdBridge.getIssuedTokenAddress(
        await originalBridge.currentChain(),
        EthersUtils.addressToBytes(_testTokenAddress),
      )

      const issuedToken = IERC20Metadata__factory.connect(issuedTokenAddress, sender)
      const issuedTokenBalance = await issuedToken.balanceOf(sender.address)

      const tx = await thirdBridge.connect(sender).tranferToOtherChain(
        issuedToken.address, // _transferedToken
        issuedTokenBalance, // _amount
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

  async yarOriginalToSecondary(): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const yarBridge = this._yarBridge
      const secondaryBridge = this._polygonBridge
      const sender = this._user1
      const recipient = this._user2
      const _testTokenAddress = this._testTokenAddress

      const formatedAmount = 10000
      await ERC20MinterV2.mint(_testTokenAddress, sender.address, formatedAmount)
      let testTokenAmount = ethers.utils.parseUnits(`${formatedAmount}`, 18)

      if(_testTokenAddress != NATIVE_TOKEN) {
        const testToken = IERC20Metadata__factory.connect(_testTokenAddress, sender)
        testTokenAmount = await testToken.balanceOf(sender.address)
        await (await testToken.approve(yarBridge.address, testTokenAmount)).wait(1)
      }

      const tx = await yarBridge.connect(sender).tranferToOtherChain(
        _testTokenAddress, // _transferedToken
        testTokenAmount, // _amount
        await secondaryBridge.currentChain(), // _targetChainName
        EthersUtils.addressToBytes(recipient.address), // _recipient
        {
          value: _testTokenAddress == NATIVE_TOKEN ? testTokenAmount : 0
        }
      )

      let receipt: ContractReceipt
      secondaryBridge.once(secondaryBridge.filters.TransferFromOtherChain(), async () => {
        resolve(await tx.wait())
      })

      receipt = await tx.wait()
      if (receipt.status == 0) resolve(receipt)
    })
  }

  async secondaryToYarOriginal(): Promise<ContractReceipt> {
    return new Promise(async (resolve, reject) => {
      const originalBridge = this._yarBridge
      const secondaryBridge = this._polygonBridge
      const sender = this._user2
      const recipient = this._user1
      const _testTokenAddress = this._testTokenAddress

      const issuedTokenAddress = await secondaryBridge.getIssuedTokenAddress(
        await originalBridge.currentChain(),
        EthersUtils.addressToBytes(_testTokenAddress),
      )
      const issuedToken = IERC20Metadata__factory.connect(issuedTokenAddress, sender)
      const issuedTokenBalance = await issuedToken.balanceOf(sender.address)

      const tx = await secondaryBridge.connect(sender).tranferToOtherChain(
        issuedToken.address, // _transferedToken
        issuedTokenBalance, // _amount
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
}

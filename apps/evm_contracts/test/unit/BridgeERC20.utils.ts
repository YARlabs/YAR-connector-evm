import { BridgeERC20, IERC20Metadata__factory } from '../../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert, expect } from 'chai'
import { ContractReceiptUtils } from '../../utils/ContractReceiptUtils'
import { BigNumber } from 'ethers'
import { EthersUtils } from 'ethers_utils'
import { TransferToOtherChainEventObject } from '../../typechain-types/contracts/BridgeERC20'

export async function tranferToOtherChainERC20({
  logId,
  transferedTokenAddress,
  originalTokenAddress,
  amount,
  originalChain,
  initialChain,
  targetChain,
  sender,
  recipient,
}: {
  logId: string
  transferedTokenAddress: string
  originalTokenAddress: string
  amount: BigNumber
  originalChain: BridgeERC20
  initialChain: BridgeERC20
  targetChain: BridgeERC20
  sender: SignerWithAddress
  recipient: SignerWithAddress
}): Promise<TransferToOtherChainEventObject> {
  // Token
  const transferedToken = IERC20Metadata__factory.connect(transferedTokenAddress, sender)

  // User transfer
  const txStep1 = await initialChain.connect(sender).tranferToOtherChain(
    transferedToken.address, // _transferedToken
    amount, // _amount
    await targetChain.currentChain(), // _targetChainName
    EthersUtils.addressToBytes(recipient.address), // _recipient
  )
  const receiptStep1 = await txStep1.wait()

  // Expect event
  console.log(`${logId}`)
  const nonce = (await initialChain.nonce()).sub(1)
  const transferId = await initialChain.getTranferId(nonce, initialChain.currentChain())
  const originalToken = IERC20Metadata__factory.connect(originalTokenAddress, sender)
  await expect(txStep1).to.emit(initialChain, 'TransferToOtherChain').withArgs(
    transferId, // transferId
    nonce, // nonce
    await initialChain.currentChain(), // initialChain
    await originalChain.currentChain(), // originalChain
    EthersUtils.addressToBytes(originalTokenAddress), // originalTokenAddress
    await targetChain.currentChain(), // targetChain
    amount, // tokenAmount
    EthersUtils.addressToBytes(sender.address), // sender
    EthersUtils.addressToBytes(recipient.address), // recipient
    await originalToken.name(),
    await originalToken.symbol(),
    await originalToken.decimals(),
  )

  // Assert balance
  const senderBalanceStep1 = await transferedToken.balanceOf(recipient.address)
  assert(
    senderBalanceStep1.eq(0),
    `${logId} | Tokens not transfered, senderBalanceStep1 != 0. ${senderBalanceStep1} != ${0}`,
  )

  // Get event data
  const eventStep1 = ContractReceiptUtils.getEvent(
    receiptStep1.events,
    initialChain,
    initialChain.filters.TransferToOtherChain(),
  )
  return eventStep1.args
}

export async function tranferFromOtherChainERC20({
  logId,
  event,
  targetChain,
  validator,
}: {
  logId: string
  event: TransferToOtherChainEventObject
  targetChain: BridgeERC20
  validator: SignerWithAddress
}): Promise<string> {
  // Recipent balance
  const recipientBalanceBefore = await targetChain.balances(
    event.originalChain,
    event.originalTokenAddress,
    EthersUtils.bytesToAddress(event.recipient),
  )

  // Validator from SECONDARY to YAR(ORIGINAL)
  const tx = await targetChain.connect(validator).tranferFromOtherChain(
    event.nonce, // externalNonce
    event.originalChain, // originalChain,
    event.originalTokenAddress, // originalTokenAddress
    event.initialChain, // initialChain
    event.targetChain, // targetChain
    event.tokenAmount, // amount,
    event.sender, // sender
    event.recipient, // recipient
    {
      name: event.tokenName,
      symbol: event.tokenSymbol,
      decimals: event.tokenDecimals,
    }, // tokenCreateInfo
  )
  await tx.wait()

  // Assert balance
  const recipientBalanceAfter = await targetChain.balances(
    event.originalChain,
    event.originalTokenAddress,
    EthersUtils.bytesToAddress(event.recipient),
  )
  const balancesDiff = recipientBalanceAfter.sub(recipientBalanceBefore)
  assert(
    balancesDiff.eq(event.tokenAmount) || balancesDiff.add(1).eq(event.tokenAmount), // or add 1 - some tokens less 1 wei
    `${logId} | Tokens not transfered, balancesDiff != tokenAmount. ${balancesDiff} != ${event.tokenAmount}`,
  )

  const issuedTokenAddress = await targetChain.getIssuedTokenAddress(
    event.originalChain,
    event.originalTokenAddress,
  )

  return issuedTokenAddress
}

export async function proxyTranferFromOtherChainERC20({
  logId,
  event,
  yarChain,
  targetChain,
  validator,
}: {
  logId: string
  event: TransferToOtherChainEventObject
  yarChain: BridgeERC20
  targetChain: BridgeERC20
  validator: SignerWithAddress
}): Promise<string> {
  // Bridge balance
  let bridgeBalanceBeforeStep1 = await yarChain.balances(
    event.originalChain,
    event.originalTokenAddress,
    yarChain.address,
  )

  // Validator from INITIAL to YAR
  const txStep1 = await yarChain.connect(validator).tranferFromOtherChain(
    event.nonce, // externalNonce
    event.originalChain, // originalChain,
    event.originalTokenAddress, // originalTokenAddress
    event.initialChain, // initialChain
    event.targetChain, // targetChain
    event.tokenAmount, // amount,
    event.sender, // sender
    event.recipient, // recipient
    {
      name: event.tokenName,
      symbol: event.tokenSymbol,
      decimals: event.tokenDecimals,
    }, // tokenCreateInfo
  )
  await txStep1.wait()

  // Expect event
  console.log(`${logId}`)
  const originalToken = IERC20Metadata__factory.connect(EthersUtils.bytesToAddress(event.originalTokenAddress), validator)
  const transferId = await yarChain.getTranferId(event.nonce, event.initialChain)
  await expect(txStep1).to.emit(yarChain, 'TransferToOtherChain').withArgs(
    transferId, // transferId
    event.nonce, // nonce
    event.initialChain, // initialChain
    event.originalChain, // originalChain
    event.originalTokenAddress, // originalTokenAddress
    await targetChain.currentChain(), // targetChain
    event.tokenAmount, // tokenAmount
    event.sender, // sender
    event.recipient, // recipient
    await originalToken.name(),
    await originalToken.symbol(),
    await originalToken.decimals(),
  )

  // Assert blances
  let bridgeBalanceAfterStep1 = await yarChain.balances(
    event.originalChain,
    event.originalTokenAddress,
    yarChain.address,
  )
  
  if ((await targetChain.currentChain()) == event.originalChain) {
    // BURN. transfer to ORIGINAL chain
    assert(
      bridgeBalanceBeforeStep1.sub(event.tokenAmount).eq(bridgeBalanceAfterStep1),
      `${logId} | Tokens not burned, bridgeBalanceBeforeStep1 - tokenAmount != bridgeBalanceAfterStep1. ${bridgeBalanceBeforeStep1} - ${event.tokenAmount} != ${bridgeBalanceAfterStep1}`,
    )
  } else if (event.initialChain == event.originalChain) {
    // LOCK. transfer to SECONDARY chain
    assert(
      bridgeBalanceBeforeStep1.add(event.tokenAmount).eq(bridgeBalanceAfterStep1),
      `${logId} | Tokens not locked, bridgeBalanceBeforeStep1 + tokenAmount != bridgeBalanceAfterStep1. ${bridgeBalanceBeforeStep1} + ${event.tokenAmount} != ${bridgeBalanceAfterStep1}`,
    )
  } else {
    // Nothing
    assert(
      bridgeBalanceBeforeStep1.eq(bridgeBalanceAfterStep1),
      `${logId} | bridgeBalanceBeforeStep1 != bridgeBalanceAfterStep1. ${bridgeBalanceBeforeStep1} != ${bridgeBalanceAfterStep1}`,
    )
  }

  // Bridge balance
  let recipientBalanceBeforeStep2 = await targetChain.balances(
    event.originalChain,
    event.originalTokenAddress,
    EthersUtils.bytesToAddress(event.recipient),
  )

  // Validator from YAR to TARGET
  const txStep2 = await targetChain.connect(validator).tranferFromOtherChain(
    event.nonce, // externalNonce
    event.originalChain, // originalChain,
    event.originalTokenAddress, // originalTokenAddress
    event.initialChain, // initialChain
    event.targetChain, // targetChain
    event.tokenAmount, // amount,
    event.sender, // sender
    event.recipient, // recipient
    {
      name: event.tokenName,
      symbol: event.tokenSymbol,
      decimals: event.tokenDecimals,
    }, // tokenCreateInfo
  )
  await txStep2.wait()

  // Assert blances
  let recipientBalanceAfterStep2 = await targetChain.balances(
    event.originalChain,
    event.originalTokenAddress,
    EthersUtils.bytesToAddress(event.recipient),
  )
  const recipeintBalancesDiffStep2 = recipientBalanceAfterStep2.sub(recipientBalanceBeforeStep2)
  assert(
    recipeintBalancesDiffStep2.eq(event.tokenAmount) ||
      recipeintBalancesDiffStep2.add(1).eq(event.tokenAmount), // or add 1 - some tokens less 1 wei
    `${logId} | Tokens not transfered, recipeintBalancesDiffStep2 != tokenAmount. ${recipeintBalancesDiffStep2} != ${event.tokenAmount}`,
  )

  const issuedTokenAddress = await targetChain.getIssuedTokenAddress(
    event.originalChain,
    event.originalTokenAddress,
  )

  return issuedTokenAddress
}

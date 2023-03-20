import { BridgeERC20, IERC20Metadata__factory } from '../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert, expect } from 'chai'
import { ContractReceiptUtils } from '../utils/ContractReceiptUtils'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { EthersUtils } from '../utils/EthersUtils'

export interface IEventTranferToOtherChainERC20 {
  nonce: BigNumber
  originalChainName: string
  originalTokenAddress: string
  initialChainName: string
  targetChainName: string
  tokenAmount: BigNumber
  sender: string
  recipient: string
}

export interface IParsedEventTranferToOtherChainERC20 {
  nonce: BigNumber
  originalChainName: string
  originalTokenAddress: string
  initialChainName: string
  targetChainName: string
  tokenAmount: BigNumber
  sender: string
  recipient: string
  tokenCreateInfo: {
    name: string
    symbol: string
    decimals: number
  }
}

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
}): Promise<IEventTranferToOtherChainERC20> {
  // Token
  const transferedToken = IERC20Metadata__factory.connect(transferedTokenAddress, sender)

  // User transfer
  const txStep1 = await initialChain.connect(sender).tranferToOtherChain(
    transferedToken.address, // _transferedToken
    amount, // _amount
    targetChain.currentChain(), // _targetChainName
    EthersUtils.addressToBytes(recipient.address), // _recipient
  )

  // Expect event
  console.log(`${logId}`)
  const nonce = (await initialChain.nonce()).sub(1)
  const transferId = await initialChain.getTranferId(nonce, initialChain.currentChain())
  const originalToken = IERC20Metadata__factory.connect(originalTokenAddress, sender)
  await expect(txStep1).to.emit(initialChain, 'TransferToOtherChain').withArgs(
    transferId, // transferId
    nonce, // nonce
    await initialChain.currentChain(), // initialChainName
    await originalChain.currentChain(), // originalChainName
    EthersUtils.addressToBytes(originalTokenAddress), // originalTokenAddress
    await targetChain.currentChain(), // targetChainName
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
  const receiptStep1 = await txStep1.wait()
  const eventStep1 = ContractReceiptUtils.getEvent(
    receiptStep1.events,
    initialChain,
    initialChain.filters.TransferToOtherChain(),
  )

  return {
    nonce: eventStep1.args.nonce,
    originalChainName: eventStep1.args.originalChain,
    originalTokenAddress: eventStep1.args.originalTokenAddress,
    initialChainName: eventStep1.args.initialChain,
    targetChainName: eventStep1.args.targetChain,
    tokenAmount: eventStep1.args.tokenAmount,
    sender: eventStep1.args.sender,
    recipient: eventStep1.args.recipient,
  }
}

export async function parseBridgeTransferEvent({
  callSigner,
  event,
  hasTokenCreateInfo = false,
}: {
  callSigner: SignerWithAddress
  event: IEventTranferToOtherChainERC20
  hasTokenCreateInfo?: boolean
}): Promise<IParsedEventTranferToOtherChainERC20> {
  const originalToken = IERC20Metadata__factory.connect(EthersUtils.bytesToAddress(event.originalTokenAddress), callSigner)
  return {
    nonce: event.nonce,
    originalChainName: event.originalChainName,
    originalTokenAddress: event.originalTokenAddress,
    initialChainName: event.initialChainName,
    targetChainName: event.targetChainName,
    tokenAmount: event.tokenAmount,
    sender: event.sender,
    recipient: event.recipient,
    tokenCreateInfo: {
      name: await originalToken.name(),
      symbol: await originalToken.symbol() ,
      decimals: await originalToken.decimals(),
    },
  }
}

export async function tranferFromOtherChainERC20({
  logId,
  parsedEvent,
  targetChain,
  validator,
}: {
  logId: string
  parsedEvent: IParsedEventTranferToOtherChainERC20
  targetChain: BridgeERC20
  validator: SignerWithAddress
}): Promise<string> {
  console.log(`aw1`)
  // Recipent balance
  const recipientBalanceBefore = await targetChain.balances(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
    EthersUtils.bytesToAddress(parsedEvent.recipient),
  )

  console.log(`aw12`)
  // Validator from SECONDARY to YAR(ORIGINAL)
  const tx = await targetChain.connect(validator).tranferFromOtherChain(
    parsedEvent.nonce, // externalNonce
    parsedEvent.originalChainName, // originalChainName,
    parsedEvent.originalTokenAddress, // originalTokenAddress
    parsedEvent.initialChainName, // initialChainName
    parsedEvent.targetChainName, // targetChainName
    parsedEvent.tokenAmount, // amount,
    parsedEvent.sender, // sender
    parsedEvent.recipient, // recipient
    parsedEvent.tokenCreateInfo, // tokenCreateInfo
  )

  console.log(`aw13 ${parsedEvent.originalTokenAddress}`)
  // Assert balance
  const recipientBalanceAfter = await targetChain.balances(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
    EthersUtils.bytesToAddress(parsedEvent.recipient),
  )
  const balancesDiff = recipientBalanceAfter.sub(recipientBalanceBefore)
  assert(
    balancesDiff.eq(parsedEvent.tokenAmount) || balancesDiff.add(1).eq(parsedEvent.tokenAmount), // or add 1 - some tokens less 1 wei
    `${logId} | Tokens not transfered, balancesDiff != tokenAmount. ${balancesDiff} != ${parsedEvent.tokenAmount}`,
  )

  console.log(`aw14`)
  const issuedTokenAddress = await targetChain.getIssuedTokenAddress(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
  )

  console.log(`aw15`)
  return issuedTokenAddress
}

export async function proxyTranferFromOtherChainERC20({
  logId,
  parsedEvent,
  yarChain,
  targetChain,
  yarValidator,
  targetValidator,
}: {
  logId: string
  parsedEvent: IParsedEventTranferToOtherChainERC20
  yarChain: BridgeERC20
  targetChain: BridgeERC20
  yarValidator: SignerWithAddress
  targetValidator: SignerWithAddress
}): Promise<string> {
  console.log(`aw1`)
  // Bridge balance
  let bridgeBalanceBeforeStep1 = await yarChain.balances(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
    yarChain.address,
  )

  console.log(`aw12`)
  // Validator from INITIAL to YAR
  const txStep1 = await yarChain.connect(yarValidator).tranferFromOtherChain(
    parsedEvent.nonce, // externalNonce
    parsedEvent.originalChainName, // originalChainName,
    parsedEvent.originalTokenAddress, // originalTokenAddress
    parsedEvent.initialChainName, // initialChainName
    parsedEvent.targetChainName, // targetChainName
    parsedEvent.tokenAmount, // amount,
    parsedEvent.sender, // sender
    parsedEvent.recipient, // recipient
    parsedEvent.tokenCreateInfo, // tokenCreateInfo
  )

  console.log(`aw13`)
  // Expect event
  console.log(`${logId}`)
  const originalToken = IERC20Metadata__factory.connect(EthersUtils.bytesToAddress(parsedEvent.originalTokenAddress), yarValidator)
  const transferId = await yarChain.getTranferId(parsedEvent.nonce, parsedEvent.initialChainName)
  await expect(txStep1).to.emit(yarChain, 'TransferToOtherChain').withArgs(
    transferId, // transferId
    parsedEvent.nonce, // nonce
    parsedEvent.initialChainName, // initialChainName
    parsedEvent.originalChainName, // originalChainName
    parsedEvent.originalTokenAddress, // originalTokenAddress
    await targetChain.currentChain(), // targetChainName
    parsedEvent.tokenAmount, // tokenAmount
    parsedEvent.sender, // sender
    parsedEvent.recipient, // recipient
    await originalToken.name(),
    await originalToken.symbol(),
    await originalToken.decimals(),
  )

  console.log(`aw14`)
  // Assert blances
  let bridgeBalanceAfterStep1 = await yarChain.balances(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
    yarChain.address,
  )
  const issuedToken = IERC20Metadata__factory.connect(await yarChain.getIssuedTokenAddress(parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress), yarValidator)
  console.log(`bridgeBalanceAfterStep1 ${bridgeBalanceAfterStep1}`)
  console.log(`yarChain.address ${await issuedToken.balanceOf(yarChain.address)}`)
  console.log(`yarChain.sender ${await issuedToken.balanceOf(EthersUtils.bytesToAddress(parsedEvent.sender))}`)
  console.log(`yarChain.recipient ${await issuedToken.balanceOf(EthersUtils.bytesToAddress(parsedEvent.recipient))}`)
  console.log(`aw15`)
  if ((await targetChain.currentChain()) == parsedEvent.originalChainName) {
    // BURN. transfer to ORIGINAL chain
    assert(
      bridgeBalanceBeforeStep1.sub(parsedEvent.tokenAmount).eq(bridgeBalanceAfterStep1),
      `${logId} | Tokens not burned, bridgeBalanceBeforeStep1 - tokenAmount != bridgeBalanceAfterStep1. ${bridgeBalanceBeforeStep1} - ${parsedEvent.tokenAmount} != ${bridgeBalanceAfterStep1}`,
    )
  } else if (parsedEvent.initialChainName == parsedEvent.originalChainName) {
    // LOCK. transfer to SECONDARY chain
    assert(
      bridgeBalanceBeforeStep1.add(parsedEvent.tokenAmount).eq(bridgeBalanceAfterStep1),
      `${logId} | Tokens not locked, bridgeBalanceBeforeStep1 + tokenAmount != bridgeBalanceAfterStep1. ${bridgeBalanceBeforeStep1} + ${parsedEvent.tokenAmount} != ${bridgeBalanceAfterStep1}`,
    )
  } else {
    // Nothing
    assert(
      bridgeBalanceBeforeStep1.eq(bridgeBalanceAfterStep1),
      `${logId} | bridgeBalanceBeforeStep1 != bridgeBalanceAfterStep1. ${bridgeBalanceBeforeStep1} != ${bridgeBalanceAfterStep1}`,
    )
  }

  console.log(`aw16`)
  // Bridge balance
  let recipientBalanceBeforeStep2 = await targetChain.balances(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
    EthersUtils.bytesToAddress(parsedEvent.recipient),
  )

  console.log(`aw17`)
  // Validator from YAR to TARGET
  const txStep2 = await targetChain.connect(targetValidator).tranferFromOtherChain(
    parsedEvent.nonce, // externalNonce
    parsedEvent.originalChainName, // originalChainName,
    parsedEvent.originalTokenAddress, // originalTokenAddress
    parsedEvent.initialChainName, // initialChainName
    parsedEvent.targetChainName, // targetChainName
    parsedEvent.tokenAmount, // amount,
    parsedEvent.sender, // sender
    parsedEvent.recipient, // recipient
    parsedEvent.tokenCreateInfo, // tokenCreateInfo
  )

  console.log(`aw18`)
  // Assert blances
  let recipientBalanceAfterStep2 = await targetChain.balances(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
    EthersUtils.bytesToAddress(parsedEvent.recipient),
  )
  const recipeintBalancesDiffStep2 = recipientBalanceAfterStep2.sub(recipientBalanceBeforeStep2)
  assert(
    recipeintBalancesDiffStep2.eq(parsedEvent.tokenAmount) ||
      recipeintBalancesDiffStep2.add(1).eq(parsedEvent.tokenAmount), // or add 1 - some tokens less 1 wei
    `${logId} | Tokens not transfered, recipeintBalancesDiffStep2 != tokenAmount. ${recipeintBalancesDiffStep2} != ${parsedEvent.tokenAmount}`,
  )

  console.log(`aw19`)
  const issuedTokenAddress = await targetChain.getIssuedTokenAddress(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
  )

  console.log(`aw110`)
  return issuedTokenAddress
}

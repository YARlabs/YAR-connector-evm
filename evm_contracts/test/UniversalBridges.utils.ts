import { IERC20Metadata__factory } from '../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert, expect } from 'chai'
import { UniversalBridgeContracts } from '../utils/UniversalBridgeContracts'
import { ContractReceiptUtils } from '../utils/ContractReceiptUtils'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'

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
  recipient: {
    evmAddress: string
    noEvmAddress: ''
  }
  tokenCreateInfo: {
    tokenName: string
    tokenSymbol: string
    tokenDecimals: number
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
  logId: string,
  transferedTokenAddress: string
  originalTokenAddress: string,
  amount: BigNumber
  originalChain: UniversalBridgeContracts
  initialChain: UniversalBridgeContracts
  targetChain: UniversalBridgeContracts
  sender: SignerWithAddress
  recipient: SignerWithAddress
}): Promise<IEventTranferToOtherChainERC20> {
  // Token
  const transferedToken = IERC20Metadata__factory.connect(transferedTokenAddress, sender)

  // User transfer
  const txStep1 = await initialChain.erc20Driver.connect(sender).tranferToOtherChainERC20(
    transferedToken.address, // _transferedToken
    amount, // _amount
    targetChain.chainName, // _targetChainName
    {
      evmAddress: recipient.address,
      noEvmAddress: '',
    }, // _recipient
  )

  // Expect event
  console.log(`${logId}`)
  const nonce = (await initialChain.erc20Driver.nonceERC20()).sub(1)
  const transferId = (await initialChain.erc20Driver.getTranferIdERC20(nonce, initialChain.chainName))
  await expect(txStep1)
    .to.emit(initialChain.erc20Driver, 'ERC20DriverTransferToOtherChain')
    .withArgs(
      transferId, // transferId
      nonce, // nonce
      initialChain.chainName, // initialChainName
      originalChain.chainName, // originalChainName
      originalTokenAddress.toLowerCase(), // originalTokenAddress
      targetChain.chainName, // targetChainName
      amount, // tokenAmount
      sender.address.toLowerCase(), // sender
      recipient.address.toLowerCase(), // recipient
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
    initialChain.erc20Driver,
    initialChain.erc20Driver.filters.ERC20DriverTransferToOtherChain(),
  )

  return {
    nonce: eventStep1.args.nonce,
    originalChainName: eventStep1.args.originalChainName,
    originalTokenAddress: eventStep1.args.originalTokenAddress,
    initialChainName: eventStep1.args.initialChainName,
    targetChainName: eventStep1.args.targetChainName,
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
  const originalToken = IERC20Metadata__factory.connect(event.originalTokenAddress, callSigner)
  return {
    nonce: event.nonce,
    originalChainName: event.originalChainName,
    originalTokenAddress: event.originalTokenAddress,
    initialChainName: event.initialChainName,
    targetChainName: event.targetChainName,
    tokenAmount: event.tokenAmount,
    sender: event.sender,
    recipient: {
      evmAddress: event.recipient,
      noEvmAddress: '',
    },
    tokenCreateInfo: {
      tokenName: hasTokenCreateInfo ? await originalToken.name() : '',
      tokenSymbol: hasTokenCreateInfo ? await originalToken.symbol() : '',
      tokenDecimals: hasTokenCreateInfo ? await originalToken.decimals() : 0,
    },
  }
}

export async function tranferFromOtherChainERC20({
  logId,
  parsedEvent,
  targetChain,
  validator,
}: {
  logId: string,
  parsedEvent: IParsedEventTranferToOtherChainERC20
  targetChain: UniversalBridgeContracts
  validator: SignerWithAddress
}) : Promise<string> {
  // Recipent balance
  const recipientBalanceBefore = await targetChain.erc20Driver.balancesERC20(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
    parsedEvent.recipient.evmAddress,
  )

  // Validator from SECONDARY to YAR(ORIGINAL)
  const tx = await targetChain.erc20Driver.connect(validator).tranferFromOtherChainERC20(
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

  // Assert balance
  const recipientBalanceAfter = await targetChain.erc20Driver.balancesERC20(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
    parsedEvent.recipient.evmAddress,
  )
  const balancesDiff = recipientBalanceAfter.sub(recipientBalanceBefore)
  assert(
    balancesDiff.eq(parsedEvent.tokenAmount) || balancesDiff.add(1).eq(parsedEvent.tokenAmount), // or add 1 - some tokens less 1 wei
    `${logId} | Tokens not transfered, balancesDiff != tokenAmount. ${balancesDiff} != ${parsedEvent.tokenAmount}`,
  )

  const issuedTokenAddress = await targetChain.erc20Driver.getIssuedTokenAddressERC20(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
  )

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
  logId: string,
  parsedEvent: IParsedEventTranferToOtherChainERC20
  yarChain: UniversalBridgeContracts
  targetChain: UniversalBridgeContracts
  yarValidator: SignerWithAddress,
  targetValidator: SignerWithAddress,
}) : Promise<string> {
  // Bridge balance
  let bridgeBalanceBeforeStep1 = await yarChain.erc20Driver.balancesERC20(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
    yarChain.address,
  )

  // Validator from INITIAL to YAR
  const txStep1 = await yarChain.erc20Driver.connect(yarValidator).tranferFromOtherChainERC20(
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

  // Expect event
  console.log(`${logId}`)
  
  const transferId = (await yarChain.erc20Driver.getTranferIdERC20(parsedEvent.nonce, parsedEvent.initialChainName))
  await expect(txStep1)
    .to.emit(yarChain.erc20Driver, 'ERC20DriverTransferToOtherChain')
    .withArgs(
      transferId, // transferId
      parsedEvent.nonce, // nonce
      parsedEvent.initialChainName, // initialChainName
      parsedEvent.originalChainName, // originalChainName
      parsedEvent.originalTokenAddress, // originalTokenAddress
      targetChain.chainName, // targetChainName
      parsedEvent.tokenAmount, // tokenAmount
      parsedEvent.sender, // sender
      parsedEvent.recipient.evmAddress, // recipient
    )

  // Assert blances
  let bridgeBalanceAfterStep1 = await yarChain.erc20Driver.balancesERC20(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
    yarChain.address,
  )
  if (targetChain.chainName == parsedEvent.originalChainName) {
    // BURN. transfer to ORIGINAL chain
    assert(
      bridgeBalanceBeforeStep1.sub(parsedEvent.tokenAmount).eq(bridgeBalanceAfterStep1),
      `${logId} | Tokens not burned, bridgeBalanceBeforeStep1 - tokenAmount != bridgeBalanceAfterStep1. ${bridgeBalanceBeforeStep1} - ${parsedEvent.tokenAmount} != ${bridgeBalanceAfterStep1}`,
    )
  } else if(parsedEvent.initialChainName == parsedEvent.originalChainName){
    // LOCK. transfer to SECONDARY chain
    assert(
      bridgeBalanceBeforeStep1.add(parsedEvent.tokenAmount).eq(bridgeBalanceAfterStep1),
      `${logId} | Tokens not locked, bridgeBalanceBeforeStep1 + tokenAmount != bridgeBalanceAfterStep1. ${bridgeBalanceBeforeStep1} + ${parsedEvent.tokenAmount} != ${bridgeBalanceAfterStep1}`,
    )
  } else {
    // Nothing
    assert(bridgeBalanceBeforeStep1.eq(bridgeBalanceAfterStep1), `${logId} | bridgeBalanceBeforeStep1 != bridgeBalanceAfterStep1. ${bridgeBalanceBeforeStep1} != ${bridgeBalanceAfterStep1}`)
  }

  // Bridge balance
  let recipientBalanceBeforeStep2 = await targetChain.erc20Driver.balancesERC20(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
    parsedEvent.recipient.evmAddress,
  )

  // Validator from YAR to TARGET
  const txStep2 = await targetChain.erc20Driver.connect(targetValidator).tranferFromOtherChainERC20(
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

  // Assert blances
  let recipientBalanceAfterStep2 = await targetChain.erc20Driver.balancesERC20(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
    parsedEvent.recipient.evmAddress,
  )
  const recipeintBalancesDiffStep2 = recipientBalanceAfterStep2.sub(recipientBalanceBeforeStep2)
  assert(
    recipeintBalancesDiffStep2.eq(parsedEvent.tokenAmount) || recipeintBalancesDiffStep2.add(1).eq(parsedEvent.tokenAmount), // or add 1 - some tokens less 1 wei
    `${logId} | Tokens not transfered, recipeintBalancesDiffStep2 != tokenAmount. ${recipeintBalancesDiffStep2} != ${parsedEvent.tokenAmount}`,
  )
  
  const issuedTokenAddress = await targetChain.erc20Driver.getIssuedTokenAddressERC20(
    parsedEvent.originalChainName,
    parsedEvent.originalTokenAddress,
  )

  return issuedTokenAddress
}

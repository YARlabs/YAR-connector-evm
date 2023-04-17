import { BridgeERC1155, IERC1155MetadataURI__factory } from '../../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert, expect } from 'chai'
import { ContractReceiptUtils } from '../../utils/ContractReceiptUtils'
import { BigNumber } from 'ethers'
import { EthersUtils } from 'ethers_utils'
import {
  BatchTransferToOtherChainEventObject,
  TransferToOtherChainEventObject,
} from '../../typechain-types/contracts/BridgeERC1155'

export async function tranferToOtherChainERC1155({
  logId,
  transferedTokenAddress,
  originalTokenAddress,
  tokenId,
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
  tokenId: number
  amount: number
  originalChain: BridgeERC1155
  initialChain: BridgeERC1155
  targetChain: BridgeERC1155
  sender: SignerWithAddress
  recipient: SignerWithAddress
}): Promise<TransferToOtherChainEventObject> {
  // Token
  const transferedToken = IERC1155MetadataURI__factory.connect(transferedTokenAddress, sender)

  // User transfer
  const txStep1 = await initialChain.connect(sender).tranferToOtherChain(
    transferedToken.address, // _transferedToken
    tokenId, // _tokenId
    amount, // _amount
    await targetChain.currentChain(), // _targetChainName
    EthersUtils.addressToBytes(recipient.address), // _recipient
  )
  const receiptStep1 = await txStep1.wait()

  // Expect event
  console.log(`${logId}`)
  const nonce = (await initialChain.nonce()).sub(1)
  const transferId = await initialChain.getTranferId(nonce, initialChain.currentChain())
  const originalToken = IERC1155MetadataURI__factory.connect(originalTokenAddress, sender)

  await expect(txStep1)
    .to.emit(initialChain, 'TransferToOtherChain')
    .withArgs(
      transferId, // transferId
      nonce, // nonce
      await initialChain.currentChain(), // initialChain
      await originalChain.currentChain(), // originalChain
      EthersUtils.addressToBytes(originalTokenAddress), // originalTokenAddress
      await targetChain.currentChain(), // targetChain
      tokenId, // _tokenId
      amount, // _amount
      EthersUtils.addressToBytes(sender.address), // sender
      EthersUtils.addressToBytes(recipient.address), // recipient
      await originalToken.uri(tokenId),
    )

  // Assert balance
  const senderBalanceStep1 = await transferedToken.balanceOf(recipient.address, tokenId)
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

export async function batchTranferToOtherChainERC1155({
  logId,
  transferedTokenAddress,
  originalTokenAddress,
  tokenIds,
  amounts,
  originalChain,
  initialChain,
  targetChain,
  sender,
  recipient,
}: {
  logId: string
  transferedTokenAddress: string
  originalTokenAddress: string
  tokenIds: number[]
  amounts: number[]
  originalChain: BridgeERC1155
  initialChain: BridgeERC1155
  targetChain: BridgeERC1155
  sender: SignerWithAddress
  recipient: SignerWithAddress
}): Promise<BatchTransferToOtherChainEventObject> {
  // Token
  const transferedToken = IERC1155MetadataURI__factory.connect(transferedTokenAddress, sender)

  // User transfer
  const txStep1 = await initialChain.connect(sender).batchTranferToOtherChain(
    transferedToken.address, // _transferedToken
    tokenIds, // _tokenIds
    amounts, // _amounts
    await targetChain.currentChain(), // _targetChainName
    EthersUtils.addressToBytes(recipient.address), // _recipient
  )
  const receiptStep1 = await txStep1.wait()

  // Expect event
  console.log(`${logId}`)
  const nonce = (await initialChain.nonce()).sub(1)
  const transferId = await initialChain.getTranferId(nonce, initialChain.currentChain())
  const originalToken = IERC1155MetadataURI__factory.connect(originalTokenAddress, sender)

  const uris = []
  for (const tokenId of tokenIds) {
    uris.push(await originalToken.uri(tokenId))
  }
  await expect(txStep1)
    .to.emit(initialChain, 'BatchTransferToOtherChain')
    .withArgs(
      transferId, // transferId
      nonce, // nonce
      await initialChain.currentChain(), // initialChain
      await originalChain.currentChain(), // originalChain
      EthersUtils.addressToBytes(originalTokenAddress), // originalTokenAddress
      await targetChain.currentChain(), // targetChain
      tokenIds, // _tokenIds
      amounts, // _amounts
      EthersUtils.addressToBytes(sender.address), // sender
      EthersUtils.addressToBytes(recipient.address), // recipient
      uris,
    )

  // Assert balance
  for (const tokenId of tokenIds) {
    const senderBalanceStep1 = await transferedToken.balanceOf(recipient.address, tokenId)
    assert(
      senderBalanceStep1.eq(0),
      `${logId} | Tokens id ${tokenId} not transfered, senderBalanceStep1 != 0. ${senderBalanceStep1} != ${0}`,
    )
  }

  // Get event data
  const eventStep1 = ContractReceiptUtils.getEvent(
    receiptStep1.events,
    initialChain,
    initialChain.filters.BatchTransferToOtherChain(),
  )
  return eventStep1.args
}

export async function tranferFromOtherChainERC1155({
  logId,
  event,
  targetChain,
  validator,
}: {
  logId: string
  event: TransferToOtherChainEventObject
  targetChain: BridgeERC1155
  validator: SignerWithAddress
}): Promise<string> {
  // Recipent balance
  const recipientBalanceBefore = await targetChain.balances(
    event.originalChain,
    event.originalTokenAddress,
    EthersUtils.bytesToAddress(event.recipient),
    event.tokenId,
  )

  // Validator from SECONDARY to YAR(ORIGINAL)
  const tx = await targetChain.connect(validator).tranferFromOtherChain(
    event.nonce, // externalNonce
    event.originalChain, // originalChain,
    event.originalTokenAddress, // originalTokenAddress
    event.initialChain, // initialChain
    event.targetChain, // targetChain
    event.tokenId, // tokenId,
    event.amount, // amount,
    event.sender, // sender
    event.recipient, // recipient
    event.tokenUri, // tokenUri
  )
  await tx.wait()

  // Assert balance
  const recipientBalanceAfter = await targetChain.balances(
    event.originalChain,
    event.originalTokenAddress,
    EthersUtils.bytesToAddress(event.recipient),
    event.tokenId,
  )
  const balancesDiff = recipientBalanceAfter.sub(recipientBalanceBefore)
  assert(
    balancesDiff.eq(event.amount),
    `${logId} | Tokens not transfered, balancesDiff != tokenAmount. ${balancesDiff} != ${event.amount}`,
  )

  const issuedTokenAddress = await targetChain.getIssuedTokenAddress(
    event.originalChain,
    event.originalTokenAddress,
  )

  return issuedTokenAddress
}

export async function batchTranferFromOtherChainERC1155({
  logId,
  event,
  targetChain,
  validator,
}: {
  logId: string
  event: BatchTransferToOtherChainEventObject
  targetChain: BridgeERC1155
  validator: SignerWithAddress
}): Promise<string> {
  // Recipent balance
  const recipientBalancesBefore = []
  for (const tokenId of event.tokenIds) {
    recipientBalancesBefore.push(await targetChain.balances(
      event.originalChain,
      event.originalTokenAddress,
      EthersUtils.bytesToAddress(event.recipient),
      tokenId,
    )) 
  }

  // Validator from SECONDARY to YAR(ORIGINAL)
  const tx = await targetChain.connect(validator).batchTranferFromOtherChain(
    event.nonce, // externalNonce
    event.originalChain, // originalChain,
    event.originalTokenAddress, // originalTokenAddress
    event.initialChain, // initialChain
    event.targetChain, // targetChain
    event.tokenIds, // tokenIds,
    event.amounts, // amounts,
    event.sender, // sender
    event.recipient, // recipient
    event.tokenUris, // tokenUris
  )
  await tx.wait()

  // Assert balance
  for (let i = 0; i < event.tokenIds.length; i++) {
    const tokenId = event.tokenIds[i]
    const amount = event.amounts[i]
    const recipientBalanceAfter = await targetChain.balances(
      event.originalChain,
      event.originalTokenAddress,
      EthersUtils.bytesToAddress(event.recipient),
      tokenId,
    )
    const balancesDiff = recipientBalanceAfter.sub(recipientBalancesBefore[i])
    assert(
      balancesDiff.eq(amount),
      `${logId} | Tokens not transfered, balancesDiff != tokenAmount. ${balancesDiff} != ${amount}`,
    )
  }

  const issuedTokenAddress = await targetChain.getIssuedTokenAddress(
    event.originalChain,
    event.originalTokenAddress,
  )

  return issuedTokenAddress
}

export async function proxyTranferFromOtherChainERC1155({
  logId,
  event,
  yarChain,
  targetChain,
  validator,
}: {
  logId: string
  event: TransferToOtherChainEventObject
  yarChain: BridgeERC1155
  targetChain: BridgeERC1155
  validator: SignerWithAddress
}): Promise<string> {
  // Bridge balance
  let bridgeBalanceBeforeStep1 = await yarChain.balances(
    event.originalChain,
    event.originalTokenAddress,
    yarChain.address,
    event.tokenId,
  )

  // Validator from INITIAL to YAR
  const txStep1 = await yarChain.connect(validator).tranferFromOtherChain(
    event.nonce, // externalNonce
    event.originalChain, // originalChain,
    event.originalTokenAddress, // originalTokenAddress
    event.initialChain, // initialChain
    event.targetChain, // targetChain
    event.tokenId, // tokenId
    event.amount, // amount
    event.sender, // sender
    event.recipient, // recipient
    event.tokenUri, // event.tokenUri
  )
  await txStep1.wait()

  // Expect event
  console.log(`${logId}`)
  const originalToken = IERC1155MetadataURI__factory.connect(
    EthersUtils.bytesToAddress(event.originalTokenAddress),
    validator,
  )
  const transferId = await yarChain.getTranferId(event.nonce, event.initialChain)
  await expect(txStep1)
    .to.emit(yarChain, 'TransferToOtherChain')
    .withArgs(
      transferId, // transferId
      event.nonce, // nonce
      event.initialChain, // initialChain
      event.originalChain, // originalChain
      event.originalTokenAddress, // originalTokenAddress
      await targetChain.currentChain(), // targetChain
      event.tokenId, // tokenId
      event.amount, // amount
      event.sender, // sender
      event.recipient, // recipient
      await originalToken.uri(event.tokenId),
    )

  // Assert blances
  let bridgeBalanceAfterStep1 = await yarChain.balances(
    event.originalChain,
    event.originalTokenAddress,
    yarChain.address,
    event.tokenId,
  )

  if ((await targetChain.currentChain()) == event.originalChain) {
    // BURN. transfer to ORIGINAL chain
    assert(
      bridgeBalanceBeforeStep1.sub(event.amount).eq(bridgeBalanceAfterStep1),
      `${logId} | Tokens not burned, bridgeBalanceBeforeStep1 - tokenAmount != bridgeBalanceAfterStep1. ${bridgeBalanceBeforeStep1} - ${event.amount} != ${bridgeBalanceAfterStep1}`,
    )
  } else if (event.initialChain == event.originalChain) {
    // LOCK. transfer to SECONDARY chain
    assert(
      bridgeBalanceBeforeStep1.add(event.amount).eq(bridgeBalanceAfterStep1),
      `${logId} | Tokens not locked, bridgeBalanceBeforeStep1 + tokenAmount != bridgeBalanceAfterStep1. ${bridgeBalanceBeforeStep1} + ${event.amount} != ${bridgeBalanceAfterStep1}`,
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
    event.tokenId,
  )

  // Validator from YAR to TARGET
  const txStep2 = await targetChain.connect(validator).tranferFromOtherChain(
    event.nonce, // externalNonce
    event.originalChain, // originalChain,
    event.originalTokenAddress, // originalTokenAddress
    event.initialChain, // initialChain
    event.targetChain, // targetChain
    event.tokenId, // tokenId
    event.amount, // amount
    event.sender, // sender
    event.recipient, // recipient
    event.tokenUri, // tokenUri
  )
  await txStep2.wait()

  // Assert blances
  let recipientBalanceAfterStep2 = await targetChain.balances(
    event.originalChain,
    event.originalTokenAddress,
    EthersUtils.bytesToAddress(event.recipient),
    event.tokenId,
  )
  const recipeintBalancesDiffStep2 = recipientBalanceAfterStep2.sub(recipientBalanceBeforeStep2)
  assert(
    recipeintBalancesDiffStep2.eq(event.amount),
    `${logId} | Tokens not transfered, recipeintBalancesDiffStep2 != tokenAmount. ${recipeintBalancesDiffStep2} != ${event.amount}`,
  )

  const issuedTokenAddress = await targetChain.getIssuedTokenAddress(
    event.originalChain,
    event.originalTokenAddress,
  )

  return issuedTokenAddress
}


export async function proxyBatchTranferFromOtherChainERC1155({
  logId,
  event,
  yarChain,
  targetChain,
  validator,
}: {
  logId: string
  event: BatchTransferToOtherChainEventObject
  yarChain: BridgeERC1155
  targetChain: BridgeERC1155
  validator: SignerWithAddress
}): Promise<string> {
  // Bridge balance
  const bridgeBalancesBeforeStep1 = []
  for (const tokenId of event.tokenIds) {
    bridgeBalancesBeforeStep1.push(await yarChain.balances(
      event.originalChain,
      event.originalTokenAddress,
      yarChain.address,
      tokenId,
    )) 
  }

  // Validator from INITIAL to YAR
  const txStep1 = await yarChain.connect(validator).batchTranferFromOtherChain(
    event.nonce, // externalNonce
    event.originalChain, // originalChain,
    event.originalTokenAddress, // originalTokenAddress
    event.initialChain, // initialChain
    event.targetChain, // targetChain
    event.tokenIds, // tokenIds
    event.amounts, // amounts
    event.sender, // sender
    event.recipient, // recipient
    event.tokenUris, // tokenUris
  )
  await txStep1.wait()

  // Expect event
  console.log(`${logId}`)
  const originalToken = IERC1155MetadataURI__factory.connect(
    EthersUtils.bytesToAddress(event.originalTokenAddress),
    validator,
  )
  const transferId = await yarChain.getTranferId(event.nonce, event.initialChain)
  const uris = []
  for (const tokenId of event.tokenIds) {
    uris.push(await originalToken.uri(tokenId))
  }
  await expect(txStep1)
    .to.emit(yarChain, 'BatchTransferToOtherChain')
    .withArgs(
      transferId, // transferId
      event.nonce, // nonce
      event.initialChain, // initialChain
      event.originalChain, // originalChain
      event.originalTokenAddress, // originalTokenAddress
      await targetChain.currentChain(), // targetChain
      event.tokenIds, // tokenIds
      event.amounts, // amounts
      event.sender, // sender
      event.recipient, // recipient
      uris,
    )

  // Assert blances
  for(let i = 0; i < event.tokenIds.length; i++) {
    const tokenId = event.tokenIds[i]
    const amount = event.amounts[i]
    let bridgeBalanceAfterStep1 = await yarChain.balances(
      event.originalChain,
      event.originalTokenAddress,
      yarChain.address,
      tokenId,
    )

    const bridgeBalanceBeforeStep1 = bridgeBalancesBeforeStep1[i]
  
    if ((await targetChain.currentChain()) == event.originalChain) {
      // BURN. transfer to ORIGINAL chain
      assert(
        bridgeBalanceBeforeStep1.sub(amount).eq(bridgeBalanceAfterStep1),
        `${logId} | Tokens not burned, bridgeBalanceBeforeStep1 - tokenAmount != bridgeBalanceAfterStep1. ${bridgeBalanceBeforeStep1} - ${amount} != ${bridgeBalanceAfterStep1}`,
      )
    } else if (event.initialChain == event.originalChain) {
      // LOCK. transfer to SECONDARY chain
      assert(
        bridgeBalanceBeforeStep1.add(amount).eq(bridgeBalanceAfterStep1),
        `${logId} | Tokens not locked, bridgeBalanceBeforeStep1 + tokenAmount != bridgeBalanceAfterStep1. ${bridgeBalanceBeforeStep1} + ${amount} != ${bridgeBalanceAfterStep1}`,
      )
    } else {
      // Nothing
      assert(
        bridgeBalanceBeforeStep1.eq(bridgeBalanceAfterStep1),
        `${logId} | bridgeBalanceBeforeStep1 != bridgeBalanceAfterStep1. ${bridgeBalanceBeforeStep1} != ${bridgeBalanceAfterStep1}`,
      )
    }  
  }
  
  // Bridge balance
  const recipientBalancesBeforeStep2 = []
  for (const tokenId of event.tokenIds) {
    recipientBalancesBeforeStep2.push(await targetChain.balances(
      event.originalChain,
      event.originalTokenAddress,
      EthersUtils.bytesToAddress(event.recipient),
      tokenId,
    )) 
  }

  // Validator from YAR to TARGET
  const txStep2 = await targetChain.connect(validator).batchTranferFromOtherChain(
    event.nonce, // externalNonce
    event.originalChain, // originalChain,
    event.originalTokenAddress, // originalTokenAddress
    event.initialChain, // initialChain
    event.targetChain, // targetChain
    event.tokenIds, // tokenIds
    event.amounts, // amounts
    event.sender, // sender
    event.recipient, // recipient
    event.tokenUris, // tokenUris
  )
  await txStep2.wait()

  // Assert blances
  for(let i = 0; i < event.tokenIds.length; i++) {
    const tokenId = event.tokenIds[i]
    const amount = event.amounts[i]
    let recipientBalanceAfterStep2 = await targetChain.balances(
      event.originalChain,
      event.originalTokenAddress,
      EthersUtils.bytesToAddress(event.recipient),
      tokenId,
    )
    const recipeintBalancesDiffStep2 = recipientBalanceAfterStep2.sub(recipientBalancesBeforeStep2[i])
    assert(
      recipeintBalancesDiffStep2.eq(amount),
      `${logId} | Tokens not transfered, recipeintBalancesDiffStep2 != tokenAmount. ${recipeintBalancesDiffStep2} != ${amount}`,
    )
  
  }
  
  const issuedTokenAddress = await targetChain.getIssuedTokenAddress(
    event.originalChain,
    event.originalTokenAddress,
  )

  return issuedTokenAddress
}

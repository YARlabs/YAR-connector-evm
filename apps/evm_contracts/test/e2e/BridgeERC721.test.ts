import { ethers } from "hardhat"
import { BridgeERC721E2EUtils } from "./BridgeERC721.utils"
import { assert } from 'chai'

describe(`test_key_e2e BridgeERC721`, () => {
  let utils: BridgeERC721E2EUtils

  before(async () => {
    utils = new BridgeERC721E2EUtils()
    await utils.init()
  })

  it('ORIGINAL <-> YAR', async () => {
    const tokenId = 1

    const res1 = await utils.originalToYar(tokenId)
    assert(res1.status == 1, "res1 failure!")

    const res2 = await utils.yarToOriginal(tokenId)
    assert(res2.status == 1, "res2 failure!")
  })
  
  it('ORIGINAL <-> SECONDARY', async () => {
    const tokenId = 2
    
    const res1 = await utils.originalToSecondary(tokenId)
    assert(res1.status == 1, "res1 failure!")

    const res2 = await utils.secondaryToOriginal(tokenId)
    assert(res2.status == 1, "res2 failure!")
  })

  it('SECONDARY <-> THIRD', async () => {
    const tokenId = 3
    
    const res0 = await utils.originalToSecondary(tokenId)
    assert(res0.status == 1, "res0 failure!")

    const res1 = await utils.secondaryToThird(tokenId)
    assert(res1.status == 1, "res1 failure!")

    const res2 = await utils.thirdToSecondary(tokenId)
    assert(res2.status == 1, "res2 failure!")
  })
  
  it('YAR ORIGINAL <-> SECONDARY', async () => {
    const tokenId = 4
    
    const res1 = await utils.yarOriginalToSecondary(tokenId)
    assert(res1.status == 1, "res1 failure!")

    const res2 = await utils.secondaryToYarOriginal(tokenId)
    assert(res2.status == 1, "res2 failure!")
  })

})
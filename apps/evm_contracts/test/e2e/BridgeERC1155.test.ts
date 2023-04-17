import { BridgeERC1155E2EUtils } from "./BridgeERC1155.utils"
import { assert } from 'chai'

describe(`test_key_e2e BridgeERC1155`, () => {
  let utils: BridgeERC1155E2EUtils

  before(async () => {
    utils = new BridgeERC1155E2EUtils()
    await utils.init()
  })

  it('ORIGINAL <-> YAR', async () => {
    const tokenId = 1

    const res1 = await utils.originalToYar(tokenId)
    assert(res1.status == 1, "res1 failure!")

    const res2 = await utils.yarToOriginal(tokenId)
    assert(res2.status == 1, "res2 failure!")
  })

  it('batch ORIGINAL <-> YAR', async () => {
    const tokenIds = [1,2,3]

    const res1 = await utils.batchOriginalToYar(tokenIds)
    assert(res1.status == 1, "res1 failure!")

    const res2 = await utils.batchYarToOriginal(tokenIds)
    assert(res2.status == 1, "res2 failure!")
  })
  
  it('ORIGINAL <-> SECONDARY', async () => {
    const tokenId = 2
    
    const res1 = await utils.originalToSecondary(tokenId)
    assert(res1.status == 1, "res1 failure!")

    const res2 = await utils.secondaryToOriginal(tokenId)
    assert(res2.status == 1, "res2 failure!")
  }) 

  it('batch ORIGINAL <-> SECONDARY', async () => {
    const tokenIds = [10,20,30]
    
    const res1 = await utils.batchOriginalToSecondary(tokenIds)
    assert(res1.status == 1, "res1 failure!")

    const res2 = await utils.batchSecondaryToOriginal(tokenIds)
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

  it('batch SECONDARY <-> THIRD', async () => {
    const tokenIds = [100,200,300]
    
    const res0 = await utils.batchOriginalToSecondary(tokenIds)
    assert(res0.status == 1, "res0 failure!")

    const res1 = await utils.batchSecondaryToThird(tokenIds)
    assert(res1.status == 1, "res1 failure!")

    const res2 = await utils.batchThirdToSecondary(tokenIds)
    assert(res2.status == 1, "res2 failure!")
  })
  
  it('YAR ORIGINAL <-> SECONDARY', async () => {
    const tokenId = 4
    
    const res1 = await utils.yarOriginalToSecondary(tokenId)
    assert(res1.status == 1, "res1 failure!")

    const res2 = await utils.secondaryToYarOriginal(tokenId)
    assert(res2.status == 1, "res2 failure!")
  })  

  it('batch YAR ORIGINAL <-> SECONDARY', async () => {
    const tokenIds = [1000,2000,3000]
    
    const res1 = await utils.batchYarOriginalToSecondary(tokenIds)
    assert(res1.status == 1, "res1 failure!")

    const res2 = await utils.batchSecondaryToYarOriginal(tokenIds)
    assert(res2.status == 1, "res2 failure!")
  })

})
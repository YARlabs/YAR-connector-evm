import { NATIVE_TOKEN, WETH } from "../../constants/externalAddresses"
import { BridgeERC20E2EUtils } from "./BridgeERC20.utils"
import { assert } from 'chai'

const TEST_DATA = {
  tokens: [
    WETH,
    NATIVE_TOKEN
  ]
}

for(const token of TEST_DATA.tokens) {
  describe(`test_key_e2e BridgeERC20. token ${token}`, () => {
    let utils: BridgeERC20E2EUtils
  
    before(async () => {
      utils = new BridgeERC20E2EUtils()
      await utils.init(token)
    })
  
    it('ORIGINAL <-> YAR', async () => {
      const res1 = await utils.originalToYar()
      assert(res1.status == 1, "res1 failure!")
  
      const res2 = await utils.yarToOriginal()
      assert(res2.status == 1, "res2 failure!")
    })
    
    it('ORIGINAL <-> SECONDARY', async () => {
      const res1 = await utils.originalToSecondary()
      assert(res1.status == 1, "res1 failure!")
  
      const res2 = await utils.secondaryToOriginal()
      assert(res2.status == 1, "res2 failure!")
    })
  
    it('SECONDARY <-> THIRD', async () => {
      const res0 = await utils.originalToSecondary()
      assert(res0.status == 1, "res0 failure!")
  
      const res1 = await utils.secondaryToThird()
      assert(res1.status == 1, "res1 failure!")
  
      const res2 = await utils.thirdToSecondary()
      assert(res2.status == 1, "res2 failure!")
    })
    
    it('YAR ORIGINAL <-> SECONDARY', async () => {
      const res1 = await utils.yarOriginalToSecondary()
      assert(res1.status == 1, "res1 failure!")
  
      const res2 = await utils.secondaryToYarOriginal()
      assert(res2.status == 1, "res2 failure!")
    })
  
  })
}
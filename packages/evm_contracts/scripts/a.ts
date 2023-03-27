import {ethers} from 'ethers'
import { BridgeERC20__factory, IERC20Metadata__factory } from '../typechain-types'

async function main() {
  const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com')
  const wallet = new ethers.Wallet('0x531c909563790391fbfcbe21106ca86cd0a295a645c058662cea72f9d19afd7d', provider)
  await IERC20Metadata__factory.connect('0x326C977E6efc84E512bB9C30f76E30c160eD06FB', wallet).approve('0x523B846c60F44DDD184C0842f29869F526f1fb3D', '50000000000000000', {
    gasLimit: '500000',
  })
  await BridgeERC20__factory.connect('0x523B846c60F44DDD184C0842f29869F526f1fb3D', wallet).tranferToOtherChain(
    '0x326C977E6efc84E512bB9C30f76E30c160eD06FB', // _transferedToken
    '50000000000000000', // _amount
    '0x888ddba0dff61733aea9d240a62a83cee02ac4a5c8e58fbc448c21d3b250d4bb', // _targetChainName
    '0x000000000000000000000000c01aabaf32bc56ab4c0f033fea3b6935eb7ab8bb', // _recipient
   {
    gasLimit: '500000'
  })
}
main()
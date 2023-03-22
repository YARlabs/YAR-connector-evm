import axios from 'axios'
import { ethers, network } from 'hardhat'
import { IERC20Metadata__factory } from '../../typechain-types'
import { setBalance } from '@nomicfoundation/hardhat-network-helpers'
import { ETH } from '../../constants/externalAddresses'

export default class ERC20MinterV2 {
  public static async mint(tokenAddress: string, recipient: string, maxAmountFormated?: number) {
    if (tokenAddress == ETH) return
    const response = await axios.get(`https://etherscan.io/token/tokenholderchart/${tokenAddress}`)

    const matches = response.data.matchAll(new RegExp(`/token/${tokenAddress}.a=(.*?)'`, 'g'))

    if (matches) {
      for (const m of [...matches]) {
        const holderAddress = m[1]
        await network.provider.request({
          method: 'hardhat_impersonateAccount',
          params: [holderAddress],
        })
        const holder = await ethers.getSigner(holderAddress)

        await setBalance(holderAddress, ethers.utils.parseEther('0.1'))

        const token = IERC20Metadata__factory.connect(tokenAddress, holder)
        const tokenDecimals = await token.decimals()
        const amount = ethers.utils.parseUnits(`${maxAmountFormated}`, tokenDecimals)

        const holderBalance = await token.balanceOf(holderAddress)

        console.log(`amount ${amount}`)
        console.log(`maxAmountFormated ${maxAmountFormated}`)
        console.log(`holderBalance ${holderBalance}`)

        if(holderBalance.eq(0)) continue

        if (holderBalance.gte(amount)) {
          await (await token.transfer(recipient, amount)).wait()
        } else {
          await (await token.transfer(recipient, holderBalance)).wait()
        }
        break
      }
    }
  }
}

import axios from 'axios'
import { ethers, network } from 'hardhat'
import { IERC20Metadata__factory } from '../../typechain-types'
import { setBalance } from '@nomicfoundation/hardhat-network-helpers'
import { ETH } from '../../constants/externalAddresses'

export default class ERC20MinterV2 {
  public static async mint(tokenAddress: string, recipient: string, maxAmountFormated?: number) {
    if (tokenAddress == ETH) return
    const response = await axios.get(`https://etherscan.io/token/tokenholderchart/${tokenAddress}`)

    const matches = response.data.match(new RegExp(`/token/${tokenAddress}.a=(.*?)'`))

    const holderAddress = matches[1]
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [holderAddress],
    })
    const holder = await ethers.getSigner(holderAddress)

    await setBalance(holderAddress, ethers.utils.parseEther('1'))

    const token = IERC20Metadata__factory.connect(tokenAddress, holder)
    const tokenDecimals = await token.decimals()

    const holderBalance = await token.balanceOf(holderAddress)
    // const mintAmount =
    //   amountFormated !== undefined ? ethers.utils.parseUnits(`${amountFormated}`, tokenDecimals) : holderBalance

    if(holderBalance.gt(maxAmountFormated)) {
      await token.transfer(recipient, maxAmountFormated)
    } else {
      await token.transfer(recipient, holderBalance)
    }
      
    // if (holderBalance.gte(mintAmount)) {
    //   await token.transfer(recipient, mintAmount)
    // } else {
    //   throw Error(`ERC20MinterV2: holder has not ${mintAmount} ${tokenAddress}, he has ${holderBalance}`)
    // }
  }
}

import { ethers, network } from 'hardhat'
import { IERC721__factory } from '../../typechain-types'
import { setBalance } from '@nomicfoundation/hardhat-network-helpers'

export default class ERC721MinterV2 {
  public static async mint(tokenAddress: string, recipient: string, tokenId: number) {
    const tmpUser = (await ethers.getSigners())[0]
    const holderAddress = await IERC721__factory.connect(tokenAddress, tmpUser).ownerOf(tokenId)

    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [holderAddress],
    })
    const holder = await ethers.getSigner(holderAddress)

    await setBalance(holderAddress, ethers.utils.parseEther('1'))

    const token = IERC721__factory.connect(tokenAddress, holder)

    await (await token.transferFrom(holder.address, recipient, tokenId)).wait()
  }
}

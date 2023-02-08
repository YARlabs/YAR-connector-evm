import { ethers, network } from 'hardhat'
import { IERC721__factory } from '../../typechain-types'
import { setBalance } from '@nomicfoundation/hardhat-network-helpers'

export default class ERC721MinterV2 {
  public static async mint(tokenAddress: string, recipient: string, tokenId: number) {
    const tmpUser = (await ethers.getSigners())[0]
    console.log('aw13')
    const holderAddress = await IERC721__factory.connect(tokenAddress, tmpUser).ownerOf(tokenId);

    console.log('aw14')
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [holderAddress],
    })
    console.log('aw15')
    const holder = await ethers.getSigner(holderAddress)

    console.log('aw16')
    await setBalance(holderAddress, ethers.utils.parseEther('1'))

    console.log('aw17')
    const token = IERC721__factory.connect(tokenAddress, holder)

    console.log('aw18')
    // console.log(await token.balanceOf(holder.address));
    // console.log(holder.address);
    // console.log(await token.ownerOf(tokenId));
    // console.log(await ethers.provider.getBalance(holder.address));
    // await token.approve(recipient, tokenId)
    await token.transferFrom(holder.address, recipient, tokenId)
    console.log('aw19')
  }
}

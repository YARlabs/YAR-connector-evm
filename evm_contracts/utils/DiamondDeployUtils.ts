import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DiamondUtils } from './DiamondUtils'
import { IDiamondCut } from '../typechain-types'

export class DimaondDeployUtils {
  public static readonly universalBridgeDependencies = (): Array<string> => [
    'DiamondCutFacet',
    'DiamondLoupeFacet',
    'DiamondOwnershipFacet',
    'ChainInfoFacet',
    'ValidatorControllerFacet',
    'ERC20DriverFacet',
    'IssuedTokenImplementation',
    'DiamondInit',
    'ERC20DriverInit'
  ]

  public static readonly createDeployFunction = (
    validatorIndex: number,
    deploymentName: string,
    chainName: string,
    isProxyChain: boolean,
    registeredChains: string[]
  ): DeployFunction => {
    return async function (hre: HardhatRuntimeEnvironment) {
      const { ethers, deployments } = hre
      const { deploy, get } = deployments

      // Users
      const signers = await ethers.getSigners()
      const deployer = signers[0]
      const validator = signers[validatorIndex]

      // Deploy dependencies
      const DiamondCutFacetDeployment = await get('DiamondCutFacet')

      // DEPLOY
      const deployment = await deploy(deploymentName, {
        contract: 'UniversalBridgeDiamond',
        from: deployer.address,
        args: [
          chainName, // _chainName
          isProxyChain, // _isProxyChain
          deployer.address, // _contractOwner
          DiamondCutFacetDeployment.address, // _diamondCutFacet
          validator.address, //_validator
        ],
      })

      // Initialize after deploy

      const diamondAddress = deployment.address
      const diamondCut = await ethers.getContractAt('IDiamondCut', diamondAddress)

      // Create cut arrays with ADD_ACTION and all selectors from contract
      const getAddCutsFromNewFacets = async (
        facets: Array<string>,
      ): Promise<Array<IDiamondCut.FacetCutStruct>> => {
        const cuts: Array<IDiamondCut.FacetCutStruct> = []
        for (const facet of facets) {
          const FacetDeployment = await get(facet)
          const facetContract = await ethers.getContractAt(facet, FacetDeployment.address, deployer)

          cuts.push({
            facetAddress: facetContract.address,
            action: DiamondUtils.FacetCutAction.Add,
            functionSelectors: DiamondUtils.getSelectors(facetContract),
          })
        }
        return cuts
      }

      // Base diamond initialize
      const DiamondInitDeployment = await get('DiamondInit')

      const diamondInit = await ethers.getContractAt(
        'DiamondInit',
        DiamondInitDeployment.address,
        deployer,
      )

      await diamondCut.diamondCut(
        await getAddCutsFromNewFacets(['DiamondLoupeFacet', 'DiamondOwnershipFacet']),
        diamondInit.address,
        diamondInit.interface.encodeFunctionData('init'),
      )

      // Bridge diamond initialize
      const IssuedTokenImplementationDeployment = await get('IssuedTokenImplementation')
      const ERC20DriverInitDeployment = await get('ERC20DriverInit')

      const erc20DriverInit = await ethers.getContractAt(
        'ERC20DriverInit',
        ERC20DriverInitDeployment.address,
        deployer,
      )

      await diamondCut.diamondCut(
        await getAddCutsFromNewFacets([
          'ChainInfoFacet',
          'ValidatorControllerFacet',
          'ERC20DriverFacet',
        ]),
        erc20DriverInit.address,
        erc20DriverInit.interface.encodeFunctionData('init', [
          IssuedTokenImplementationDeployment.address,
          registeredChains
        ]),
        {
          gasLimit: '800000'
        }
      )
    }
  }
}

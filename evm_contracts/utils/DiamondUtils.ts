import { Contract, ethers } from 'ethers'

export class DiamondUtils {
  public static readonly FacetCutAction = { Add: 0, Replace: 1, Remove: 2 }

  public static readonly getSelectors = (contract: Contract): string[] => {
    const signatures = Object.keys(contract.interface.functions)
    const selectors = signatures.reduce((acc: string[], val: string) => {
      acc.push(contract.interface.getSighash(val))
      return acc
    }, [])
    return selectors
  }
}

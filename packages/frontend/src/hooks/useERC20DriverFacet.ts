import { JsonRpcProvider } from '@ethersproject/providers';
import { useEthers } from "@usedapp/core"
import { ERC20DriverFacet__factory } from '../typechain';

export const useERC20DriverFacet = () => {
    const { library } = useEthers();

    return (contractAddress: string) => {
        if (library) {
            return ERC20DriverFacet__factory.connect(contractAddress!, (library as JsonRpcProvider)?.getSigner());
        }
    };
}
import { JsonRpcProvider } from '@ethersproject/providers';
import { useEthers } from "@usedapp/core"
import { IssuedERC20__factory } from '../typechain';


export const useIssuedTokenImplementation = () => {
    const { library } = useEthers();

    return (contractAddress: string) => {
        if (library) {
            return IssuedERC20__factory.connect(contractAddress!, (library as JsonRpcProvider)?.getSigner());
        }
    };
}
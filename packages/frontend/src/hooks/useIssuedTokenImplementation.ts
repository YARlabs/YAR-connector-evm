import { JsonRpcProvider } from '@ethersproject/providers';
import { useEthers } from "@usedapp/core"
import { IssuedTokenImplementation__factory } from '../typechain';


export const useIssuedTokenImplementation = () => {
    const { library } = useEthers();

    return (contractAddress: string) => {
        if (library) {
            return IssuedTokenImplementation__factory.connect(contractAddress!, (library as JsonRpcProvider)?.getSigner());
        }
    };
}
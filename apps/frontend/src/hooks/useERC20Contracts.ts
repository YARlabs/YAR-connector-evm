import { JsonRpcProvider } from '@ethersproject/providers';
import { useEthers } from "@usedapp/core"
import { IERC20Metadata__factory } from 'typechains';


export const useERC20Contracts = () => {
    const { library } = useEthers();

    return (contractAddress: string) => {
        if (library) {
            return IERC20Metadata__factory.connect(contractAddress!, (library as JsonRpcProvider)?.getSigner());
        }
    };
}
import { JsonRpcProvider } from '@ethersproject/providers';
import { useEthers } from "@usedapp/core"
import { IssuedERC1155__factory } from 'typechains';


export const useIssuedTokenImplementation = () => {
    const { library } = useEthers();

    return (contractAddress: string) => {
        if (library) {
            return IssuedERC1155__factory.connect(contractAddress!, (library as JsonRpcProvider)?.getSigner());
        }
    };
}
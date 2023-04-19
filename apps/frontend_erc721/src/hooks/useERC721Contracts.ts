import { JsonRpcProvider } from '@ethersproject/providers';
import { useEthers } from "@usedapp/core";
import { IERC721Metadata__factory } from 'typechains';


export const useERC721Contracts = () => {
    const { library } = useEthers();

    return (contractAddress: string) => {
        if (library) {
            return IERC721Metadata__factory.connect(contractAddress!, (library as JsonRpcProvider)?.getSigner());
        }
    };
}
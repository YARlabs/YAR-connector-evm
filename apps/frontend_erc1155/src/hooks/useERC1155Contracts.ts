import { JsonRpcProvider } from '@ethersproject/providers';
import { useEthers } from "@usedapp/core";
import { IERC1155__factory } from 'typechains';


export const useERC1155Contracts = () => {
    const { library } = useEthers();

    return (contractAddress: string) => {
        if (library) {
            return IERC1155__factory.connect(contractAddress!, (library as JsonRpcProvider)?.getSigner());
        }
    };
}
import { JsonRpcProvider } from '@ethersproject/providers';
import { useEthers } from "@usedapp/core"
import { BridgeERC1155__factory } from 'typechains';

export const useBridgeContract = () => {
    const { library } = useEthers();

    return (contractAddress: string) => {
        if (library) {
            return BridgeERC1155__factory.connect(contractAddress!, (library as JsonRpcProvider)?.getSigner());
        }
    };
}
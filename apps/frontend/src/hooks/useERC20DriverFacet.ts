import { JsonRpcProvider } from '@ethersproject/providers';
import { useEthers } from "@usedapp/core"
import { BridgeERC20__factory } from 'typechains';

export const useBridgeContract = () => {
    const { library } = useEthers();

    return (contractAddress: string) => {
        if (library) {
            return BridgeERC20__factory.connect(contractAddress!, (library as JsonRpcProvider)?.getSigner());
        }
    };
}
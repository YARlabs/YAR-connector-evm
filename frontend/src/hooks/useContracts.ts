import { JsonRpcProvider } from '@ethersproject/providers';
import { useMemo } from 'react';
import { useEthers } from "@usedapp/core"
import { ExternalBridge__factory, InternalBridge__factory } from '../typechain';


export const useContracts = () => {
    const { library } = useEthers();
    
    const internalBridgeContract = useMemo(() => {
        if (library) {
            return InternalBridge__factory.connect(process.env.REACT_APP_INTERNAL_BRIDGE_CONTRACT!, (library as JsonRpcProvider)?.getSigner());
        }
    }, [library]);

    const externalBridgeContract = useMemo(() => {
        if (library) {
            return ExternalBridge__factory.connect(process.env.REACT_APP_EXTERNAL_BRIDGE_CONTRACT!, (library as JsonRpcProvider)?.getSigner());
        }
    }, [library]);

    return {
        internalBridgeContract,
        externalBridgeContract,
    }
}
import { useCallback } from "react"; 
import { idToChainName, idToRpcUrl } from "../utils/idToChainName";
import { Contract, providers } from "ethers";
import BridgeABI from '../abi/ERC20DriverFacet.json';
import IssuedTokenImplementationABI from '../abi/IssuedTokenImplementation.json';

export const useGetSecondToken = () => {

    return useCallback(
        async (token: string, chainIdFrom: number, chainIdTo: number) => {
            
            const chainNameFrom = idToChainName[chainIdFrom];
            const chainNameTo = idToChainName[chainIdTo];
            const addressBridgeFrom = process.env[`REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_${chainNameFrom}`] as string;
            const addressBridgeTo = process.env[`REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_${chainNameTo}`] as string;
            const providerFrom = new providers.JsonRpcProvider(idToRpcUrl[chainIdFrom]);
            const providerTo = new providers.JsonRpcProvider(idToRpcUrl[chainIdTo]);
            
            let bridgeContract = new Contract(addressBridgeFrom, BridgeABI, providerFrom);
            try {
                const isIssued = await bridgeContract.isIssuedToken(token);
                if(isIssued) {
                    let issuedTokenImplementationContract = new Contract(token, IssuedTokenImplementationABI, providerFrom);
                    const originalChainName = await issuedTokenImplementationContract.originalChainName() as string;
                    const originalTokenAddress = await issuedTokenImplementationContract.originalTokenAddress() as string;
                    if(originalChainName === chainNameTo) {
                        return originalTokenAddress;
                    } else {
                        bridgeContract = new Contract(addressBridgeTo, BridgeABI, providerTo);
                        const secondToken = await bridgeContract.getIssuedTokenAddressERC20(
                            originalChainName,
                            originalTokenAddress.toLocaleLowerCase()
                        );
                        return secondToken;
                    }
                } else {
                    bridgeContract = new Contract(addressBridgeTo, BridgeABI, providerTo);
                    const secondToken = await bridgeContract.getIssuedTokenAddressERC20(
                        chainNameFrom,
                        token.toLocaleLowerCase()
                    );
                    return secondToken;
                }
            } catch (error: any) {
                const errorMessage =
                    error?.error?.message ||
                    error?.message ||
                    "Check console logs for error";
                console.error(error);
                console.error(errorMessage);
            }
        }, []
    )
}
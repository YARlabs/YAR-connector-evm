import { useCallback } from "react"; 
import { idToChainName, idToRpcUrl } from "../utils/idToChainName";
import { Contract, providers } from "ethers";
import { EthersUtils } from "../utils/ethers";
import BridgeABI from '../abi/BridgeERC20.json';
import IssuedTokenImplementationABI from '../abi/IssuedERC20.json';

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
                const isIssued = await bridgeContract.isIssuedTokenPublished(token);
                if(isIssued) {
                    let issuedTokenImplementationContract = new Contract(token, IssuedTokenImplementationABI, providerFrom);
                    const originalChainBytes32 = await issuedTokenImplementationContract.originalChain() as string; // bytes32
                    const originalTokenBytes = await issuedTokenImplementationContract.originalToken() as string; // bytes
                    const chainToBytes32 = EthersUtils.keccak256(chainNameTo);
                    if(originalChainBytes32 === chainToBytes32) {
                        const originalTokenAddress = EthersUtils.bytesToAddress(originalTokenBytes);
                        return originalTokenAddress;
                    } else {
                        bridgeContract = new Contract(addressBridgeTo, BridgeABI, providerTo);
                        const secondToken = await bridgeContract.getIssuedTokenAddress(
                            originalChainBytes32,
                            originalTokenBytes
                        );
                        return secondToken;
                    }
                } else {
                    bridgeContract = new Contract(addressBridgeTo, BridgeABI, providerTo);
                    const chainBytesFromBytes32 = EthersUtils.keccak256(chainNameFrom);
                    const originalTokenBytes = EthersUtils.addressToBytes(token);
                    const secondToken = await bridgeContract.getIssuedTokenAddress(
                        chainBytesFromBytes32,
                        originalTokenBytes
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
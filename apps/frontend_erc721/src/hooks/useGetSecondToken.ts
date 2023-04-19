import { useCallback } from "react"; 
import { idToBridgeAddress, idToChainName, idToRpcUrl } from "../utils/idToChainName";
import { providers } from "ethers";
import { EthersUtils } from "ethers_utils";
import {IssuedERC721__factory, BridgeERC721__factory} from 'typechains';

export const useGetSecondToken = () => {

    return useCallback(
        async (token: string, chainIdFrom: number, chainIdTo: number) => {
            
            const chainNameFrom = idToChainName[chainIdFrom]; 
            const chainNameTo = idToChainName[chainIdTo];
            const addressBridgeFrom = idToBridgeAddress[chainIdFrom];
            const addressBridgeTo =  idToBridgeAddress[chainIdTo];
            const providerFrom = new providers.JsonRpcProvider(idToRpcUrl[chainIdFrom]);
            const providerTo = new providers.JsonRpcProvider(idToRpcUrl[chainIdTo]);
            
            let bridgeContract = BridgeERC721__factory.connect(addressBridgeFrom, providerFrom);
            try {
                const isIssued = await bridgeContract.isIssuedTokenPublished(token);
                if(isIssued) {
                    let issuedTokenImplementationContract = IssuedERC721__factory.connect(token, providerFrom);
                    const originalChainBytes32 = await issuedTokenImplementationContract.originalChain() as string; // bytes32
                    const originalTokenBytes = await issuedTokenImplementationContract.originalToken() as string; // bytes
                    const chainToBytes32 = EthersUtils.keccak256(chainNameTo);
                    if(originalChainBytes32 === chainToBytes32) {
                        const originalTokenAddress = EthersUtils.bytesToAddress(originalTokenBytes);
                        return originalTokenAddress;
                    } else {
                        bridgeContract = BridgeERC721__factory.connect(addressBridgeTo, providerTo);
                        const secondToken = await bridgeContract.getIssuedTokenAddress(
                            originalChainBytes32,
                            originalTokenBytes
                        );
                        return secondToken;
                    }
                } else {
                    bridgeContract = BridgeERC721__factory.connect(addressBridgeTo, providerTo);
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
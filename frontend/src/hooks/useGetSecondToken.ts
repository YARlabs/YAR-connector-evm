import { useEthers } from "@usedapp/core";
import { useCallback } from "react";
import { useERC20Contracts } from "./useERC20Contracts";
import { useERC20DriverFacet } from "./useERC20DriverFacet";
import { useIssuedTokenImplementation } from "./useIssuedTokenImplementation"; 
import { idToChainName } from "../utils/idToChainName";

export const useGetSecondToken = () => {

    const { switchNetwork } = useEthers();
    const erc20ContractTemplate = useERC20Contracts();
    const erc20DriverFacetInstanse = useERC20DriverFacet();
    const IssuedTokenImplementationInstanse = useIssuedTokenImplementation();

    return useCallback(
        async (token: string, chainIdFrom: number, chainIdTo: number) => {
            console.log("inner useGetSecondToken", token, chainIdFrom, chainIdTo);
            
            const chainNameFrom = idToChainName[chainIdFrom];
            const chainNameTo = idToChainName[chainIdTo];
            const addressBridgeFrom = process.env[`REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_${chainNameFrom}`] as string;
            console.log('addressBridgeFrom', addressBridgeFrom);
            
            let bridge = erc20DriverFacetInstanse(addressBridgeFrom);
            try {
                const isIssued = await bridge?.isIssuedToken(token);
                if(isIssued) {
                    const issuedTokenImplementation = IssuedTokenImplementationInstanse(token);
                    const originalChainName = await issuedTokenImplementation?.originalChainName() as string;
                    const originalTokenAddress = await issuedTokenImplementation?.originalTokenAddress() as string;
                    if(originalChainName === chainNameTo) {
                        return originalTokenAddress;
                    } else {
                        await switchNetwork(chainIdTo);
                        const addressBridgeTo = process.env[`REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_${chainNameTo}`] as string;
                        let bridge = erc20DriverFacetInstanse(addressBridgeTo);
                        const secondToken = await bridge?.getIssuedTokenAddressERC20(
                            originalChainName,
                            originalTokenAddress.toLocaleLowerCase()
                        );
                        return secondToken;
                    }
                } else {
                    await switchNetwork(chainIdTo);
                    const addressBridgeTo = process.env[`REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_${chainNameTo}`] as string;
                    let bridge = erc20DriverFacetInstanse(addressBridgeTo);
                    const secondToken = await bridge?.getIssuedTokenAddressERC20(
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

        },[switchNetwork, erc20ContractTemplate, erc20DriverFacetInstanse, IssuedTokenImplementationInstanse]
    )
}
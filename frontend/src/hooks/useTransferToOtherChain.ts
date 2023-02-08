import { useEthers } from "@usedapp/core";
import { useCallback } from "react";
import { useERC20Contracts } from "./useERC20Contracts";
import { useERC20DriverFacet } from "./useERC20DriverFacet";
import { idToChainName } from "../utils/idToChainName";

export const useTransferToOtherChain = () => {
  const { account, switchNetwork } = useEthers();
  const erc20ContractTemplate = useERC20Contracts();
  const erc20DriverFacetInstanse = useERC20DriverFacet();  

  return useCallback(
    async (token: string, reciever: string, amount: number, chainId: number, chainFromName: string) => {
      const addressBridge = process.env[`REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_${idToChainName[chainId]}`] as string
      await switchNetwork(chainId);
      const erc20Contract = erc20ContractTemplate(token);
      const bridge = erc20DriverFacetInstanse(addressBridge);
      const validReciever = reciever.toLowerCase();
      try {
        const decimals = await erc20Contract?.decimals(); 
        
        const bigNumberAmount = amount * 10**Number(decimals); 
        const txPromise = await bridge?.tranferToOtherChainERC20(token, bigNumberAmount.toString(), chainFromName, {
            evmAddress: validReciever,
            noEvmAddress: ''
        });
        const tx = txPromise?.wait();
        return tx;
      } catch (error: any) {
        const errorMessage =
          error?.error?.message ||
          error?.message ||
          "Check console logs for error";
        console.error(error);
        console.error(errorMessage);
      }     
    },
    [account, erc20ContractTemplate, useERC20DriverFacet, switchNetwork]
  );
};
import { useEthers } from "@usedapp/core";
import { useCallback } from "react";
import { useERC20Contracts } from "./useERC20Contracts";
import { idToChainName } from "../utils/idToChainName";

export const useApprove = () => {
  const { account, switchNetwork } = useEthers();
  const erc20ContractTemplate = useERC20Contracts();

  return useCallback(
    async (token: string, chainId: number) => {
      const addressBridge = process.env[`REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_${idToChainName[chainId]}`] as string
      await switchNetwork(chainId);
      const erc20Contract = erc20ContractTemplate(token);

      try {
        const balance = await erc20Contract?.balanceOf(account!);
        
        const txPromise = await erc20Contract?.approve(addressBridge, balance!);
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
    [account, erc20ContractTemplate, switchNetwork]
  );
};

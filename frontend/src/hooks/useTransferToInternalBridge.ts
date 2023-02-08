import { useEthers } from "@usedapp/core";
import { useCallback } from "react";
import { useContracts } from "./useContracts";
import { useERC20Contracts } from "./useERC20Contracts";
import { Mumbai } from "@usedapp/core";



export const useTransferToInternalBridge = () => {
  const { externalBridgeContract } = useContracts();
  const { switchNetwork } = useEthers();

  return useCallback(
    async (token: string, amount: string | number, reciever: string) => {
      if (!externalBridgeContract) return;
      await switchNetwork(Mumbai.chainId);

      try {
        const txPromise = await externalBridgeContract.transferToInternalBridge(token, amount, reciever);
        const tx = await txPromise.wait();

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
    [externalBridgeContract, switchNetwork]
  );
};

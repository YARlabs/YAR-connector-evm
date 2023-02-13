import { useEthers } from "@usedapp/core";
import BigNumber from "bignumber.js";
import { useCallback } from "react";
import { useERC20Contracts } from "./useERC20Contracts";
import { useERC20DriverFacet } from "./useERC20DriverFacet";
import { idToChainName } from "../utils/idToChainName";
BigNumber.config({ EXPONENTIAL_AT: 60 });

export const useTransferToOtherChain = () => {
  const { account, switchNetwork } = useEthers();
  const erc20ContractTemplate = useERC20Contracts();
  const erc20DriverFacetInstanse = useERC20DriverFacet();  

  return useCallback(
    async (token: string, reciever: string, amount: number, chainIdFrom: number, chainIdTo: number) => {
      const addressBridge = process.env[`REACT_APP_UNIVERSAL_BRIDGE_CONTRACT_${idToChainName[chainIdFrom]}`] as string;
      await switchNetwork(chainIdFrom);
      const erc20Contract = erc20ContractTemplate(token);
      const bridge = erc20DriverFacetInstanse(addressBridge);
      const validReciever = reciever.toLowerCase();
      try {
        const decimals = await erc20Contract?.decimals() as number;
        const bigNumberAmount = new BigNumber(amount).shiftedBy(+decimals); 
        const isIssued = await bridge?.isIssuedToken(token);
        if(!isIssued) {
          const allowance = (await erc20Contract?.allowance(account as string, addressBridge))?.toString() as string;
          if(Number(allowance) < bigNumberAmount.toNumber()) {
            const balance = await erc20Contract?.balanceOf(account!);
            const txPromise = await erc20Contract?.approve(addressBridge, balance!);
            await txPromise?.wait();
          }
        }
        const txPromise = await bridge?.tranferToOtherChainERC20(token, bigNumberAmount.toString(), idToChainName[chainIdTo], {
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
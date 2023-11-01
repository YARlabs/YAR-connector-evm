import { useEthers } from "@usedapp/core";
import BigNumber from "bignumber.js";
import { useCallback } from "react";
import { useERC20Contracts } from "./useERC20Contracts";
import { useBridgeContract } from "./useERC20DriverFacet";
import { idToBridgeAddress, idToChainName } from "../utils/idToChainName";
import { toast } from 'react-toastify';
import { EthersUtils } from "ethers_utils"; 

BigNumber.config({ EXPONENTIAL_AT: 60 });


export const useTransferToOtherChain = () => {
  const { account, switchNetwork } = useEthers();
  const erc20ContractTemplate = useERC20Contracts();
  const erc20DriverFacetInstanse = useBridgeContract();  

  return useCallback(
    async (token: string, reciever: string, amount: number, chainIdFrom: number, chainIdTo: number) => {
      const addressBridge = idToBridgeAddress[chainIdFrom];
      await switchNetwork(chainIdFrom);

      if(token == '0x0000000000000000000000000000000000000000') {
        const bridge = erc20DriverFacetInstanse(addressBridge);
        try {
          const decimals = 18;
          const bigNumberAmount = new BigNumber(amount).shiftedBy(+decimals); 
          toast('Confirm transfer', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
          const targetChainBytes32 = EthersUtils.keccak256(idToChainName[chainIdTo]);
          const recipientBytes = EthersUtils.addressToBytes(reciever);
          const _amount = bigNumberAmount.toString()
          const txPromise = await bridge?.tranferToOtherChain(token, _amount, targetChainBytes32, recipientBytes, {value: _amount});
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
      } else {
        const erc20Contract = erc20ContractTemplate(token);
        const bridge = erc20DriverFacetInstanse(addressBridge);
        try {
          const decimals = await erc20Contract?.decimals() as number;
          const bigNumberAmount = new BigNumber(amount).shiftedBy(+decimals); 
          const isIssued = await bridge?.isIssuedTokenPublished(token);
          if(!isIssued) {
            const allowance = (await erc20Contract?.allowance(account as string, addressBridge))?.toString() as string;          
            if(Number(allowance) < bigNumberAmount.toNumber()) {
              toast('Approve your tokens', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
              });
              const balance = await erc20Contract?.balanceOf(account!);
              const txPromise = await erc20Contract?.approve(addressBridge, balance!);
              await txPromise?.wait();
            }
          }
          toast('Confirm transfer', {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
          const targetChainBytes32 = EthersUtils.keccak256(idToChainName[chainIdTo]);
          const recipientBytes = EthersUtils.addressToBytes(reciever);
          const txPromise = await bridge?.tranferToOtherChain(token, bigNumberAmount.toString(), targetChainBytes32, recipientBytes);
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
      }
    },
    [account, erc20ContractTemplate, useBridgeContract, switchNetwork]
  );
};
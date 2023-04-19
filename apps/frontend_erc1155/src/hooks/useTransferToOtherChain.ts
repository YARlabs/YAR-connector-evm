import { useEthers } from "@usedapp/core";
import BigNumber from "bignumber.js";
import { useCallback } from "react";
import { useERC1155Contracts } from "./useERC1155Contracts";
import { useBridgeContract } from "./useERC1155DriverFacet";
import { idToBridgeAddress, idToChainName } from "../utils/idToChainName";
import { toast } from 'react-toastify';
import { EthersUtils } from "ethers_utils"; 
BigNumber.config({ EXPONENTIAL_AT: 60 });

export const useTransferToOtherChain = () => {
  const { account, switchNetwork } = useEthers();
  const erc1155ContractTemplate = useERC1155Contracts();
  const erc1155DriverFacetInstanse = useBridgeContract();  

  return useCallback(
    async (token: string, reciever: string, id: string, amount: string, chainIdFrom: number, chainIdTo: number) => {
      const addressBridge = idToBridgeAddress[chainIdFrom];
      await switchNetwork(chainIdFrom);
      const erc1155Contract = erc1155ContractTemplate(token);
      const bridge = erc1155DriverFacetInstanse(addressBridge);
      try {
        const isIssued = await bridge?.isIssuedTokenPublished(token);    
        if(!isIssued) {
          const isApproved = await erc1155Contract?.isApprovedForAll(account as string, addressBridge);  
          if(!isApproved) {
            toast('Approve your tokens', {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: true,
              pauseOnHover: true,
              draggable: true,
              theme: "colored",
            });
            const txPromise = await erc1155Contract?.setApprovalForAll(addressBridge, true);
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
        const txPromise = await bridge?.tranferToOtherChain(token, id, amount, targetChainBytes32, recipientBytes);
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
    [account, erc1155ContractTemplate, useBridgeContract, switchNetwork]
  );
};
import { useEthers } from "@usedapp/core";
import { useCallback } from "react";

import { toast } from 'react-toastify';

export const useValidationBeforeTransfer = () => {
    const { account } = useEthers();

    return useCallback(async (token: string, reciever: string, id: string, chainIdFrom: number, chainIdTo: number) => {
        if(!account) {
            toast.warn('Firstly connect your wallet', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                theme: "colored",
            });
            return false;
        }
        if(!token || token.trim().length !== 42) {
            toast('Invalid address contract', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
            return false;
        }
        if(!reciever || reciever.trim().length !== 42) {
            toast('Invalid address receiver', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
            return false;
        }
        if(reciever === token) {
            toast('The contract and recipient addresses cannot be the same', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
            return false;
        }
        if(!id || Number(id) < 0) {
            toast('Invalid amount value', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
            return false;
        }
        if(chainIdFrom === chainIdTo) {
            toast('The networks should be different', {
                position: "top-center",
                autoClose: 1000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
            return false;
        }
        return true;
    },[account])

}
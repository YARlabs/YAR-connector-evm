import { useCallback } from "react"; 
import IERC20MetadataABI from '../abi/IERC20Metadata.json';
import { idToRpcUrl } from "../utils/idToChainName";
import { Contract, providers } from "ethers";


export const useGetTicker = () => {

    return useCallback(
        async (token: string, chainId: number) => {
            const provider = new providers.JsonRpcProvider(idToRpcUrl[chainId]);
            const contractToken = new Contract(token, IERC20MetadataABI, provider);
            try {
                const symbol = await contractToken.symbol();
                return symbol;
            } catch(error: any) {
                const errorMessage =
                    error?.error?.message ||
                    error?.message ||
                    "Check console logs for error";
                console.error(error);
                console.error(errorMessage);
            } 
        }
        ,[]
    );

}
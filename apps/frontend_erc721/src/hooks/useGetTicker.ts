import { useCallback } from "react"; 
import { idToRpcUrl } from "../utils/idToChainName";
import { providers } from "ethers";
import { IERC721Metadata__factory } from "typechains";


export const useGetTicker = () => {

    return useCallback(
        async (token: string, chainId: number) => {
            const provider = new providers.JsonRpcProvider(idToRpcUrl[chainId]);
            const contractToken = IERC721Metadata__factory.connect(token, provider);
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
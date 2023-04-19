import { useCallback } from "react"; 
import { idToRpcUrl } from "../utils/idToChainName";
import { providers } from "ethers";
import { IERC721Metadata__factory } from "typechains";

export const useGetURI = () => {
    return useCallback(
        async (token: string, nftId: string, chainId: number) => {
            const provider = new providers.JsonRpcProvider(idToRpcUrl[chainId]);
            const contractToken = IERC721Metadata__factory.connect(token, provider);
            try {
                console.log("token", token);
                
                console.log("try 1");
                console.log(nftId, typeof nftId);
                
                const uri = await contractToken.tokenURI(nftId);
                console.log("try 2");
                return uri;
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
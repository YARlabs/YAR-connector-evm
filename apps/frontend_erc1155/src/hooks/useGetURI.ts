import { useCallback } from "react"; 
import { idToRpcUrl } from "../utils/idToChainName";
import { providers } from "ethers";
import { IERC1155MetadataURI__factory } from "typechains";

export const useGetURI = () => {
    return useCallback(
        async (token: string, nftId: string, chainId: number) => {
            const provider = new providers.JsonRpcProvider(idToRpcUrl[chainId]);
            const contractToken = IERC1155MetadataURI__factory.connect(token, provider);
            try {  
                const uri = await contractToken.uri(nftId);
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
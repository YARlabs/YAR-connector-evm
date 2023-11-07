import { useCallback } from "react"; 
import { idToRpcUrl } from "../utils/idToChainName";
import { providers } from "ethers";
import { IERC20Metadata__factory } from "typechains";

const nativeTikers: any = {
    10226688: 'YAR',
    80001: 'MATIC',
    97: 'BNB',
    5: 'ETH',
    476158412: 'SKL',
    420: 'OP',
    421613: 'ARB',
    43113: 'AVAX',
    84531: 'BASE',
}

export const useGetTicker = () => {

    return useCallback(
        async (token: string, chainId: number) => {
            if(token == '0x0000000000000000000000000000000000000000') {
                return nativeTikers[chainId] ?? '-';
            }

            const provider = new providers.JsonRpcProvider(idToRpcUrl[chainId]);
            const contractToken = IERC20Metadata__factory.connect(token, provider);
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
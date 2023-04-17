import { ethers } from "ethers";

export class SafetyProviderManager {
    public static async getProvider(providersUrl: Array<string>): Promise<string> {
        for(const url of providersUrl) {
            try {
                await new ethers.providers.JsonRpcProvider(url).getBlockNumber()
                return url
            } catch(e) {
                continue
            }
        }
        throw Error('SafetyProviderManager: not has active provider')
    }
}
const { ethers } = require('ethers')
const { readFile } = require('fs/promises')

async function main() {
    const chains_rpc = JSON.parse(await readFile('chains_rpc.json', 'utf-8'))
    for (const chain of Object.keys(chains_rpc)) {
        console.log(`CHAIN: ${chain}`)
        let chainId
        for (const rpc of chains_rpc[chain]) {
            console.log(rpc)
            let currentChainId
            try {
                const provider = new ethers.providers.JsonRpcProvider({
                    url: rpc,
                    timeout: 5000
                })
                currentChainId = (await provider.getNetwork()).chainId
                chainId ??= currentChainId
                console.log(`chainId ${chainId}, currentChainId ${currentChainId}`)
            } catch(e) {
                console.log(`not active`)
                continue;
            }
            if (chainId != currentChainId) throw `chain: ${chain}, chainId: ${chainId}, currentChainId: ${currentChainId}, rpc: ${rpc}`
        }
        if(chainId === undefined) throw `not has active rpc. chain ${chain}`
        console.log(`\n`)
    }
}
main()
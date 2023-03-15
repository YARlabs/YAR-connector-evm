import { EvmListener } from "../listeners/EvmListener";

async function main() {
    const evmListener = new EvmListener('', '')
    await evmListener.init()
}

main()
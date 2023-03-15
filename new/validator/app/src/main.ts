import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process'
import { RenewableProcess } from './utils/RenewableProcess'


async function main() {
  console.log('!!!!!!!!!!!!!***************RUNING*****************')
  const p = new RenewableProcess({
    name: 'EvmListener',
    cmd: 'npx ts-node ./src/spawn/spawnEvmListenerProcess.ts',
  })
  // setTimeout(() => {
  //   p.shutdown()
  // }, 20000)
}

main()

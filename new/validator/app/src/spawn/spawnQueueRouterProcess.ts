import { EvmExecutor } from '../executors/EvmExecutor'
import { QueueRouter } from '../queue_router/QueueRouter'
import { CliArgsParser } from '../utils/CliArgsParser'

async function main() {
  const {
    chains,
  }: {
    chains: string
  } = CliArgsParser.parse(process.argv)

  const queueRouter = new QueueRouter({chains})
}

main()

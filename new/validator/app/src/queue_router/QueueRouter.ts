import { Queue, Worker } from 'bullmq'

export class QueueRouter {
  private readonly _chains: string
  private readonly _queues: Record<string, Queue>

  constructor({ chains }: { chains: string }) {
    this._chains = chains
    this._queues = {}

    for (const chain of chains) {
      this._queues[chain] = new Queue(chain, {
        connection: {
          host: 'localhost',
          port: 6379,
        },
      })
    }

    new Worker('QueueRouter', async job => {
        this._queues[job.name]!.add('new_task', job.data)
    }, {
      connection: {
        host: 'localhost',
        port: 6379,
      },
    })
  }
}

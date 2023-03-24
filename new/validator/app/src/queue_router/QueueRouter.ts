import { Queue, Worker } from 'bullmq'

export class QueueRouter {
  private readonly _chains: string
  private readonly _queues: Record<string, Queue>

  constructor({ chains }: { chains: string }) {
    this._chains = chains
    this._queues = {}
  }

  public async init() {
    for (const chain of this._chains) {
      this._queues[chain] = new Queue(chain, {
        connection: {
          host: 'localhost',
          port: 6379,
        },
      })
      await this._queues[chain]?.obliterate()
    }

    new Worker('QueueRouter', async job => {
        this._queues[job.name]!.add('new_task', job.data)
    }, {
      connection: {
        host: 'localhost',
        port: 6379,
      },
    })
    
    const q = new Queue('QueueRouter', {
      connection: {
        host: 'localhost',
        port: 6379,
      },
    })
    await q.obliterate()
  }
}

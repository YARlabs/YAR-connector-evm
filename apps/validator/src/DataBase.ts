import { Db, MongoClient } from 'mongodb'

export class DataBase {
  private readonly _db: Db
  private readonly _processName: string

  constructor({ dbName, processName }: { dbName: string; processName: string }) {
    const client = new MongoClient('mongodb://mongo:27017')
    this._db = client.db(dbName)
    this._processName = processName
  }

  public async addAwatingTrasfer(queueName: string, transfer: any) {
    const collection = this._db.collection('AwatingTransfers')
    await collection.insertOne({
      queueName,
      transferId: transfer.transferId,
      inProgress: false,
      transfer,
    })
  }

  public async getAwaitingTrasfers(queueName: string, withoutInProgress: boolean = true) {
    const collection = this._db.collection('AwatingTransfers')
    const awaitingTrasfers = await collection
      .find({
        queueName,
      })
      .toArray()
    const filteredTrasfers = withoutInProgress
      ? awaitingTrasfers.filter(t => t.inProgress == false)
      : awaitingTrasfers
    const result = filteredTrasfers.map(t => t.transfer)

    await collection.updateMany(
      {queueName},
      {
        $set: { inProgress: true },
      },
    )
    return result
  }

  public async completeAwaitingTrasfer(queueName: string, transfer: any) {
    await this._db.collection('AwatingTransfers').deleteOne({
      transferId: transfer.transferId,
    })

    await this._db.collection('CompletedTransfers').insertOne({
      queueName,
      transfer,
    })
  }

  public async setAppStatus(value: string) {
    const collection = this._db.collection('AppStatus')
    await collection.updateOne(
      {
        key: this._processName,
      },
      {
        $set: { status: value },
      },
      {
        upsert: true,
      },
    )
  }

  public async resetFails() {
    const collection = this._db.collection('AppStatus')
    await collection.updateOne(
      {
        key: this._processName,
      },
      {
        $set: { fails: 0 },
      },
      {
        upsert: true,
      },
    )
  }

  public async incrementFails() {
    const collection = this._db.collection('AppStatus')
    await collection.updateOne(
      {
        key: this._processName,
      },
      {
        $inc: { fails: 1 },
      },
      {
        upsert: true,
      },
    )
  }

  public async setPreviousBlock(block: number) {
    const collection = this._db.collection('AppStatus')
    await collection.updateOne(
      {
        key: this._processName,
      },
      {
        $set: { block },
      },
      {
        upsert: true,
      },
    )
  }

  public async getPreviousBlock(): Promise<number | undefined> {
    const collection = this._db.collection('AppStatus')
    return (
      await collection.findOne({
        key: this._processName,
      })
    )?.block
  }

  public async addAppError(error: string) {
    const collection = this._db.collection('AppErrors')
    await collection.insertOne({
      key: this._processName,
      error,
    })
  }

  public async clearDB() {
    await this._db.dropDatabase()
  }
}

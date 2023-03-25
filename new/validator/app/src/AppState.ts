import { Db, MongoClient, ObjectId } from 'mongodb'

export class AppState {
  private static _client?: MongoClient
  private static _getClient(): MongoClient {
    if (!this._client) {
      this._client = new MongoClient('mongodb://mongo:27017')
    }
    return this._client!
  }

  private static readonly _dbs: Record<string, Db> = {}
  private static _getDB(name: string): Db {
    if (!this._dbs[name]) {
      this._dbs[name] = this._getClient().db(name)
    }
    return this._dbs[name]!
  }

  private static readonly _awaitingTrasfersDB = 'AwatingTransfers'

  public static async addAwatingTrasfer(queueName: string, transfer: any) {
    const db = this._getDB(this._awaitingTrasfersDB)
    const collection = db.collection(queueName)
    await collection.insertOne({
      transferId: transfer.transferId,
      inProgress: false,
      transfer,
    })
  }

  public static async getAwaitingTrasfers(queueName: string, withoutInProgress: boolean = true) {
    const db = this._getDB(this._awaitingTrasfersDB)
    const collection = db.collection(queueName)
    const awaitingTrasfers = await collection.find().toArray()
    const filteredTrasfers = withoutInProgress
      ? awaitingTrasfers.filter(t => t.inProgress == false)
      : awaitingTrasfers
    const result = filteredTrasfers.map(t => t.transfer)

    await collection.updateMany(
      {},
      {
        $set: { inProgress: true },
      },
    )

    return result
  }

  public static async completeAwaitingTrasfer(queueName: string, transferId: string) {
  
    const db = this._getDB(this._awaitingTrasfersDB)
    const collection = db.collection(queueName)

    const res = await collection.deleteOne({
      transferId
    })

  }

  public static async getAppStatus() {
    const db = this._getDB('AppLog')
    const collection = db.collection('AppStatus')
    return await collection.find({}).toArray()
  }

  public static async setAppStatus(key: string, value: string) {
    const db = this._getDB('AppLog')
    const collection = db.collection('AppStatus')
    await collection.updateOne(
      {
        key,
      },
      {
        $set: { value: value },
      },
      {
        upsert: true,
      },
    )
  }

  public static async setPreviousBlock(key: string, block: number) {
    const db = this._getDB('AppLog')
    const collection = db.collection('AppStatus')
    await collection.updateOne(
      {
        key,
      },
      {
        $set: { block },
      },
      {
        upsert: true,
      },
    )
  }

  public static async getPreviousBlock(key: string): Promise<number | undefined> {
    const db = this._getDB('AppLog')
    const collection = db.collection('AppStatus')
    return (
      await collection.findOne({
        key,
      })
    )?.block
  }

  public static async getAppErrors() {
    const db = this._getDB('AppLog')
    const collection = db.collection('AppErrors')
    return await collection.find({}).toArray()
  }

  public static async addAppError(key: string, error: string) {
    const db = this._getDB('AppLog')
    const collection = db.collection('AppErrors')
    await collection.insertOne({
      key,
      error,
    })
  }
}

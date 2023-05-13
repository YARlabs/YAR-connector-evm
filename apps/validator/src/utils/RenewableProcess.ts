import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process'
import { DataBase } from '../DataBase'

export class RenewableProcess {
  private _currentProcess?: ChildProcessWithoutNullStreams
  private _isShutdown: boolean
  private _cmd: string
  private _timeout: number
  public readonly name: string
  private readonly _db: DataBase

  constructor({
    name,
    timeout = 0,
    cmd,
    db,
  }: {
    name: string
    timeout?: number
    cmd: string
    db: DataBase
  }) {
    this.name = name
    this._isShutdown = false
    this._cmd = cmd
    this._timeout = timeout

    this._db = db
    this._db.resetFails();

    this._runNewProcess()
  }

  public shutdown() {
    this._isShutdown = true
    this._currentProcess?.kill()
  }

  private async _runNewProcess() {
    this._currentProcess = spawn(this._cmd, { shell: true })
    this._currentProcess.stdout.on('data', async data => {
      console.log(`${this.name} ${data}`)
    })
    this._currentProcess.stderr.on('error', async error => {
      await this._db.addAppError(`${error}`)
    })
    this._currentProcess!.on('close', async code => {
      if (!this._isShutdown) {
        await this._db.setAppStatus('reloading')
        setTimeout(() => {
          this._runNewProcess()
        }, this._timeout)
      } else {
        await this._db.setAppStatus('stopped')
      }
    })
    await this._db.setAppStatus('loading')
  }
}

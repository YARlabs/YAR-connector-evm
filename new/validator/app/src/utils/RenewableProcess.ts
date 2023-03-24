import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process'
import { Logger } from './Logger'

export class RenewableProcess {
  private _currentProcess?: ChildProcessWithoutNullStreams
  private _isShutdown: boolean
  private _cmd: string
  private _timeout: number
  public readonly name: string

  constructor({
    name,
    timeout = 0,
    cmd,
  }: {
    name: string
    timeout?: number
    cmd: string
  }) {
    this.name = name
    this._isShutdown = false
    this._cmd = cmd
    this._timeout = timeout

    this._runNewProcess()
  }

  public shutdown() {
    this._isShutdown = true
    this._currentProcess?.kill()
  }

  private _runNewProcess() {
    this._currentProcess = spawn(this._cmd, { shell: true })
    this._currentProcess.stdout.on('data', (data: string) => {
      if(data.slice(0, 6) == '$error') {
        Logger.error(this.name, `${data.toString().trim()}`)
      } else {
        Logger.data(this.name, data.toString().trim())
      }
    })
    this._currentProcess.stderr.on('error', error => {
      Logger.error(this.name, `${error}`)
    })
    this._currentProcess!.on('close', code => {
      if (!this._isShutdown) {
        Logger.status(this.name, `reloading`)
        setTimeout(() => {
          this._runNewProcess()
        }, this._timeout)
      } else {
        Logger.status(this.name, `stopped`)
      }
    })
    Logger.status(this.name, `loading`)
  }
}

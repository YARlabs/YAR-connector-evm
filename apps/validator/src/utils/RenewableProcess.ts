import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process'
import { AppState } from '../AppState'

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

  private async _runNewProcess() {
    this._currentProcess = spawn(this._cmd, { shell: true })
    this._currentProcess.stdout.on('data', async data => {
      console.log(`${this.name} ${data}`)
    })
    this._currentProcess.stderr.on('error', async error => {
      await AppState.addAppError(this.name, `${error}`)
    })
    this._currentProcess!.on('close', async code => {
      if (!this._isShutdown) {
        await AppState.setAppStatus(this.name, 'reloading')
        setTimeout(() => {
          this._runNewProcess()
        }, this._timeout)
      } else {
        await AppState.setAppStatus(this.name, 'stopped')
      }
    })
    await AppState.setAppStatus(this.name, 'loading')
  }
}

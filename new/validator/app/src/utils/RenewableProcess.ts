import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process'

export class RenewableProcess {
  private _currentProcess?: ChildProcessWithoutNullStreams
  private _isShutdown: boolean
  private _cmd: string
  private _timeout: number
  public readonly name: string

  constructor({ name, timeout = 0, cmd }: { name: string; timeout?: number; cmd: string }) {
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
    this._currentProcess.stdout.on('data', data => {
      console.log(`${this.name} stdout: ${data}`)
    })
    this._currentProcess.stderr.on('data', data => {
      console.error(`${this.name} stderr: ${data}`)
    })
    this._currentProcess!.on('close', code => {
      console.log(`${this.name} child process exited with code ${code}`)
      if (!this._isShutdown) {
        setTimeout(() => {
          this._runNewProcess()
        }, this._timeout)
      }
    })
  }
}

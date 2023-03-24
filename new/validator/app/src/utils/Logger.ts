import {appendFile} from 'node:fs/promises'




export class Logger {
    public static mode: 'prod' | 'dev' = 'dev'
    public static readonly dataFilePath = './data_log.txt'
    public static readonly statusFilePath = './status_log.txt'
    public static readonly errorsFilePath = './errors_log.txt'
    
    public static async data(name: string, data: string) {
        const d = `[${name}] ${data}`
        if(this.mode == 'prod') {
            await appendFile(this.dataFilePath, d)
        }
        console.log(`data ${d}`)
    }

    public static async status(name: string, data: string) {
        const d = `[${name}] ${data}`
        if(this.mode == 'prod') {
            await appendFile(this.statusFilePath, d)
        } 
        console.log(`status ${d}`)
    }

    public static async error(name: string, data: string) {
        const d = `\n[${name}] ${data}\n`
        if(this.mode == 'prod') {
            await appendFile(this.errorsFilePath, d)
        } 
        console.log(`error ${d}`)
    }
}
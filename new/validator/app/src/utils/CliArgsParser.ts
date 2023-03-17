export class CliArgsParser {
  public static parse<T>(args: Array<string>) {
    var args = process.argv.slice(2)
    const result = {} as T
    for (const arg of args) {
      const [name, value] = arg.split('=')
      result[name!] = value
    }
    return result
  }
}

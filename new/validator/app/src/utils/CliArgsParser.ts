export class CliArgsParser {
  public static parse<T>(args: Array<string>) {
    var args = process.argv.slice(2)
    const result = {} as T
    for (const arg of args) {
      let [name, value] = arg.split('=')
      if(value == 'undefined') value = undefined
      result[name!] = value
    }
    return result
  }
}

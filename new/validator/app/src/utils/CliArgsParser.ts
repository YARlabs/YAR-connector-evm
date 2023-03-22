export class CliArgsParser {
  public static parse<T>(args: Array<string>) {
    var args = process.argv.slice(2)
    const result = {} as T
    for (const arg of args) {
      let name, value
      [name, value ] = arg.split('=')
      if(value == 'undefined') value = undefined
      if(value![0] == '[' && value![value!.length - 1] == ']') {
        value = value!.slice(1, value!.length - 1).split(',')
      }
      result[name!] = value
    }
    return result
  }
}

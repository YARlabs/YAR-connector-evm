export class CliArgsParser {
  public static parse<T>(args: Array<string>) {
    console.log('aw1')
    var args = process.argv.slice(2)
    console.log('aw12')
    const result = {} as T
    console.log(args)
    console.log('aw13')
    for (const arg of args) {
      console.log('aw14')
      let name, value
      [name, value ] = arg.split('=')
      console.log('aw15')
      if(value == 'undefined') value = undefined
      console.log('aw16')
      if(value![0] == '[' && value![value!.length - 1] == ']') {
        console.log('aw17')
        value = value!.slice(1, value!.length - 1).split(',')
      }
      console.log('aw18')
      
      result[name!] = value
      
    console.log('aw19')
    }
    console.log('aw111')
    return result
  }
}

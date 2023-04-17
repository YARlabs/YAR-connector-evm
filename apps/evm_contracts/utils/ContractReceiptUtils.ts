import ethers from 'ethers'
import { TypedEvent, TypedEventFilter } from '../typechain-types/common'

export class ContractReceiptUtils {
  
  public static readonly getEvent = <TArgsArray extends any[], TArgsObject>(
    events: ethers.Event[] | undefined,
    contract: ethers.BaseContract,
    eventFilter: TypedEventFilter<TypedEvent<TArgsArray, TArgsObject>>,
  ): TypedEvent<TArgsArray, TArgsObject> | undefined => {
    const parsedEvents = this.getEvents(events, contract, eventFilter)
    if(parsedEvents.length) return parsedEvents[0]
  }

  public static readonly getEvents = <TArgsArray extends any[], TArgsObject>(
    events: ethers.Event[] | undefined,
    contract: ethers.BaseContract,
    eventFilter: TypedEventFilter<TypedEvent<TArgsArray, TArgsObject>>,
  ): TypedEvent<TArgsArray, TArgsObject>[] => {
    events ??= []
    return events
      .filter(ev => this.matchTopics(eventFilter.topics, ev.topics))
      .map(ev => {
        const args = contract.interface.parseLog(ev).args
        const result: TypedEvent<TArgsArray, TArgsObject> = {
          ...ev,
          args: args as TArgsArray & TArgsObject,
        }
        return result
      })
  }

  private static readonly matchTopics = (
    filter: Array<string | Array<string>> | undefined,
    value: Array<string>,
  ): boolean => {
    // Implement the logic for topic filtering as described here:
    // https://docs.ethers.io/v5/concepts/events/#events--filters
    if (!filter) {
      return false
    }
    for (let i = 0; i < filter.length; i++) {
      const f = filter[i]
      const v = value[i]
      if (typeof f == 'string') {
        if (f !== v) {
          return false
        }
      } else {
        if (f.indexOf(v) === -1) {
          return false
        }
      }
    }
    return true
  }
}

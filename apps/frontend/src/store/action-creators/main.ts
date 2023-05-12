import { MainAction, MainActionTypes } from "../../types/main";


export function SetTicker(ticker: string): MainAction {
    return {type: MainActionTypes.SET_TICKER, payload: ticker}
}
export function ClearTicker(): MainAction {
    return {type: MainActionTypes.CLEAR_TICKER}
}
export function SetChainIdFrom(id: number): MainAction {
    return {type: MainActionTypes.SET_CHAINID_FROM, payload: id}
}
export function SetChainIdTo(id: number): MainAction {
    return {type: MainActionTypes.SET_CHAINID_TO, payload: id}
}
export function SetToken(token: string): MainAction {
    return {type: MainActionTypes.SET_TOKEN, payload: token}
}
export function SetReciever(reciever: string): MainAction {
    return {type: MainActionTypes.SET_RECIEVER, payload: reciever}
}
export function SetAmount(amount: string): MainAction {    
    return {type: MainActionTypes.SET_AMOUNT, payload: amount}
}
export function SetNotify(notify: string): MainAction {
    return {type: MainActionTypes.SET_NOTIFY, payload: notify}
}
export interface MainState {
    ticker: string;
    token: string;
    reciever: string;
    chainIdFrom: number;
    chainIdTo: number;
    amount: string;
    notify: string;
}

export enum MainActionTypes {
    SET_TICKER = 'SET_TICKER',
    CLEAR_TICKER = 'CLEAR_TICKER',
    SET_CHAINID_FROM = 'SET_CHAINID_FROM',
    SET_CHAINID_TO = 'SET_CHAINID_TO',
    SET_TOKEN = 'SET_TOKEN',
    SET_RECIEVER = 'SET_RECIEVER',
    SET_AMOUNT = 'SET_AMOUNT',
    SET_NOTIFY = 'SET_NOTIFY'
} 
interface SetTickerAction {
    type: MainActionTypes.SET_TICKER;
    payload: string;
}
interface ClearTickerAction {
    type: MainActionTypes.CLEAR_TICKER;
}
interface SetChainIdFromAction {
    type: MainActionTypes.SET_CHAINID_FROM;
    payload: number;
}
interface SetChainIdToAction {
    type: MainActionTypes.SET_CHAINID_TO;
    payload: number;
}
interface SetTokenAction {
    type: MainActionTypes.SET_TOKEN;
    payload: string;
}
interface SetRecieverAction {
    type: MainActionTypes.SET_RECIEVER;
    payload: string;
}
interface SetAmountAction {
    type: MainActionTypes.SET_AMOUNT;
    payload: string;
}
interface SetNotifyAction {
    type: MainActionTypes.SET_NOTIFY;
    payload: string;
}
export type MainAction = 
    SetTickerAction |
    ClearTickerAction |
    SetChainIdFromAction |
    SetChainIdToAction |
    SetTokenAction |
    SetRecieverAction |
    SetAmountAction |
    SetNotifyAction;
import { MainState, MainAction, MainActionTypes } from "../../types/main"
import { BSCTestnet, Mumbai } from "@usedapp/core";
 
const initialState: MainState = {
    ticker: "",
    chainIdFrom: BSCTestnet.chainId,
    chainIdTo: Mumbai.chainId,
    token: "",
    reciever: "",
    amount: "",
    notify: ""
}

export const mainReducer = (state: MainState = initialState, action: MainAction): MainState => {
    switch (action.type) {
        case MainActionTypes.SET_TICKER:
            return {...state, ticker: action.payload}
        case MainActionTypes.CLEAR_TICKER:
            return {...state, ticker: ""}
        case MainActionTypes.SET_CHAINID_FROM:
            return {...state, chainIdFrom: action.payload}
        case MainActionTypes.SET_CHAINID_TO:
            return {...state, chainIdTo: action.payload}
        case MainActionTypes.SET_TOKEN:
            return {...state, token: action.payload}
        case MainActionTypes.SET_RECIEVER:
            return {...state, reciever: action.payload}
        case MainActionTypes.SET_AMOUNT:
            return {...state, amount: action.payload}
        case MainActionTypes.SET_NOTIFY:
            return {...state, notify: action.payload}
        default:
            return state
    }
}
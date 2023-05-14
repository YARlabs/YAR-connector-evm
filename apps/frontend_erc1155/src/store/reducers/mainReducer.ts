import { MainState, MainAction, MainActionTypes } from "../../types/main"
import { BSCTestnet, Mumbai } from "@usedapp/core";

const initialState: MainState = {
    amount: "",
    chainIdFrom: BSCTestnet.chainId,
    chainIdTo: Mumbai.chainId,
    token: "",
    reciever: "",
    tokenId: "",
    notify: "",
    uri: "",
    imageLink: "",
    jsonMetadata: {}
}

export const mainReducer = (state: MainState = initialState, action: MainAction): MainState => {
    switch (action.type) {
        case MainActionTypes.SET_AMOUNT:
            return {...state, amount: action.payload}
        case MainActionTypes.SET_CHAINID_FROM:
            return {...state, chainIdFrom: action.payload}
        case MainActionTypes.SET_CHAINID_TO:
            return {...state, chainIdTo: action.payload}
        case MainActionTypes.SET_TOKEN:
            return {...state, token: action.payload}
        case MainActionTypes.SET_RECIEVER:
            return {...state, reciever: action.payload}
        case MainActionTypes.SET_TOKEN_ID:
            return {...state, tokenId: action.payload}
        case MainActionTypes.SET_NOTIFY:
            return {...state, notify: action.payload}
        case MainActionTypes.SET_URI:
            return {...state, uri: action.payload}   
        case MainActionTypes.SET_IMAGE_LINK:
            return {...state, imageLink: action.payload} 
        case MainActionTypes.SET_JSON_METADATA:
            return {...state, jsonMetadata: action.payload}    
        default:
            return state
    }
}




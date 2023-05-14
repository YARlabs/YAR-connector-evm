import { MainAction, MainActionTypes } from "../../types/main";

export function SetAmount(amount: string): MainAction {    
    return {type: MainActionTypes.SET_AMOUNT, payload: amount}
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
export function SetTokenId(id: string): MainAction {    
    return {type: MainActionTypes.SET_TOKEN_ID, payload: id}
}
export function SetNotify(notify: string): MainAction {
    return {type: MainActionTypes.SET_NOTIFY, payload: notify}
}
export function SetUri(uri: string): MainAction {
    return {type: MainActionTypes.SET_URI, payload: uri}
}
export function SetImageLink(imageLink: string): MainAction {
    return {type: MainActionTypes.SET_IMAGE_LINK, payload: imageLink}
}
export function SetJsonMetadata(json: any): MainAction {
    return {type: MainActionTypes.SET_JSON_METADATA, payload: json}
}
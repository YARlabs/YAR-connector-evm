export interface MainState {
    token: string;
    amount: string;
    reciever: string;
    chainIdFrom: number;
    chainIdTo: number;
    tokenId: string;
    notify: string;
    uri: string;
    imageLink: string;
    jsonMetadata: any;
}

export enum MainActionTypes {
    SET_AMOUNT = 'SET_AMOUNT',
    SET_CHAINID_FROM = 'SET_CHAINID_FROM',
    SET_CHAINID_TO = 'SET_CHAINID_TO',
    SET_TOKEN = 'SET_TOKEN',
    SET_RECIEVER = 'SET_RECIEVER',
    SET_TOKEN_ID = 'SET_TOKEN_ID',
    SET_NOTIFY = 'SET_NOTIFY',
    SET_URI = 'SET_URI',
    SET_JSON_METADATA = 'SET_JSON_METADATA',
    SET_IMAGE_LINK = 'SET_IMAGE_LINK'
} 
interface SetAmountAction {
    type: MainActionTypes.SET_AMOUNT;
    payload: string;
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
interface SetTokenIdAction {
    type: MainActionTypes.SET_TOKEN_ID;
    payload: string;
}
interface SetNotifyAction {
    type: MainActionTypes.SET_NOTIFY;
    payload: string;
}
interface SetUriAction {
    type: MainActionTypes.SET_URI;
    payload: string;
}
interface SetJsonMetadataAction {
    type: MainActionTypes.SET_JSON_METADATA;
    payload: any;
}
interface SetImageLinkAction {
    type: MainActionTypes.SET_IMAGE_LINK;
    payload: string;
}

export type MainAction = 
    SetAmountAction |
    SetChainIdFromAction |
    SetChainIdToAction |
    SetTokenAction |
    SetRecieverAction |
    SetTokenIdAction |
    SetNotifyAction |
    SetUriAction |
    SetJsonMetadataAction |
    SetImageLinkAction;
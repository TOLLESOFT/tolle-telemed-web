export enum MessageType{
    TEXT,
    IMAGE,
    FILE,
    NOTE,
    DATE
}

export interface Msg {
    id: any;
    text: string;
    from: string;
    time: string;
    userId: string;
    msgType: MessageType;
}

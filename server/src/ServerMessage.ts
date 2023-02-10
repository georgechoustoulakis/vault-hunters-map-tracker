import {Player, Session, SessionInfo} from "./VaultSession";


export interface ServerTokenMessage {
    type: 'token';
    token: string;
}

export interface ServerErrorMessage {
    type: 'error';
    message: string;
}

export interface ServerUpdateMessage {
    type: 'update';
    sessions: SessionInfo[];
    players: Player[]
}

export interface ServerSessionDetails extends Session {
    type: 'session-details';
}

export type ServerMessage = ServerUpdateMessage | ServerTokenMessage | ServerErrorMessage | ServerSessionDetails;

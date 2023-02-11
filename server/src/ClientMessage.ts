import {Room} from "./VaultSession";
import {PlayerLocation} from "./Player";

interface AuthorizedClientMessage {
    token: string,
}

export interface ClientCreatePlayer {
    type: 'create-player',
    name: string,
    token: string
}

export interface ClientCreateSession extends AuthorizedClientMessage {
    type: 'create-session',
}

export interface ClientSessionDetails extends AuthorizedClientMessage {
    type: 'session-details',
    sessionId: string,
}

export interface ChangeRoom extends AuthorizedClientMessage {
    type: 'session-update-room',
    sessionId: string,
    room: Room
}

export interface AddRoom extends AuthorizedClientMessage {
    type: 'session-add-room',
    sessionId: string,
    x: number,
    y: number
}

export interface ChangePlayerLocation extends AuthorizedClientMessage {
    type: 'session-change-player-location',
    sessionId: string,
    player: PlayerLocation
}

export type ClientMessage =
    ClientCreatePlayer
    | ClientCreateSession
    | ClientSessionDetails
    | ChangeRoom
    | AddRoom
    | ChangePlayerLocation;

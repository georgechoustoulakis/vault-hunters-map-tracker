import {PlayerLocation} from "./Player";
import {CenterDirection, Room, RoomType} from "./Session";

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
    direction: CenterDirection,
}

export interface ClientSessionDetails extends AuthorizedClientMessage {
    type: 'session-details',
    sessionId: string,
}

export interface ClientUpdateRoom extends AuthorizedClientMessage {
    type: 'session-update-room',
    sessionId: string,
    x: number,
    y: number,
    roomType: RoomType
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
    | ClientUpdateRoom
    | ChangePlayerLocation;

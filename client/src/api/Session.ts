import {PlayerLocation} from "./Player";

export enum RoomType {
    UNKNOWN, // No info about where there is/isn't a room here
    EMPTY, // There is no room here.
    ROOM, // Duh.
    CENTER, // Center Room, can't be modified.
    OBJECTIVE, // Room + objective
}

export type Room = RoomType.EMPTY | BasicRoom | CenterRoom;

export class BasicRoom {
    type: RoomType.ROOM | RoomType.OBJECTIVE | RoomType.UNKNOWN;
    north = false;
    south = false;
    east = false;
    west = false;

    constructor(roomType: RoomType.ROOM | RoomType.OBJECTIVE | RoomType.UNKNOWN) {
        this.type = roomType;
    }
}

export enum CenterDirection {
    NORTH,
    EAST,
    SOUTH,
    WEST,
}

export class CenterRoom {
    readonly type = RoomType.CENTER
    readonly direction: CenterDirection;

    constructor(direction: CenterDirection) {
        this.direction = direction;
    }
}

export interface SessionInfo {
    readonly id: string;
    readonly time: Date;
}

export interface SessionDetails extends SessionInfo {
    readonly size: number;
    players: PlayerLocation[];
    grid: Room[][];
}


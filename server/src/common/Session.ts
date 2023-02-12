import {PlayerLocation} from "./Player";
import {randomUUID} from "crypto";

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


export class DefaultSession implements SessionDetails {
    readonly id = randomUUID();
    readonly size: number = 21;
    readonly time = new Date();
    players: PlayerLocation[] = [];
    grid: Room[][];

    constructor() {
        this.grid = new Array(this.size).fill(undefined);
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = new Array(this.size).fill(RoomType.EMPTY);
        }
    }
}


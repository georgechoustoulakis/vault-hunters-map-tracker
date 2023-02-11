import {randomUUID} from "crypto";
import {PlayerLocation} from "./Player";

export interface Room {
    id: string;
    x: number;
    y: number;
    objective: boolean;
    north: boolean;
    east: boolean;
    south: boolean;
    west: boolean;
}

export interface SessionInfo {
    readonly id: string;
    readonly time: Date;
}

export interface Session extends SessionInfo {
    readonly size: number;
    rooms: Room[];
    players: PlayerLocation[]
}

export class VaultRoom implements Room {
    constructor(public x: number, public y: number) {
    }

    readonly id = randomUUID();
    objective = false
    north = true;
    east = true;
    south = true;
    west = true;
}

export class VaultSession implements Session {
    readonly id = randomUUID();
    readonly size = 21;
    readonly time = new Date();
    rooms: Room[] = [new VaultRoom(10, 10)];
    players: PlayerLocation[] = [];
}

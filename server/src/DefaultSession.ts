import {randomUUID} from "crypto";
import {PlayerLocation} from "../../client/src/api/Player";
import {Room, RoomType, SessionDetails} from "../../client/src/api/Session";

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

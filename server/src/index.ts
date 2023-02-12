import express from 'express';
import * as http from "http";
import * as WS from 'ws'
import {ChangePlayerLocation, ClientCreatePlayer, ClientMessage, ClientUpdateRoom} from "./common/ClientMessage";
import {
    ServerErrorMessage,
    ServerInfoMessage,
    ServerMessage,
    ServerSessionDetails,
    ServerTokenMessage,
    ServerUpdateMessage
} from "./common/ServerMessage";
import {randomUUID} from "crypto";
import {LocalStorage} from "node-localstorage";
import {Player} from "./common/Player";
import path from "path";
import {BasicRoom, CenterDirection, CenterRoom, DefaultSession, RoomType, SessionDetails} from "./common/Session";

const PORT = process.env.PORT || 3001;

const app = express();

const server = http.createServer(app);

const wss = new WS.Server<WS>({server});

const sessions = new Map<string, SessionDetails>();

const storage = new LocalStorage('./storage');
const players: Player[] = JSON.parse(storage.getItem('players') ?? '[]');
console.log(players);

setInterval(() => {
    wss.clients.forEach((ws: WS) => {
        ws.ping();
    });
}, 20000)

wss.on('connection', (ws: WS) => {
    ws.on('message', (message: string) => {
        let json: ClientMessage;
        try {
            json = JSON.parse(message);
        } catch (e: unknown) {
            return sendError(ws, 'Error parsing response.');
        }
        handleClientMessage(ws, json);
    });
    ws.on("pong", (ws: WS) => {
        // console.log('pong');
    })
    sendMessage(ws, updateMessage());
});

function handleClientMessage(ws: WS, message: ClientMessage) {
    switch (message.type) {
        case "create-player":
            return createPlayer(ws, message);
        case "create-session":
            return createSession(message.direction);
        case "session-details":
            return requestSessionDetails(ws, message.sessionId);
        case "session-update-room":
            return updateRoom(ws, message.sessionId, message);
        case 'session-change-player-location':
            return changePlayerLocation(ws, message)
    }
}

function createPlayer(ws: WS, message: ClientCreatePlayer) {
    const existingPlayer = players.find((player) => player.name === message.name)
    if (existingPlayer !== undefined) {
        if (existingPlayer.token === message.token) {
            return sendInfo(ws, 'Already Authenticated 🚀')
        }
        if (message.token !== '') {
            return sendError(ws, 'Server was reset and your name is now taken. Clear cache and try again please.')
        }
        return sendError(ws, 'This name is already taken.');
    } else if (message.token !== '') {
        addPlayer({name: message.name, token: message.token});
        return sendInfo(ws, 'Server was reset, but was able to authenticate 🚀');
    }
    const token = randomUUID();
    addPlayer({name: message.name, token});
    const response: ServerTokenMessage = {
        type: 'token',
        token: token
    };
    sendMessage(ws, response);
}

function addPlayer(player: Player) {
    players.push(player);
    storage.setItem('players', JSON.stringify(players));
    updateMessageToAll();
}

function createSession(direction: CenterDirection) {
    const session = new DefaultSession();
    sessions.set(session.id, session);
    let x = 10;
    let y = 10;
    session.grid[x][y] = new CenterRoom(direction);
    // Add a room adjacent to the starting position:
    switch (direction) {
        case CenterDirection.NORTH:
            x = x - 1;
            break;
        case CenterDirection.SOUTH:
            x = x + 1;
            break
        case CenterDirection.EAST:
            y = y - 1;
            break;
        case CenterDirection.WEST:
            y = y + 1;
    }
    session.grid[x][y] = new BasicRoom(RoomType.UNKNOWN);
    updateRoomConnections(session, x, y);
    updateMessageToAll();
}

function requestSessionDetails(ws: WS, id: string) {
    const session = sessions.get(id);
    if (!session) {
        return;
    }
    sendSessionDetails(ws, session);
}

function sendSessionDetails(ws: WS, session: DefaultSession) {
    const message: ServerSessionDetails = {
        type: 'session-details',
        ...session
    }
    sendMessage(ws, message);
}

function sendSessionDetailsToALl(ws: WS, session: DefaultSession) {
    const message: ServerSessionDetails = {
        type: 'session-details',
        ...session
    }
    wss.clients.forEach((ws: WS) => {
        sendMessage(ws, message);
    });
}

function updateRoom(ws: WS, sessionId: string, message: ClientUpdateRoom) {
    const session = sessions.get(sessionId);
    console.log(message);
    if (!session) {
        return;
    }
    switch (message.roomType) {
        case RoomType.EMPTY:
            session.grid[message.x][message.y] = message.roomType;
            break;
        case RoomType.OBJECTIVE:
        case RoomType.ROOM:
        case RoomType.UNKNOWN:
            const currentRoom = session.grid[message.x][message.y];
            if (currentRoom === RoomType.EMPTY) {
                session.grid[message.x][message.y] = new BasicRoom(message.roomType);
            } else if (currentRoom.type === RoomType.CENTER) {
                return sendError(ws, 'Can\'t update the center room...');
            } else {
                currentRoom.type = message.roomType;
            }
            break
        case RoomType.CENTER:
            return sendError(ws, 'Cannot add a second center');
    }
    updateRoomConnections(session, message.x, message.y);
    sendSessionDetailsToALl(ws, session);
}

function changePlayerLocation(ws: WS, message: ChangePlayerLocation) {
    const session = sessions.get(message.sessionId);
    if (!session) {
        return;
    }
    const room = session.grid[message.player.x][message.player.y];
    if (room === RoomType.EMPTY) {
        return sendError(ws, 'Can\t move player into an empty void.');
    }
    if (room.type === RoomType.UNKNOWN) {
        // Upgrade the room to an actual room.
        room.type = RoomType.ROOM;
        addAdjacentRooms(session, message.player.x, message.player.y);
        updateRoomConnections(session, message.player.x, message.player.y);
    }
    session.players = session.players.filter((playerLocation) => playerLocation.name !== message.player.name);
    session.players.push(message.player);

    sendSessionDetailsToALl(ws, session);
}

function updateRoomConnections(session: SessionDetails, x: number, y: number) {
    const grid = session.grid;
    const room = grid[x][y];
    const canMakeConnection = room !== RoomType.EMPTY && room.type !== RoomType.CENTER;
    if (canMakeConnection) {
        //reset first
        room.north = false;
        room.east = false;
        room.west = false;
        room.south = false;
    }

    if (x - 1 >= 0) {
        const northRoom = grid[x - 1][y];
        if (northRoom !== RoomType.EMPTY) {
            if (northRoom.type !== RoomType.CENTER) {
                northRoom.south = canMakeConnection;
                if (canMakeConnection) {
                    room.north = canMakeConnection;
                }
            } else if (canMakeConnection && northRoom.direction === CenterDirection.SOUTH) {
                room.north = canMakeConnection;
            }
        }
    }
    if (x + 1 < session.size) {
        const southRoom = grid[x + 1][y];
        if (southRoom !== RoomType.EMPTY) {
            if (southRoom.type !== RoomType.CENTER) {
                southRoom.north = canMakeConnection;
                if (canMakeConnection) {
                    room.south = canMakeConnection;
                }
            } else if (canMakeConnection && southRoom.direction === CenterDirection.NORTH) {
                room.south = canMakeConnection;
            }

        }
    }
    if (y - 1 >= 0) {
        const eastRoom = grid[x][y - 1];
        if (eastRoom !== RoomType.EMPTY) {
            if (eastRoom.type !== RoomType.CENTER) {
                eastRoom.west = canMakeConnection;
                if (canMakeConnection) {
                    room.east = canMakeConnection;
                }
            } else if (canMakeConnection && eastRoom.direction === CenterDirection.WEST) {
                room.east = canMakeConnection;
            }

        }
    }
    if (y + 1 < session.size) {
        const westRoom = grid[x][y + 1];
        if (westRoom !== RoomType.EMPTY) {
            if (westRoom.type !== RoomType.CENTER) {
                westRoom.east = canMakeConnection;
                if (canMakeConnection) {
                    room.west = canMakeConnection;
                }
            } else if (canMakeConnection && westRoom.direction === CenterDirection.EAST) {
                room.west = canMakeConnection;
            }
        }
    }
}

function addAdjacentRooms(session: SessionDetails, x: number, y: number) {
    const grid = session.grid;
    console.log(session, x, y);
    if (x - 1 >= 0) {
        const northRoom = grid[x - 1][y];
        if (northRoom === RoomType.EMPTY) {
            session.grid[x - 1][y] = new BasicRoom(RoomType.UNKNOWN);
        }
    }
    if (x + 1 < session.size) {
        const southRoom = grid[x + 1][y];
        if (southRoom === RoomType.EMPTY) {
            session.grid[x + 1][y] = new BasicRoom(RoomType.UNKNOWN);
        }
    }
    if (y - 1 >= 0) {
        const eastRoom = grid[x][y - 1];
        if (eastRoom === RoomType.EMPTY) {
            session.grid[x][y - 1] = new BasicRoom(RoomType.UNKNOWN);
        }
    }
    if (y + 1 < session.size) {
        const westRoom = grid[x][y + 1];
        if (westRoom === RoomType.EMPTY) {
            session.grid[x][y + 1] = new BasicRoom(RoomType.UNKNOWN);
        }
    }
}

function updateMessage(): ServerUpdateMessage {
    return {
        type: 'update',
        sessions: Array.from(sessions.values()).map((session: DefaultSession) => {
            return {
                id: session.id,
                time: session.time,
                players: session.players
            }
        }).reverse(),
    }
}

function updateMessageToAll(): void {
    const message = updateMessage();
    wss.clients.forEach((ws: WS) => {
        sendMessage(ws, message);
    });
}

function sendMessage(ws: WS, message: ServerMessage) {
    ws.send(JSON.stringify(message));
}

function sendError(ws: WS, error: string) {
    const message: ServerErrorMessage = {
        type: 'error',
        message: error
    }
    ws.send(JSON.stringify(message));
}

function sendInfo(ws: WS, text: string) {
    const message: ServerInfoMessage = {
        type: 'info',
        message: text
    }
    ws.send(JSON.stringify(message));
}

server.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../../client/build')));

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'));
});

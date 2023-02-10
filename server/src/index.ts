import express from 'express';
import * as http from "http";
import * as WS from 'ws'
import {ClientCreatePlayer, ClientMessage} from "./ClientMessage";
import {Room, VaultRoom, VaultSession} from "./VaultSession";
import {
    ServerErrorMessage,
    ServerInfoMessage,
    ServerMessage,
    ServerSessionDetails,
    ServerTokenMessage,
    ServerUpdateMessage
} from "./ServerMessage";
import {randomUUID} from "crypto";
import {LocalStorage} from "node-localstorage";
import {Player} from "./Player";

const PORT = process.env.PORT || 3001;

const app = express();

const server = http.createServer(app);

const wss = new WS.Server<WS>({server});

const sessions = new Map<string, VaultSession>();

const storage = new LocalStorage('./storage');
const players: Player[] = JSON.parse(storage.getItem('players') ?? '[]');
console.log(players);

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
    sendMessage(ws, updateMessage());
});

function handleClientMessage(ws: WS, message: ClientMessage) {
    switch (message.type) {
        case "create-player":
            return createPlayer(ws, message);
        case "create-session":
            return createSession(ws);
        case "session-details":
            return requestSessionDetails(ws, message.sessionId);
        case "session-update-room":
            return updateRoom(ws, message.sessionId, message.room);
        case "session-add-room":
            return addRoom(ws, message.sessionId, message.x, message.y);
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

function createSession(ws: WS) {
    const session = new VaultSession();
    sessions.set(session.id, session);
    // notify all clients
    updateMessageToAll();
}

function requestSessionDetails(ws: WS, id: string) {
    const session = sessions.get(id);
    if (!session) {
        return;
    }
    sendSessionDetails(ws, session);
}

function sendSessionDetails(ws: WS, session: VaultSession) {
    const message: ServerSessionDetails = {
        type: 'session-details',
        ...session
    }
    sendMessage(ws, message);
}

function sendSessionDetailsToALl(ws: WS, session: VaultSession) {
    const message: ServerSessionDetails = {
        type: 'session-details',
        ...session
    }
    wss.clients.forEach((ws: WS) => {
        sendMessage(ws, message);
    });
}

function updateRoom(ws: WS, sessionId: string, updatedRoom: Room) {
    const session = sessions.get(sessionId);
    if (!session) {
        return;
    }
    const room = session.rooms.find((room) => room.id === updatedRoom.id)!;

    room.objective = updatedRoom.objective;
    room.north = updatedRoom.north
    room.east = updatedRoom.east;
    room.south = updatedRoom.south;
    room.west = updatedRoom.west

    sendSessionDetailsToALl(ws, session);
}

function addRoom(ws: WS, sessionId: string, x: number, y: number) {
    const session = sessions.get(sessionId);
    if (!session) {
        return;
    }
    session.rooms.push(new VaultRoom(x, y));
    sendSessionDetailsToALl(ws, session);
}

function updateMessage(): ServerUpdateMessage {
    return {
        type: 'update',
        sessions: Array.from(sessions.values()).map((session: VaultSession) => {
            return {
                id: session.id,
                time: session.time,
                players: session.players
            }
        }),
        players: players.map((player) => player.name);
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

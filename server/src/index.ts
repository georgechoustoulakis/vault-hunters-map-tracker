import express from 'express';
import * as http from "http";
import * as WS from 'ws'
import {ClientMessage} from "./ClientMessage";
import {Room, VaultRoom, VaultSession} from "./VaultSession";
import {
    ServerErrorMessage,
    ServerMessage,
    ServerSessionDetails,
    ServerTokenMessage,
    ServerUpdateMessage
} from "./ServerMessage";
import {randomUUID} from "crypto";

const PORT = process.env.PORT || 3001;

const app = express();

const server = http.createServer(app);

const wss = new WS.Server<WS>({server});

const sessions = new Map<string, VaultSession>();

const players = new Map<string, string>();


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
            return createPlayer(ws, message.name);
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

function createPlayer(ws: WS, name: string) {
    if (players.has(name)) {
        return sendError(ws, 'This name is already taken.');
    }
    const token = randomUUID();
    players.set(name, token);
    const message: ServerTokenMessage = {
        type: 'token',
        token
    };
    sendMessage(ws, message);
    sendMessage(ws, updateMessage());
}

function createSession(ws: WS) {
    const session = new VaultSession();
    sessions.set(session.id, session);
    // notify all clients
    const message = updateMessage();
    wss.clients.forEach((ws: WS) => {
        sendMessage(ws, message);
    });
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
        players: [...players.keys()]
    }
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

server.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

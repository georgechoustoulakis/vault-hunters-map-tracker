import React from 'react';
import {Room, Session} from '../../../server/src/VaultSession'
import {ClientMessage} from '../../../server/src/ClientMessage'


interface RoomProps {
    room: Room;
    sendMessage: (clientMessage: ClientMessage) => void;
    currentSession: Session;
    token: string;
    name: string;
    sessionId: string;
}

export function RoomComponent(props: RoomProps) {
    const {room, sendMessage, currentSession, sessionId, token, name} = props;


    const onClickWest = () => {
        sendMessage({type: 'session-update-room', token, sessionId, room: {...room, west: !room.west}})
    }
    const onClickNorth = () => {
        sendMessage({type: 'session-update-room', token, sessionId, room: {...room, north: !room.north}})
    }
    const onClickEast = () => {
        sendMessage({type: 'session-update-room', token, sessionId, room: {...room, east: !room.east}})
    }
    const onClickSouth = () => {
        sendMessage({type: 'session-update-room', token, sessionId, room: {...room, south: !room.south}})
    }
    const onClickCenter = () => {
        sendMessage({type: 'session-change-player-location', token, sessionId, player: {name, x: room.x, y: room.y}})
    }

    const isCenter = room.x === 10 && room.y === 10;

    const playerInThisRoom = currentSession.players.filter((playerLocation) => playerLocation.x === room.x && playerLocation.y === room.y)

    const isPlayer = playerInThisRoom.find((playerLocation) => playerLocation.name === name)

    return (
        <>
            <div className="room-parent">
                <div className="div1"
                     style={{
                         backgroundColor: isCenter ? "indianred" : 'sandybrown',
                         borderStyle: isPlayer ? 'solid' : 'none'
                     }}
                     onClick={onClickCenter}>
                    {playerInThisRoom.length > 0 && <span className="dot">
                        <span className={'dotText'}>
                            {playerInThisRoom.length}
                        </span>
                    </span>}

                </div>
                <div className="div2" style={room.west ? {backgroundColor: 'rosybrown'} : {}}
                     onClick={onClickWest}></div>
                <div className="div3" style={room.north ? {backgroundColor: 'rosybrown'} : {}}
                     onClick={onClickNorth}></div>
                <div className="div4" style={room.east ? {backgroundColor: 'rosybrown'} : {}}
                     onClick={onClickEast}></div>
                <div className="div5" style={room.south ? {backgroundColor: 'rosybrown'} : {}}
                     onClick={onClickSouth}></div>
            </div>
        </>

    )
}

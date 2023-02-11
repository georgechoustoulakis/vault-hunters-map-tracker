import React from 'react';
import {Room, Session} from '../../../server/src/VaultSession'
import {ClientMessage} from '../../../server/src/ClientMessage'

interface RoomProps {
    room: Room;
    sendMessage: (clientMessage: ClientMessage) => void;
    currentSession: Session;
    token: string
    sessionId: string;
}

export function RoomComponent(props: RoomProps) {
    const {room, sendMessage, currentSession, sessionId, token} = props;


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

    const isCenter = room.x === 10 && room.y === 10;

    return (
        <>
            <div className="room-parent">
                <div className="div1" style={{backgroundColor: isCenter ? "indianred" : 'sandybrown'}}></div>
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

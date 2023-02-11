import React from 'react';
import {Room} from '../../../server/src/VaultSession'
import {ClientMessage} from '../../../server/src/ClientMessage'

interface RoomProps {
    room: Room;
    sendMessage: (clientMessage: ClientMessage) => void;
    players: string[]
    token: string
    sessionId: string;
}

export function RoomComponent(props: RoomProps) {
    const {room, sendMessage, players, sessionId, token} = props;


    const onClickWest = () => {
        sendMessage({type: 'session-update-room', token, sessionId, room: {...room, west: false}})
    }
    const onClickNorth = () => {
        sendMessage({type: 'session-update-room', token, sessionId, room: {...room, north: false}})
    }
    const onClickEast = () => {
        sendMessage({type: 'session-update-room', token, sessionId, room: {...room, east: false}})
    }
    const onClickSouth = () => {
        sendMessage({type: 'session-update-room', token, sessionId, room: {...room, south: false}})
    }

    const isCenter = room.x === 10 && room.y ===10;

    return (
        <>
            <div className="room-parent">
                <div className="div1" style={{backgroundColor: isCenter? "indianred": 'sandybrown'}}></div>
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

import React from 'react';
import {CenterDirection, Room, RoomType, SessionDetails} from '../common/Session'
import {ClientMessage} from '../common/ClientMessage'
import {PlayerLocation} from "../common/Player";


interface RoomProps {
    x: number;
    y: number;
    room: Room;
    sendMessage: (clientMessage: ClientMessage) => void;
    currentSession: SessionDetails;
    token: string;
    name: string;
    sessionId: string;
    playerLocation: PlayerLocation;
}

export function RoomComponent(props: RoomProps) {
    const {room, sendMessage, currentSession, sessionId, token, name, x, y, playerLocation} = props;

    if (room === RoomType.EMPTY) {
        // EMPTY rooms can be turned back into UNKNOWN if you make a mistake.
        const onRightClick = (event: any) => {
            event.preventDefault();
            sendMessage({type: 'session-update-room', token, sessionId, x, y, roomType: RoomType.UNKNOWN});
        }
        return (
            <>
                <div className="room-parent">
                    <div className="div1" style={{backgroundColor: '#302c34'}} onContextMenu={onRightClick}/>
                </div>
            </>
        )
    }

    const isPlayerAllowedToMoveHere = Math.abs(playerLocation.x - x) + Math.abs(playerLocation.y - y) <= 1;

    if (room.type === RoomType.UNKNOWN) {
        // Player can travel to unknown rooms to turn them into normal rooms.
        const onClick = () => {
            if (!isPlayerAllowedToMoveHere) {
                return console.log('not allowed to move here');
            }
            sendMessage({type: 'session-change-player-location', token, sessionId, player: {name, x, y}})
        }
        // Right click to turn into empty,
        const onRightClick = (event: any) => {
            event.preventDefault();
            sendMessage({type: 'session-update-room', token, sessionId, x, y, roomType: RoomType.EMPTY});
        }
        return (
            <>
                <div className="room-parent">
                    <div className="div1" style={{backgroundColor: 'slategray'}}
                         onClick={onClick}
                         onContextMenu={onRightClick}>
                        <span className="dot">
                        <span className={'dotText'} style={{color: "darkgray"}}>
                            ?
                        </span>
                    </span>
                    </div>
                    <div className="div2" style={room.east ? {backgroundColor: 'sandybrown'} : {}}/>
                    <div className="div3" style={room.north ? {backgroundColor: 'sandybrown'} : {}}/>
                    <div className="div4" style={room.west ? {backgroundColor: 'sandybrown'} : {}}/>
                    <div className="div5" style={room.south ? {backgroundColor: 'sandybrown'} : {}}/>
                </div>
            </>
        )
    }

    const playerInThisRoom = currentSession.players.filter((playerLocation) => playerLocation.x === x && playerLocation.y === y)
    const playerNames = playerInThisRoom.map((player) => player.name).join()
    const isPlayer = playerLocation.x === x && playerLocation.y === y;

    const west: boolean = room.type === RoomType.CENTER ? room.direction === CenterDirection.WEST : room.west;
    const north: boolean = room.type === RoomType.CENTER ? room.direction === CenterDirection.NORTH : room.north;
    const east: boolean = room.type === RoomType.CENTER ? room.direction === CenterDirection.EAST : room.east;
    const south: boolean = room.type === RoomType.CENTER ? room.direction === CenterDirection.SOUTH : room.south;

    const onClickCenter = () => {
        if (!isPlayerAllowedToMoveHere) {
            return console.log('not allowed to move here');
        }
        sendMessage({type: 'session-change-player-location', token, sessionId, player: {name, x, y}})
    }

    const onRightClick = (event: any) => {
        event.preventDefault();
        if (room.type === RoomType.CENTER) {
            return alert('Can\'t remove the starting room you silly goose.');
        }
        if (playerInThisRoom.length > 0) {
            return alert('There are players in this room. Can\'t remove.');
        }
        sendMessage({type: 'session-update-room', token, sessionId, x, y, roomType: RoomType.UNKNOWN});
    }

    return (
        <>
            <div className="room-parent" title={playerNames}>
                <div className="div1"
                     style={{
                         backgroundColor: room.type === RoomType.CENTER ? "indianred" : 'sandybrown',
                         borderStyle: isPlayer ? 'solid' : 'none'
                     }}
                     onClick={onClickCenter}
                     onContextMenu={onRightClick}>
                    {playerInThisRoom.length > 0 && <span className="dot">
                        <span className={'dotText'}>
                            {playerInThisRoom.length}
                        </span>
                    </span>}

                </div>
                <div className="div2" style={east ? {backgroundColor: 'sandybrown'} : {}}/>
                <div className="div3" style={north ? {backgroundColor: 'sandybrown'} : {}}/>
                <div className="div4" style={west ? {backgroundColor: 'sandybrown'} : {}}/>
                <div className="div5" style={south ? {backgroundColor: 'sandybrown'} : {}}/>
            </div>
        </>

    )
}

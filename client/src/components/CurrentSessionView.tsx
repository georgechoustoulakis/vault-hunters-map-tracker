import React from 'react';
import {SessionDetails} from '../api/Session'
import {ClientMessage} from '../api/ClientMessage'
import {RoomComponent} from "./RoomComponent";
import {TransformComponent, TransformWrapper} from 'react-zoom-pan-pinch';
import {buttonStyle} from "../App";
import {Button} from "@mui/material";

interface CurrentSessionViewProps {
    currentSession: SessionDetails;
    leaveSession: () => void;
    sendMessage: (clientMessage: ClientMessage) => void;
    token: string;
    name: string;
}

export function CurrentSessionView(props: CurrentSessionViewProps) {
    const {currentSession, leaveSession, sendMessage, token, name} = props;

    const size = currentSession.size;
    const grid = currentSession.grid;

    const playerLocation = currentSession.players.find((location) => location.name === name)!;

    return (
        <>
            <div style={{display: 'flex', justifyContent: 'center', flexDirection: 'row'}}>
                <Button
                    style={{...buttonStyle, width: 250, backgroundColor: 'indianred'}}
                    variant="contained"
                    onClick={leaveSession}>
                    Leave Vault Session
                </Button>
                <Button
                    style={{...buttonStyle, width: 250, backgroundColor: 'green'}}
                    variant="contained"
                >Add Objective marker
                </Button>
            </div>


            <div style={{width: '100%', maxHeight: 'calc(100vh-30px)'}}>

                <TransformWrapper
                    initialScale={2}
                    initialPositionX={-450}
                    initialPositionY={-500}>
                    {({zoomIn, zoomOut, resetTransform, ...rest}) => (
                        <React.Fragment>
                            <TransformComponent>
                                <table id={'room-table'} style={{aspectRatio: 1}}>
                                    <tbody>
                                    {
                                        grid.map((row, xIndex) => (
                                            <tr key={xIndex} className={'row'}>
                                                {row.map((room, yIndex) =>

                                                    <th key={yIndex}>
                                                        {
                                                            <RoomComponent
                                                                x={xIndex}
                                                                y={yIndex}
                                                                room={room}
                                                                sendMessage={sendMessage}
                                                                currentSession={currentSession}
                                                                token={token}
                                                                name={name}
                                                                sessionId={currentSession.id}
                                                                playerLocation={playerLocation}
                                                            />
                                                        }

                                                    </th>)
                                                }
                                            </tr>
                                        ))
                                    }
                                    </tbody>
                                </table>
                            </TransformComponent>
                        </React.Fragment>
                    )}
                </TransformWrapper>
            </div>

        </>


    )
}

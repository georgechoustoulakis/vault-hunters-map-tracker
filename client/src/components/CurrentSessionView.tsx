import React from 'react';
import {SessionDetails} from '../common/Session'
import {ClientMessage} from '../common/ClientMessage'
import {RoomComponent} from "./RoomComponent";

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

    return (
        <>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', justifyItems: 'center'}}>
                    <button onClick={leaveSession}
                            style={{
                                width: '150px',
                                height: '30px',
                                alignSelf: 'center',
                                backgroundColor: 'indianred'
                            }}>Leave
                        Vault Session
                    </button>
                    <button style={{
                        width: '150px',
                        height: '30px',
                        alignSelf: 'center',
                        backgroundColor: 'greenyellow'
                    }}>Add Objective marker
                    </button>
                </div>
            </div>


            <div style={{width: '100%', maxHeight: 'calc(100vh-30px)'}}>
                <table id={'room-table'} style={{aspectRatio: 1}}>
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
                                            />
                                        }

                                    </th>)
                                }
                            </tr>
                        ))
                    }
                </table>
                {/*<TransformWrapper*/}
                {/*    initialScale={2}*/}
                {/*    initialPositionX={-450}*/}
                {/*    initialPositionY={-500}*/}
                {/*    onPanningStart={disableClicking}*/}
                {/*    onPanningStop={enabledClicking}>*/}
                {/*    {({zoomIn, zoomOut, resetTransform, ...rest}) => (*/}
                {/*        <React.Fragment>*/}
                {/*            <TransformComponent>*/}
                {/*               */}
                {/*            </TransformComponent>*/}
                {/*        </React.Fragment>*/}
                {/*    )}*/}
                {/*</TransformWrapper>*/}
            </div>

        </>


    )
}

import React from 'react';
import {Room, Session} from '../../../server/src/VaultSession'
import {ClientMessage} from '../../../server/src/ClientMessage'
import {TransformComponent, TransformWrapper} from "react-zoom-pan-pinch"
import {RoomComponent} from "./RoomComponent";
import {Empty} from "./Empty";

interface CurrentSessionViewProps {
    currentSession: Session;
    leaveSession: () => void;
    sendMessage: (clientMessage: ClientMessage) => void;
    token: string;
    name: string;
}

export function CurrentSessionView(props: CurrentSessionViewProps) {
    const {currentSession, leaveSession, sendMessage, token, name} = props;

    const size = currentSession.size;
    const grid: (Room | undefined)[][] = new Array(size);
    for (let i = 0; i < size; i++) {
        grid[i] = new Array(size).fill(undefined);
    }

    for (const room of currentSession.rooms) {
        grid[room.x][room.y] = room;
    }

    console.log(grid);
    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <button onClick={leaveSession} style={{width: '150px', height: '30px', alignSelf: 'center'}}>
                Leave Vault Session
            </button>
            <TransformWrapper
                initialScale={2}
                initialPositionX={-450}
                initialPositionY={-500}>
                {({zoomIn, zoomOut, resetTransform, ...rest}) => (
                    <React.Fragment>
                        <TransformComponent>
                            <table id={'room-table'} style={{aspectRatio: 1, height: 'calc(100vh-30px)'}}>
                                {
                                    grid.map((row, xIndex) => (
                                        <tr key={xIndex} className={'row'}>
                                            {row.map((room, yIndex) =>

                                                <th key={yIndex}>
                                                    {
                                                        room !== undefined ?
                                                            <RoomComponent room={room}
                                                                           sendMessage={sendMessage}
                                                                           currentSession={currentSession}
                                                                           token={token}
                                                                           name={name}
                                                                           sessionId={currentSession.id}/> :
                                                            <Empty x={xIndex}
                                                                   y={yIndex}
                                                                   sessionId={currentSession.id}
                                                                   sendMessage={sendMessage}
                                                                   grid={grid}
                                                                   token={token}
                                                                   name={name}/>
                                                    }

                                                </th>)
                                            }
                                        </tr>
                                    ))
                                }
                            </table>
                        </TransformComponent>
                    </React.Fragment>
                )}
            </TransformWrapper>

        </div>

    )
}

import React from 'react';
import {Room, Session} from '../../../server/src/VaultSession'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"

interface CurrentSessionViewProps {
    currentSession: Session;
    leaveSession: () => void;
}

export function CurrentSessionView(props: CurrentSessionViewProps) {
    const {currentSession, leaveSession} = props;

    const size = currentSession.size;
    const grid: (Room| undefined)[][] = new Array(size);
    for (let i = 0; i < size; i++) {
        grid[i] = new Array(size).fill(undefined);
    }

    for (const room of currentSession.rooms) {
        grid[room.x][room.y] = room;
    }

    console.log(grid);
    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <button onClick={leaveSession}>Leave</button>

            <br/>
            <TransformWrapper
                initialScale={2}
                initialPositionX={-(size*50)/2}
                initialPositionY={-(size*50)/2}
            >
                {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                    <React.Fragment>
                        <div className="tools">
                            <button onClick={() => zoomIn()}>+</button>
                            <button onClick={() => zoomOut()}>-</button>
                            <button onClick={() => resetTransform()}>x</button>
                        </div>
                        <TransformComponent>
                            <table id={'room-table'}>
                                {
                                    grid.map((row, index) => (
                                        <tr key={index} className={'row'}>
                                            {row.map((room, index) =>

                                                <th key={index}>1

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

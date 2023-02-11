import React from 'react';
import {SessionInfo} from '../../../server/src/VaultSession'

interface SessionTableProps {
    sessions: SessionInfo[];
    setSession: (session: string) => void;
}

export function SessionTable(props: SessionTableProps) {
    const {sessions, setSession} = props;
    return (
        <div>
            <section id={'sessions-table'}>
                <header>
                    <div className="col">Creation time</div>
                    <div className="col">Join</div>
                    <div className="col">Players</div>
                </header>

                {sessions.map((session, index) => {
                    const setCurrentSession = () => {
                        setSession(session.id)
                    }
                    const creationDate = new Date(session.time);
                    const expireTime = new Date(creationDate.getTime() + 25 * 60000)
                    const expired = expireTime.getTime() < new Date().getTime();
                    return (
                        <div className="row" key={index}
                             style={{backgroundColor: expired ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 0, 0.3)'}}>
                            <div className="col">{new Date(session.time).toISOString()}</div>
                            <div className="col">
                                <button onClick={setCurrentSession}>Join Session</button>
                            </div>
                            <div className="col"><span>{session.players}</span></div>
                        </div>)
                })
                }
            </section>

        </div>
    )
}

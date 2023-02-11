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
                    return (
                        <div className="row" key={index}>
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

import React, {useEffect, useState} from 'react';
import {SessionInfo} from "../api/Session";
import {Button} from "@mui/material";
import {buttonStyle} from "../App";

interface SessionTableProps {
    sessions: SessionInfo[];
    setSession: (session: string) => void;
}

export function SessionTable(props: SessionTableProps) {
    const {sessions, setSession} = props;
    const [time, setTime] = useState(new Date());

    // re-render every second to update availabilities
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{width: '80%'}}>
            <section id={'sessions-table'}>
                <header>
                    <div className="col">Creation time</div>
                    <div className="col">Join</div>
                </header>

                {sessions.map((session, index) => {
                    const setCurrentSession = () => {
                        setSession(session.id)
                    }
                    const creationDate = new Date(session.time);
                    const expireTime = new Date(creationDate.getTime() + 25 * 60000)
                    const expired = expireTime.getTime() < time.getTime();
                    return (
                        <div className="row" key={index}
                             style={{backgroundColor: expired ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 0, 0.3)'}}>
                            <div className="col">{new Date(session.time).toISOString()}</div>
                            <div className="col">
                                <Button style={{...buttonStyle, width: 150}} variant="contained"
                                        onClick={setCurrentSession}>Join Session</Button>
                            </div>
                        </div>)
                })
                }
            </section>

        </div>
    )
}

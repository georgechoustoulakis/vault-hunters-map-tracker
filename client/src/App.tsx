import React, {useEffect, useState} from 'react';
import './App.css';
import useWebSocket, {ReadyState} from 'react-use-websocket';
import {ClientMessage} from '../../server/src/ClientMessage'
import {ServerMessage} from '../../server/src/ServerMessage'
import {Session, SessionInfo} from '../../server/src/VaultSession'
import {SessionTable} from "./components/SessionTable";
import {CurrentSessionView} from "./components/CurrentSessionView";

const WS_URL = 'ws://localhost:3001';

const TOKEN_KEY = 'vault-hunters-map-tracker-token-key';
const NAME_KEY = 'vault-hunters-map-tracker-name-key';
const storedToken = localStorage.getItem(TOKEN_KEY) ?? '';
const storedName = localStorage.getItem(NAME_KEY) ?? '';

function App() {
    const [name, setName] = useState<string>(storedName);
    const [token, setToken] = useState<string>(storedToken);
    const [sessions, setSessions] = useState<SessionInfo[]>([]);
    const [players, setPlayers] = useState<string[]>([]);
    const [currentSession, setCurrentSession] = useState<string | undefined>(undefined);
    const [currentSessionDetails, setCurrentSessionDetails] = useState<Session | undefined>(undefined);
    const {sendMessage, lastMessage, readyState} = useWebSocket(WS_URL);

    useEffect(() => {
        if (lastMessage !== null) {
            try {
                const json = JSON.parse(lastMessage.data);
                console.log(json);
                processServerMessage(json as ServerMessage)
            } catch (e: unknown) {
                console.log(lastMessage.data, e)
                return onError('Error parsing server response.');
            }
        }
    }, [lastMessage]);

    useEffect(() => {
        if (storedToken !== '') {
            sendClientMessage({type: 'create-player', name: storedName, token: storedToken});
        }
    }, [name]);

    const processServerMessage = (message: ServerMessage) => {
        switch (message.type) {
            case "error":
                return onError(message.message)
            case "token":
                const name = (document.getElementById('name-input')! as HTMLInputElement).value;
                const token = message.token;
                localStorage.setItem(NAME_KEY, name);
                localStorage.setItem(TOKEN_KEY, token);
                setName(name);
                setToken(token);
                break;
            case "update":
                setPlayers(message.players);
                setSessions(message.sessions);
                break;
            case "session-details":
                if (currentSession === message.id) {
                    setCurrentSessionDetails(message)
                }
        }
    }

    const sendClientMessage = (message: ClientMessage) => {
        console.log(message);
        sendMessage(JSON.stringify(message));
    }

    const onError = (error: string) => {
        alert(error);
    }

    const onSubmitName = () => {
        const newName = (document.getElementById('name-input')! as HTMLInputElement).value;
        if (newName === '') {
            return onError('Enter a valid name.')
        } else {
            sendClientMessage({type: 'create-player', name: newName, token: token});
        }
    }

    const onCreateNewSession = () => {
        sendClientMessage({type: 'create-session', token: token});
    }

    const leaveSession = () => {
        setCurrentSession(undefined);
        setCurrentSessionDetails(undefined)
    }

    const getSessionDetails = (sessionId: string) => {
        setCurrentSession(sessionId);
        sendClientMessage({type: 'session-details', token, sessionId});
    }

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];


    return (
        <div className="App">
            <header className="App-header">
                {token === '' &&
                    <div className="login-div">
                        <label>Enter your name:</label>
                        <br/>
                        <input type="text" id='name-input'></input>
                        <br/>
                        <button onClick={onSubmitName}>Enter</button>
                        <br/>

                    </div>}
                {/* Session selection */}
                {token !== '' && currentSession === undefined &&
                    <>
                        <button onClick={onCreateNewSession}>Create New Session</button>
                        <br/>
                        <SessionTable sessions={sessions} setSession={getSessionDetails}/>
                    </>

                }
                {currentSession !== undefined && currentSessionDetails !== undefined &&
                    <CurrentSessionView
                        currentSession={currentSessionDetails}
                        leaveSession={leaveSession}
                        sendMessage={sendClientMessage}
                        token={token}
                        name={name}/>
                }
            </header>
        </div>
    );
}

export default App;

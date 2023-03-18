import React, {FormEvent, useEffect, useState} from 'react';
import './App.css';
import useWebSocket, {ReadyState} from 'react-use-websocket';
import {ClientMessage} from './api/ClientMessage'
import {ServerMessage} from './api/ServerMessage'
import {CenterDirection, SessionDetails, SessionInfo} from './api/Session'
import {SessionTable} from "./components/SessionTable";
import {CurrentSessionView} from "./components/CurrentSessionView";
import {AppBar, Box, Button, InputLabel, TextField, Toolbar, Typography} from "@mui/material";


let WS_URL = document.location.origin
    .replace('http://', 'ws://')
    .replace('https://', 'wss://');

const TOKEN_KEY = 'vault-hunters-map-tracker-token-key';
const NAME_KEY = 'vault-hunters-map-tracker-name-key';
const storedToken = localStorage.getItem(TOKEN_KEY) ?? '';
const storedName = localStorage.getItem(NAME_KEY) ?? '';

export const buttonStyle: React.CSSProperties = {margin: 5, width: 100, alignSelf: 'center'};

function App() {
    const [name, setName] = useState<string>(storedName);
    const [token, setToken] = useState<string>(storedToken);
    const [sessions, setSessions] = useState<SessionInfo[]>([]);
    const [currentSession, setCurrentSession] = useState<string | undefined>(undefined);
    const [currentSessionDetails, setCurrentSessionDetails] = useState<SessionDetails | undefined>(undefined);
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
                const newName = (document.getElementById('name-input')! as HTMLInputElement).value;
                const newToken = message.token;
                localStorage.setItem(NAME_KEY, newName);
                localStorage.setItem(TOKEN_KEY, newToken);
                setName(newName);
                setToken(newToken);
                break;
            case "update":
                setSessions(message.sessions);
                break;
            case "session-details":
                if (currentSession === message.id) {
                    setCurrentSessionDetails(message);
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

    const onSubmitName = (e: FormEvent) => {
        e.preventDefault();
        const newName = (document.getElementById('name-input')! as HTMLInputElement).value;
        if (newName === '') {
            return onError('Enter a valid name.')
        } else {
            sendClientMessage({type: 'create-player', name: newName, token: token});
        }
    }

    const onCreateNewSessionNorth = () => {
        sendClientMessage({type: 'create-session', token: token, direction: CenterDirection.NORTH});
    }

    const onCreateNewSessionWest = () => {
        sendClientMessage({type: 'create-session', token: token, direction: CenterDirection.EAST}); // TODO: east/west is flipped
    }
    const onCreateNewSessionSouth = () => {
        sendClientMessage({type: 'create-session', token: token, direction: CenterDirection.SOUTH});
    }
    const onCreateNewSessionEast = () => {
        sendClientMessage({type: 'create-session', token: token, direction: CenterDirection.WEST}); // TODO: east/west is flipped
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
        [ReadyState.OPEN]: 'Connected',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];


    return (
        <div className="App">
            <header className="App-header">
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    alignItems: 'center',
                    justifyItems: 'center'
                }}>
                    <AppBar position="static">
                        <Toolbar>
                            <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                                Connection status: {connectionStatus}
                            </Typography>
                            <Button color="inherit">User: {name}</Button>
                        </Toolbar>
                    </AppBar>
                    <div style={{width: '90%', marginTop: 20}}>
                        {token === '' &&
                            <div className="login-div">
                                <form onSubmit={onSubmitName}>
                                    <InputLabel style={{color: 'white'}} htmlFor="name-input">Enter your
                                        name:</InputLabel>
                                    <TextField
                                        required
                                        id="name-input"
                                        label="Required"
                                        color={'primary'}
                                        variant="filled"
                                        style={{marginTop: 10,}}
                                    />
                                </form>

                            </div>}
                        {/* Session selection */}
                        {token !== '' && currentSession === undefined &&
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                <div>
                                    Create new session:
                                </div>
                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                    <Button style={buttonStyle} variant="contained"
                                            onClick={onCreateNewSessionNorth}>north</Button>
                                    <div style={{display: 'flex', justifyContent: 'center'}}>
                                        <Button style={buttonStyle} variant="contained"
                                                onClick={onCreateNewSessionWest}>west</Button>
                                        <Button style={buttonStyle} variant="contained"
                                                onClick={onCreateNewSessionEast}>east</Button>
                                    </div>
                                    <Button style={buttonStyle} variant="contained"
                                            onClick={onCreateNewSessionSouth}>south</Button>
                                </div>
                                <br/>
                                <SessionTable sessions={sessions} setSession={getSessionDetails}/>
                            </div>

                        }
                        {currentSession !== undefined && currentSessionDetails !== undefined &&
                            <CurrentSessionView
                                currentSession={currentSessionDetails}
                                leaveSession={leaveSession}
                                sendMessage={sendClientMessage}
                                token={token}
                                name={name}/>
                        }
                    </div>

                </Box>

            </header>
        </div>
    );
}

export default App;

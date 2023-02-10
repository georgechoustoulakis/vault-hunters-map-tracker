import React, {useEffect, useState} from 'react';
import './App.css';
import useWebSocket, {ReadyState} from 'react-use-websocket';
import {ClientCreatePlayer} from '../../server/src/ClientMessage'
import {ServerMessage} from '../../server/src/ServerMessage'

const WS_URL = 'ws://localhost:3001';

const TOKEN_KEY = 'vault-hunters-map-tracker-token-key';
const NAME_KEY = 'vault-hunters-map-tracker-name-key';
const storedToken = localStorage.getItem(TOKEN_KEY) ?? '';
const storedName = localStorage.getItem(NAME_KEY) ?? '';

function App() {
    const [name, setName] = useState<string>(storedName);
    const [token, setToken] = useState<string>(storedToken);
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
        }
    }

    const sendClientMessage = (message: ClientCreatePlayer) => {
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
                    <div className="top-header">
                        <label>Enter your name:</label>
                        <br/>
                        <input type="text" id='name-input'></input>
                        <br/>
                        <button className="header-button" onClick={onSubmitName}>Enter</button>
                        <br/>

                    </div>}
                {token !== '' &&
                    <span>Successfully authenticated.</span>}
                <br/>
                <br/>
                <br/>
                <span>The WebSocket is currently {connectionStatus}</span>
            </header>
        </div>
    );
}

export default App;

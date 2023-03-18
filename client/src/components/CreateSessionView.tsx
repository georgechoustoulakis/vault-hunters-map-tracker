import {Button} from "@mui/material";
import React from "react";
import {buttonStyle} from "../App";
import {ClientMessage} from "../api/ClientMessage";
import {CenterDirection} from "../api/Session";

interface CreateSessionViewProps {
    sendMessage: (clientMessage: ClientMessage) => void;
    token: string;
}

export function CreateSessionView(props: CreateSessionViewProps) {
    const {sendMessage, token} = props;

    const onCreateNewSessionNorth = () => {
        sendMessage({type: 'create-session', token: token, direction: CenterDirection.NORTH});
    }

    const onCreateNewSessionWest = () => {
        sendMessage({type: 'create-session', token: token, direction: CenterDirection.EAST}); // TODO: east/west is flipped
    }

    const onCreateNewSessionSouth = () => {
        sendMessage({type: 'create-session', token: token, direction: CenterDirection.SOUTH});
    }

    const onCreateNewSessionEast = () => {
        sendMessage({type: 'create-session', token: token, direction: CenterDirection.WEST}); // TODO: east/west is flipped
    }

    return (
        <div>
            <div>
                Create new session:
            </div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <Button style={buttonStyle} variant="contained" onClick={onCreateNewSessionNorth}>north</Button>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <Button style={buttonStyle} variant="contained" onClick={onCreateNewSessionWest}>west</Button>
                    <Button style={buttonStyle} variant="contained" onClick={onCreateNewSessionEast}>east</Button>
                </div>
                <Button style={buttonStyle} variant="contained" onClick={onCreateNewSessionSouth}>south</Button>
            </div>
        </div>
    )
}

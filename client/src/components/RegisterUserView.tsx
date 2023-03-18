import {ClientMessage} from "../api/ClientMessage";
import {InputLabel, TextField} from "@mui/material";
import React, {FormEvent} from "react";

interface RegisterUserViewProps {
    sendMessage: (clientMessage: ClientMessage) => void;
    onError: (error: string) => void;
    token: string;
}

export function RegisterUserView(props: RegisterUserViewProps) {
    const {sendMessage, onError, token} = props;
    const onSubmitName = (e: FormEvent) => {
        e.preventDefault();
        const newName = (document.getElementById('name-input')! as HTMLInputElement).value;
        if (newName === '') {
            return onError('Enter a valid name.')
        } else {
            sendMessage({type: 'create-player', name: newName, token: token});
        }
    }

    return (
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
        </div>
    );
}


import React, {useEffect, useState} from 'react';
import {SessionInfo} from "../api/Session";
import {
    Button,
    Paper,
    styled,
    Table,
    TableBody,
    TableCell,
    tableCellClasses,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import {buttonStyle} from "../App";

interface SessionTableProps {
    sessions: SessionInfo[];
    setSession: (session: string) => void;
}

const StyledTableCell = styled(TableCell)(({theme}) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        backgroundColor: 'lightgray',
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({theme}) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

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
        <div style={{justifySelf: 'center', width: '100%', maxWidth: 600, marginTop: 10}}>
            <TableContainer component={Paper}>
                <Table aria-label="customized table">
                    <TableHead>
                        <StyledTableRow>
                            <StyledTableCell>Available Sessions</StyledTableCell>
                            <StyledTableCell align="right"> </StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {sessions.map((session, index) => {
                            const setCurrentSession = () => {
                                setSession(session.id)
                            }
                            const creationDate = new Date(session.time);
                            const expireTime = new Date(creationDate.getTime() + 25 * 60000)
                            const expired = expireTime.getTime() < time.getTime();
                            return (
                                <StyledTableRow key={index}>
                                    <StyledTableCell component="th" scope="row">
                                        {creationDate.toLocaleString()}
                                    </StyledTableCell>
                                    <StyledTableCell align="right">
                                        <Button
                                            style={{
                                                ...buttonStyle,
                                                width: 150,
                                                backgroundColor: expired ? 'gray' : undefined,
                                                color: expired ? 'black' : undefined
                                            }}
                                            variant="contained"
                                            onClick={setCurrentSession}>
                                            Join Session
                                        </Button>
                                    </StyledTableCell>
                                </StyledTableRow>)
                        })
                        }
                    </TableBody>
                </Table>
            </TableContainer>

        </div>
    )
}

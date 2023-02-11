import {ClientMessage} from "../../../server/src/ClientMessage";
import {Room} from "../../../server/src/VaultSession";

interface EmptyProps {
    x: number;
    y: number;
    grid: (Room | undefined)[][];
    sessionId: string;
    sendMessage: (clientMessage: ClientMessage) => void;
    token: string;
}

export function Empty(props: EmptyProps) {
    const {x, y, grid, sendMessage, sessionId, token} = props;
    const size = grid.length;
    const clickable = (((x + 1) < size) && (grid[x + 1][y]?.north)) ||
        ((y + 1) < size && (grid[x][y + 1]?.west)) ||
        ((x - 1) >= 0 && (grid[x - 1][y]?.south)) ||
        ((y - 1) >= 0 && (grid[x][y - 1]?.east))

    const onClick = () => {
        sendMessage({type: 'session-add-room', sessionId, x, y, token})
    }

    return (
        <>
            <div className="room-parent">
                <div className="div1" style={{backgroundColor: clickable ? 'gray' : '#282c34'}} onClick={onClick}></div>
                <div className="div2"></div>
                <div className="div3"></div>
                <div className="div4"></div>
                <div className="div5"></div>
            </div>

        </>

    )
}

import {GlobalState, GlobalStateUpdater, PlayerColor, playerColorToNumber} from "./State";
import {COLOR_LIST} from "./constants";

export class WebSocketController {
    private readonly webSocket: WebSocket;
    private readonly updateGlobalState: GlobalStateUpdater;

    constructor(webSocketURL: string, updateGlobalState: GlobalStateUpdater, onOpenCallback?: () => void) {
        this.webSocket = new WebSocket(webSocketURL);
        this.updateGlobalState = updateGlobalState;
        this.webSocket.onopen = () => {
            if (onOpenCallback !== undefined) {
                onOpenCallback();
            }
        };
        this.webSocket.onmessage = (e) => this.handleMessage.bind(this)(e);
    }

    send(object: any) {
        this.webSocket.send(JSON.stringify(object));
    }

    startAIGame(playerColor: PlayerColor) {
        this.send({
            message: "startAIGame",
            color: playerColorToNumber(playerColor)
        });
    }

    attemptMove(pieceId: number, orientation: number, position: [number, number]) {
        this.send({
            message: "attemptMove",
            pieceId: pieceId,
            orientation: orientation,
            position: position
        });
    }

    handleMessage(event: MessageEvent) {
        const object = JSON.parse(event.data);
        console.log(event.data);
        switch (object.message) {
            case "opponentMove":
                this.handleOpponentMove(object);
                break;
            case "playerMoveResponse":
                this.handlePlayerMoveResponse(object);
                break;
        }
    }

    handleOpponentMove(move: OpponentMove) {
        this.updateGlobalState((prevGlobalState: GlobalState) => ({
            screen: prevGlobalState.screen,
            gameState: {
                webSocketController: prevGlobalState.gameState!.webSocketController,
                board: translateBoard(move.board),
                // todo: switch turn to number?
                turn: COLOR_LIST[(playerColorToNumber(prevGlobalState.gameState!.turn) + move.turnIncrement) % 2],
                color: prevGlobalState.gameState!.color,
                piecesRemaining: prevGlobalState.gameState!.piecesRemaining,
                selectedPiece: prevGlobalState.gameState!.selectedPiece,
                winners: move.winners
            }
        }));
    }

    handlePlayerMoveResponse(response: PlayerMoveResponse) {
        if (response.isMoveValid) {
            this.updateGlobalState((prevGlobalState: GlobalState) => ({
                screen: prevGlobalState.screen,
                gameState: {
                    webSocketController: prevGlobalState.gameState!.webSocketController,
                    board: translateBoard(response.board),
                    // todo: factor out common code
                    turn: COLOR_LIST[(playerColorToNumber(prevGlobalState.gameState!.turn) + response.turnIncrement) % 2],
                    color: prevGlobalState.gameState!.color,
                    piecesRemaining: prevGlobalState.gameState!.piecesRemaining.filter(orientedPiece => orientedPiece.pieceId !== response.pieceId),
                    selectedPiece: prevGlobalState.gameState!.selectedPiece === response.pieceId ? null : prevGlobalState.gameState!.selectedPiece,
                    winners: response.winners
                }
            }));
        }
        // TODO: tell you if you made an invalid move - for now we just do nothing
    }
}

interface OpponentMove {
    message: string;
    pieceId: number;
    board: number[][];
    winners: number[];
    turnIncrement: number;
}

interface PlayerMoveResponse {
    message: string;
    isMoveValid: boolean;
    pieceId: number;
    board: number[][];
    winners: number[];
    turnIncrement: number;
}

function translateBoard(board: number[][]) {
    const newBoard = [];
    for (const row of board) {
        const newRow = [];
        for (const cell of row) {
            switch (cell) {
                case -1:
                    newRow.push(null);
                    break;
                case 0:
                    newRow.push(PlayerColor.Orange);
                    break;
                case 1:
                    newRow.push(PlayerColor.Blue);
                    break;
            }
        }
        newBoard.push(newRow);
    }
    return newBoard;
}

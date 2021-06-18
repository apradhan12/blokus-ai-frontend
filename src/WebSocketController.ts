import {GlobalState, GlobalStateUpdater, PlayerColor} from "./State";

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
        this.webSocket.onmessage = this.handleMessage;
    }

    send(object: any) {
        this.webSocket.send(JSON.stringify(object));
    }

    startAIGame(playerColor: PlayerColor) {
        this.send({
            message: "startAIGame",
            color: playerColor
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
                turn: prevGlobalState.gameState!.turn === PlayerColor.Orange ? PlayerColor.Blue : PlayerColor.Orange,
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
                    turn: prevGlobalState.gameState!.turn === PlayerColor.Orange ? PlayerColor.Blue : PlayerColor.Orange,
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
    pieceId: number;
    board: number[][];
    winners: number[];
}

interface PlayerMoveResponse {
    isMoveValid: boolean;
    pieceId: number;
    board: number[][];
    winners: number[];
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

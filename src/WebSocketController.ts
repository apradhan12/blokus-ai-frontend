import {PlayerColor} from "./State";

export class WebSocketController {
    private webSocket: WebSocket;

    constructor(webSocketURL: string, onOpenCallback?: () => void) {
        this.webSocket = new WebSocket(webSocketURL);
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
                break;
            case "playerMoveResponse":
                break;
        }
    }
}

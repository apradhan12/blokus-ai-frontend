import React, {ChangeEvent, useState} from 'react';
import {Button, Col, Container, Row} from 'react-bootstrap';
import './App.css';
import {GameView} from "./GameView";
import {GlobalState, NullablePlayerColor, PlayerColor, Screen, MutableStateContext} from "./State";
import {BOARD_HEIGHT, BOARD_WIDTH, WEBSOCKET_URL} from "./constants";
import {allOrientedPieces, initialScore} from "./Pieces";
import {WebSocketController} from "./WebSocketController";

function getInitialBoard() {
    const board: NullablePlayerColor[][] = [];
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        const row = [];
        for (let j = 0; j < BOARD_WIDTH; j++) {
            row.push(null);
        }
        board.push(row);
    }
    return board;
}

function App() {
    const [globalState, setGlobalState] = useState<GlobalState>({
        screen: Screen.Lobby,
        gameState: null
    });

    const mutableState = {
        globalState: globalState,
        updateGlobalState: (globalStateUpdater: (state: GlobalState) => GlobalState) =>
            setGlobalState((prevGlobalState: GlobalState) => globalStateUpdater(prevGlobalState))
    };

    const switchToSelectColor = () => setGlobalState((prevGlobalState: GlobalState) => ({
        screen: Screen.SelectColor,
        gameState: prevGlobalState.gameState
    }));

    return (
        <MutableStateContext.Provider value={mutableState}>
            <Container>
                <Row>
                    <Col>
                        <h1>Blokus</h1>
                        {globalState.screen === Screen.Lobby && <Button onClick={switchToSelectColor}>Play versus AI</Button>}
                        {globalState.screen === Screen.SelectColor && <ColorChooser/>}
                    </Col>
                </Row>
                { globalState.screen === Screen.InGame && <GameView/> }
            </Container>
        </MutableStateContext.Provider>
    );
}

function ColorChooser() {
    const [serverAddress, setServerAddress] = useState(WEBSOCKET_URL);

    function selectColor(color: PlayerColor, updateGlobalState: (globalStateUpdater: (globalState: GlobalState) => GlobalState) => void) {
        const webSocketController = new WebSocketController(serverAddress, updateGlobalState, () => {
            // initializes the game state
            updateGlobalState((_: GlobalState) => ({
                screen: Screen.InGame,
                gameState: {
                    webSocketController: webSocketController,
                    board: getInitialBoard(),
                    turn: PlayerColor.Orange,
                    scores: [initialScore, initialScore],
                    color: color,
                    piecesRemaining: allOrientedPieces,
                    opponentPiecesRemaining: allOrientedPieces,
                    selectedPiece: null,
                    winners: null
                }
            }));
            webSocketController.startAIGame(color);
        });
    }

    const updateServerAddress = (event: ChangeEvent<HTMLInputElement>) => setServerAddress(event.target.value)

    return (
        <MutableStateContext.Consumer>
            {({updateGlobalState}) => (
                <div>
                    <div>Input the URL of the server:</div>
                    <input type="text" value={serverAddress} onChange={updateServerAddress} />
                    <div>Which color do you want to play as?</div>
                    <Button style={{backgroundColor: "orange"}} className="mr-2" onClick={() => selectColor(PlayerColor.Orange, updateGlobalState)}>Orange (plays first)</Button>
                    <Button style={{backgroundColor: "blue"}} onClick={() => selectColor(PlayerColor.Blue, updateGlobalState)}>Blue (plays second)</Button>
                </div>
            )}
        </MutableStateContext.Consumer>
    );
}

export default App;

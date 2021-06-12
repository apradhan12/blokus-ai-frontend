import React, {useState} from 'react';
import {Button, Col, Container, Row} from 'react-bootstrap';
import './App.css';
import {GameView} from "./GameView";
import {GlobalState, NullablePlayerColor, PlayerColor, Screen, MutableStateContext} from "./State";
import {BOARD_HEIGHT, BOARD_WIDTH} from "./constants";
import {allPieces} from "./Pieces";

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
    function selectColor(color: PlayerColor, updateGlobalState: (globalStateUpdater: (globalState: GlobalState) => GlobalState) => void) {
        // initializes the game state
        updateGlobalState((_: GlobalState) => ({
            screen: Screen.InGame,
            gameState: {
                board: getInitialBoard(),
                turn: PlayerColor.Orange,
                color: color,
                piecesRemaining: Object.entries(allPieces).map(([i, ]) => ({pieceId: parseInt(i), orientation: 0})),
                selectedPiece: null,
                winners: null
            }
        }));
    }

    return (
        <MutableStateContext.Consumer>
            {({updateGlobalState}) => (
                <div>
                    <div>Which color do you want to play as?</div>
                    <Button style={{backgroundColor: "orange"}} className="mr-2" onClick={() => selectColor(PlayerColor.Orange, updateGlobalState)}>Orange (plays first)</Button>
                    <Button style={{backgroundColor: "blue"}} onClick={() => selectColor(PlayerColor.Blue, updateGlobalState)}>Blue (plays second)</Button>
                </div>
            )}
        </MutableStateContext.Consumer>
    );
}

export default App;

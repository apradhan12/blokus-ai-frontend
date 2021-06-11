import React, {useState} from 'react';
import {Button, Col, Container, Row} from 'react-bootstrap';
import './App.css';
import {Canvas} from "./Canvas";
import {NullableGameState, NullablePlayerColor, PlayerColor} from "./GameState";

const BOARD_WIDTH = 14;
const BOARD_HEIGHT = 14;
const STARTING_POINT_LOCATIONS = [[4, 4], [9, 9]];

const BOARD_PADDING_PX = 0; // padding
const CELL_WIDTH_PX = 40;
const OFFSET_PX = 0.5;
const CELL_PADDING_PX = 2;

const GameStateContext = React.createContext<NullableGameState>(null);

function getInitialBoard() {
    const board: NullablePlayerColor[][] = [];
    for (let i = 0; i < BOARD_HEIGHT; i++) {
        const row = [];
        for (let j = 0; j < BOARD_WIDTH; j++) {
            row.push(null);
        }
        board.push(row);
    }
    board[0][1] = PlayerColor.Orange;
    board[0][2] = PlayerColor.Orange;
    return board;
}

/**
 * Returns the [x, y] coordinates of the top-left corner of a cell in pixels.
 */
function cellsToPixels(row: number, col: number): [number, number] {
    return [OFFSET_PX + col * CELL_WIDTH_PX + BOARD_PADDING_PX, OFFSET_PX + row * CELL_WIDTH_PX + BOARD_PADDING_PX];
}

function drawSquare(ctx: CanvasRenderingContext2D, row: number, col: number, color: PlayerColor) {
    ctx.beginPath();
    switch (color) {
        case PlayerColor.Orange:
            ctx.fillStyle = "orange";
            break;
        case PlayerColor.Blue:
            ctx.fillStyle = "blue";
            break;
    }
    const topLeft = cellsToPixels(row, col);
    ctx.rect(topLeft[0], topLeft[1], CELL_WIDTH_PX, CELL_WIDTH_PX);
    ctx.fill();
}

function App() {
    const [gameState, setGameState] = useState<NullableGameState>(null);

    const initializeGameState = () => {
        setGameState({
            board: getInitialBoard(),
            turn: PlayerColor.Orange,
            piecesRemaining: [],
            currentPieceOrientations: [],
            selectedPiece: null,
            winners: null
        });
    };

    const draw = (ctx: CanvasRenderingContext2D, frameCount: number) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        for (let row = 0; row < BOARD_HEIGHT; row++) {
            for (let col = 0; col < BOARD_WIDTH; col++) {
                const color = gameState!.board[row][col];
                if (color === PlayerColor.Orange || color === PlayerColor.Blue) {
                    drawSquare(ctx, row, col, color);
                }
            }
        }

        ctx.beginPath();
        for (let x = 0; x <= BOARD_WIDTH * CELL_WIDTH_PX; x += CELL_WIDTH_PX) {
            ctx.moveTo(OFFSET_PX + x + BOARD_PADDING_PX, BOARD_PADDING_PX);
            ctx.lineTo(OFFSET_PX + x + BOARD_PADDING_PX, BOARD_HEIGHT * CELL_WIDTH_PX + BOARD_PADDING_PX);
        }

        for (let x = 0; x <= BOARD_HEIGHT * CELL_WIDTH_PX; x += CELL_WIDTH_PX) {
            ctx.moveTo(BOARD_PADDING_PX, OFFSET_PX + x + BOARD_PADDING_PX);
            ctx.lineTo(BOARD_WIDTH * CELL_WIDTH_PX + BOARD_PADDING_PX, OFFSET_PX + x + BOARD_PADDING_PX);
        }
        ctx.strokeStyle = "black";
        ctx.stroke();
    };

    return (
        <GameStateContext.Provider value={gameState}>
            <Container>
                <Row>
                    <Col>
                        <h1>Blokus</h1>
                        { gameState ? <Canvas draw={draw}/> : <Button onClick={initializeGameState}>Play versus AI</Button>}
                    </Col>
                </Row>
            </Container>
        </GameStateContext.Provider>
    );
}

export default App;

import React, {createRef, useContext, useEffect, useRef, useState} from "react";
import {GlobalState, MutableStateContext, OrientedPiece, PlayerColor, playerColorToNumber} from "./State";
import {
    BOARD_HEIGHT,
    BOARD_PADDING_PX,
    BOARD_WIDTH,
    CELL_WIDTH_PX,
    OFFSET_PX,
    STARTING_POINT_LOCATIONS
} from "./constants";
import {allPieces, applyOrientation} from "./Pieces";
import {Card, Col, Row} from "react-bootstrap";

const CANVAS_BORDER_WIDTH_PX = 1;
const TILE_CANVAS_WIDTH_PX = 100 - CANVAS_BORDER_WIDTH_PX * 2;
const PIECE_TILE_WIDTH_PX = 15;

function getSelectedPieceOrientation(globalState: GlobalState) {
    const selectedOrientedPiece = globalState.gameState!.piecesRemaining.find((piece: OrientedPiece) => piece.pieceId === globalState.gameState!.selectedPiece);
    return selectedOrientedPiece!.orientation;
}

/**
 * Returns the [x, y] coordinates of the top-left corner of a cell in pixels.
 */
function cellsToPixels(row: number, col: number): [number, number] {
    return [OFFSET_PX + col * CELL_WIDTH_PX + BOARD_PADDING_PX, OFFSET_PX + row * CELL_WIDTH_PX + BOARD_PADDING_PX];
}

function pixelsToCells(x: number, y: number): [number, number] {
    return [Math.round((y - 0.5 * CELL_WIDTH_PX) / CELL_WIDTH_PX), Math.round((x - 0.5 * CELL_WIDTH_PX) / CELL_WIDTH_PX)];
}

function draw(globalState: GlobalState, ctx: CanvasRenderingContext2D, mousePosition: [number, number] | null) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (const [row, col] of STARTING_POINT_LOCATIONS) {
        ctx.beginPath();
        const [x, y] = cellsToPixels(row + 0.5, col + 0.5);
        ctx.arc(x, y, CELL_WIDTH_PX * 0.15, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#cccccc"
        ctx.fill();
    }

    // print board
    // console.log(globalState.gameState!.board.map(row => row.map(cell => {
    //     switch (cell) {
    //         case null:
    //             return "_";
    //         case PlayerColor.Orange:
    //             return "O";
    //         case PlayerColor.Blue:
    //             return "B";
    //     }
    //     throw new Error();
    // }).join("")).join("\n"));

    // console.log(globalState.gameState!.piecesRemaining);

    // draw placed tiles
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            const color = globalState.gameState!.board[row][col];
            if (color === PlayerColor.Orange || color === PlayerColor.Blue) {
                drawSquare(ctx, row, col, color);
            }
        }
    }

    // draw selected tile
    if (mousePosition !== null && globalState.gameState!.selectedPiece !== null) {
        const centerPosition = pixelsToCells(mousePosition[0], mousePosition[1]);

        drawPiece(allPieces[globalState.gameState!.selectedPiece], getSelectedPieceOrientation(globalState), ctx,
            globalState.gameState!.color, cellsToPixels, CELL_WIDTH_PX, centerPosition, true);
    }

    // draw grid
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

function pieceTilesToPixels(row: number, col: number): [number, number] {
    return [(col - 0.5) * PIECE_TILE_WIDTH_PX + TILE_CANVAS_WIDTH_PX / 2, (row - 0.5) * PIECE_TILE_WIDTH_PX + TILE_CANVAS_WIDTH_PX / 2];
}

function mouseEventToCoords(e: React.MouseEvent<HTMLElement>): [number, number] {
    const target = e.target! as HTMLElement;
    const rect = target.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
}

export function GameView() {

    const canvasRef: React.MutableRefObject<HTMLCanvasElement | null> = useRef(null);

    const { globalState } = useContext(MutableStateContext);

    const [mousePosition, setMousePosition] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (canvasRef.current !== null) {
            const context = canvasRef.current.getContext('2d');
            if (context !== null) {
                draw(globalState, context, mousePosition);
            }
        }
    }, [globalState, mousePosition]);

    const updateMousePosition: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
        setMousePosition(mouseEventToCoords(e));
    };

    const clearMousePosition: React.MouseEventHandler<HTMLCanvasElement> = () => {
        setMousePosition(null);
    };

    const attemptMove: React.MouseEventHandler<HTMLCanvasElement> = () => {
        const gameState = globalState.gameState!;
        if (gameState.selectedPiece !== null && mousePosition !== null) {
            gameState.webSocketController.attemptMove(gameState.selectedPiece, getSelectedPieceOrientation(globalState), pixelsToCells(mousePosition[0], mousePosition[1]));
        }
    };

    const getWinnerDisplay = (winners: number[]) => {
        if (winners.includes(playerColorToNumber(globalState.gameState!.color))) {
            return (winners.length > 1) ? "The game was a tie." : "You won!";
        }
        return "You lost.";
    };

    return (
        <Row>
            <Col>
                You are playing as {globalState.gameState!.color}.<br/>
                {globalState.gameState!.winners !== null && globalState.gameState!.winners.length > 0 ? getWinnerDisplay(globalState.gameState!.winners) :
                    (globalState.gameState!.color === globalState.gameState!.turn ?
                            <span>It's your turn. Select a piece from those shown on the right.</span> :
                            <span>It's {globalState.gameState!.turn}'s turn. Please wait for them to make a move.</span>
                    )
                }
                <br/>
                <canvas ref={canvasRef} width={CELL_WIDTH_PX * BOARD_WIDTH + 1} height={CELL_WIDTH_PX * BOARD_HEIGHT + 1}
                        onMouseMove={updateMousePosition} onMouseOut={clearMousePosition}
                        onClick={attemptMove}
                />
            </Col>
            {
                globalState.gameState!.turn === globalState.gameState!.color && <Col><PieceSelector/></Col>
            }
        </Row>
    );
}

function playerColorToRGBA(playerColor: PlayerColor, alpha = false) {
    switch (playerColor) {
        case PlayerColor.Orange:
            return alpha ? "rgba(255, 195, 0, 0.5)" : "rgb(255, 195, 0)";
        case PlayerColor.Blue:
            return alpha ? "rgba(0, 0, 255, 0.5)" : "rgb(0, 0, 255)";
    }
}

function drawPiece(piece: [number, number][], orientation: number, ctx: CanvasRenderingContext2D, color: PlayerColor,
                   tilesToPixels: (row: number, col: number) => [number, number], tileWidth: number, centerPosition = [0, 0], alpha = false) {
    // draw center tile
    let topLeft = tilesToPixels(centerPosition[0], centerPosition[1]);
    ctx.beginPath();
    ctx.rect(topLeft[0], topLeft[1], tileWidth, tileWidth);
    ctx.fillStyle = playerColorToRGBA(color, alpha);
    ctx.fill();
    ctx.stroke();

    // draw other tiles
    for (const tile of piece) {
        const orientedCoords = applyOrientation(tile[0], tile[1], orientation);
        topLeft = tilesToPixels(orientedCoords[0] + centerPosition[0], orientedCoords[1] + centerPosition[1]);
        ctx.beginPath();
        ctx.rect(topLeft[0], topLeft[1], tileWidth, tileWidth);
        ctx.fill();
        ctx.stroke();
    }
}

function mod(n: number, m: number) {
    return ((n % m) + m) % m;
}

function flip(orientation: number, flipPairs: [number, number][]) {
    const matchingRow = flipPairs.find((row: [number, number]) => row.includes(orientation))!;
    return orientation === matchingRow[0] ? matchingRow[1] : matchingRow[0];
}

function horizontalFlip(orientation: number) {
    const horizontalFlipPairs: [number, number][] = [[0, 4],
        [1, 7],
        [2, 6],
        [3, 5]];
    return flip(orientation, horizontalFlipPairs);
}

function verticalFlip(orientation: number) {
    const verticalFlipPairs: [number, number][] = [[0, 6],
        [1, 5],
        [2, 4],
        [3, 7]];
    return flip(orientation, verticalFlipPairs);
}

function PieceSelector() {
    const pieceCanvasRefs: React.MutableRefObject<React.MutableRefObject<HTMLCanvasElement>[]> = React.useRef([]);
    pieceCanvasRefs.current = Object.entries(allPieces).map(([i, ]) => pieceCanvasRefs.current[parseInt(i)] ?? createRef());
    
    const { globalState, updateGlobalState } = useContext(MutableStateContext);

    useEffect(() => {
        globalState.gameState!.piecesRemaining.forEach(({pieceId, orientation}) => {
            const canvas = pieceCanvasRefs.current[pieceId].current;
            const context = canvas.getContext('2d');
            let animationFrameId: number | null = null;

            const render = () => {
                // draw piece
                context!.clearRect(0, 0, context!.canvas.width, context!.canvas.height);
                drawPiece(allPieces[pieceId], orientation, context!, globalState.gameState!.color, pieceTilesToPixels, PIECE_TILE_WIDTH_PX);

                animationFrameId = window.requestAnimationFrame(render);
            }
            render();

            return () => {
                window.cancelAnimationFrame(animationFrameId!);
            }
        });
    }, [globalState.gameState]);

    const setSelectedPiece = (pieceIndex: number) => () => updateGlobalState((globalState: GlobalState) => ({
        screen: globalState.screen,
        gameState: {
            webSocketController: globalState.gameState!.webSocketController,
            board: globalState.gameState!.board,
            turn: globalState.gameState!.turn,
            color: globalState.gameState!.color,
            piecesRemaining: globalState.gameState!.piecesRemaining,
            selectedPiece: pieceIndex,
            winners: globalState.gameState!.winners
        }
    }));

    const updatePieceOrientation = (pieceIndex: number, update: (prevOrientation: number) => number) => () => updateGlobalState((globalState: GlobalState) => ({
        screen: globalState.screen,
        gameState: {
            webSocketController: globalState.gameState!.webSocketController,
            board: globalState.gameState!.board,
            turn: globalState.gameState!.turn,
            color: globalState.gameState!.color,
            piecesRemaining: globalState.gameState!.piecesRemaining.map(orientedPiece => orientedPiece.pieceId === pieceIndex ? {
                pieceId: pieceIndex,
                orientation: update(orientedPiece.orientation)
            } : orientedPiece),
            selectedPiece: globalState.gameState!.selectedPiece,
            winners: globalState.gameState!.winners
        }
    }));

    return (
        <div style={{float: "left"}}>
            {
                globalState.gameState!.piecesRemaining.map(({pieceId}) => (
                    <Card style={{position: "relative", float: "left", cursor: "pointer"}} className="m-1" key={pieceId}>
                        <div>
                            <button className="small" onClick={updatePieceOrientation(pieceId, horizontalFlip)}>↔</button>
                            <button className="small" onClick={updatePieceOrientation(pieceId, verticalFlip)}>↕</button>
                            <button className="small" onClick={updatePieceOrientation(pieceId, (prevOrientation: number) => {
                                if (prevOrientation < 4) {
                                    return mod((prevOrientation - 1), 4);
                                }
                                return mod((prevOrientation - 5), 4) + 4;
                            })}>↻</button>
                            <button className="small" onClick={updatePieceOrientation(pieceId, (prevOrientation: number) => {
                                if (prevOrientation < 4) {
                                    return mod((prevOrientation + 1), 4);
                                }
                                return mod((prevOrientation - 3), 4) + 4;
                            })}>↺</button>
                        </div>
                        <canvas className={globalState.gameState!.selectedPiece === pieceId ? "selectedPieceCard" : "pieceCard"}
                                onClick={setSelectedPiece(pieceId)}
                                ref={pieceCanvasRefs.current[pieceId]}
                                width={TILE_CANVAS_WIDTH_PX} height={TILE_CANVAS_WIDTH_PX}/>
                    </Card>
                ))
            }
        </div>
    );
}

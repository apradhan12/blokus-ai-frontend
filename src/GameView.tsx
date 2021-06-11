import React, {createRef, useContext, useEffect, useRef} from "react";
import {GlobalState, MutableStateContext, PlayerColor} from "./State";
import {BOARD_HEIGHT, BOARD_PADDING_PX, BOARD_WIDTH, CELL_WIDTH_PX, OFFSET_PX} from "./constants";
import {allPieces} from "./Pieces";
import {Card, Col, Row} from "react-bootstrap";

function draw(globalState: GlobalState, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            const color = globalState.gameState!.board[row][col];
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

/**
 * Returns the [x, y] coordinates of the top-left corner of a cell in pixels.
 */
function cellsToPixels(row: number, col: number): [number, number] {
    return [OFFSET_PX + col * CELL_WIDTH_PX + BOARD_PADDING_PX, OFFSET_PX + row * CELL_WIDTH_PX + BOARD_PADDING_PX];
}

export function GameView() {

    const canvasRef: React.MutableRefObject<HTMLCanvasElement | null> = useRef(null);

    const { globalState } = useContext(MutableStateContext);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas!.getContext('2d');
        let animationFrameId: number | null = null;

        const render = () => {
            // draw pieces
            draw(globalState, context!);

            animationFrameId = window.requestAnimationFrame(render);
        }
        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId!);
        }
    }, [globalState]);

    return (
        <Row>
            <Col>
                You are playing as {globalState.gameState!.color}.<br/>
                {globalState.gameState!.color === globalState.gameState!.turn ?
                    <span>It's your turn. Select a piece from those shown on the right.</span> :
                    <span>It's {globalState.gameState!.turn}'s turn. Please wait for them to make a move.</span>
                }
                <br/>
                <canvas ref={canvasRef} width={600} height={600}/>
            </Col>
            {
                globalState.gameState!.turn === globalState.gameState!.color && <Col><PieceSelector/></Col>
            }
        </Row>
    );
}

function pieceTilesToPixels(row: number, col: number) {
    return [(row - 0.5) * PIECE_TILE_WIDTH_PX + TILE_CANVAS_WIDTH_PX / 2, (col - 0.5) * PIECE_TILE_WIDTH_PX + TILE_CANVAS_WIDTH_PX / 2];
}

const TILE_CANVAS_WIDTH_PX = 100;
const PIECE_TILE_WIDTH_PX = 15;

function drawPiece(piece: [number, number][], ctx: CanvasRenderingContext2D) {
    let topLeft = pieceTilesToPixels(0, 0);
    ctx.beginPath();
    ctx.rect(topLeft[0], topLeft[1], PIECE_TILE_WIDTH_PX, PIECE_TILE_WIDTH_PX);
    ctx.stroke();
    for (const tile of piece) {
        topLeft = pieceTilesToPixels(tile[0], tile[1]);
        ctx.beginPath();
        ctx.rect(topLeft[0], topLeft[1], PIECE_TILE_WIDTH_PX, PIECE_TILE_WIDTH_PX);
        ctx.stroke();
    }
}

function PieceSelector() {
    const pieceCanvasRefs: React.MutableRefObject<React.MutableRefObject<HTMLCanvasElement>[]> = React.useRef([]);
    pieceCanvasRefs.current = Object.entries(allPieces).map(([i, ]) => pieceCanvasRefs.current[parseInt(i)] ?? createRef());

    useEffect(() => {
        Object.entries(allPieces).forEach(([i, piece]) => {
            const canvas = pieceCanvasRefs.current[parseInt(i)].current;
            const context = canvas.getContext('2d');
            let animationFrameId: number | null = null;

            const render = () => {
                // draw piece
                drawPiece(piece, context!);

                animationFrameId = window.requestAnimationFrame(render);
            }
            render();

            return () => {
                window.cancelAnimationFrame(animationFrameId!);
            }
        });
    }, []);

    return (
        <div style={{float: "left"}}>
            {
                Object.entries(allPieces).map(([i, ]) => (
                    <Card style={{position: "relative", float: "left", border: "1px solid black"}} className="m-1">
                        <div>
                            <button className="small">↔</button>
                            <button className="small">↕</button>
                            <button className="small">↻</button>
                            <button className="small">↺</button>
                        </div>
                        <canvas ref={pieceCanvasRefs.current[parseInt(i)]} width={TILE_CANVAS_WIDTH_PX} height={TILE_CANVAS_WIDTH_PX}/>
                    </Card>
                ))
            }
        </div>
    );
}

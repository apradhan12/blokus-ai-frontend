export enum PlayerColor {
    Orange = 0,
    Blue = 1
}

export type NullablePlayerColor = PlayerColor | null;

export interface GameState {
    board: NullablePlayerColor[][];
    turn: NullablePlayerColor;
    piecesRemaining: number[];
    currentPieceOrientations: number[];
    selectedPiece: number | null;
    winners: number[] | null;
}

export type NullableGameState = GameState | null;

export enum PlayerColor {
    Orange = 0,
    Blue = 1
}

export enum Screen {
    Lobby,
    SelectColor,
    InGame
}

export type NullablePlayerColor = PlayerColor | null;

export interface GameState {
    board: NullablePlayerColor[][];
    turn: NullablePlayerColor;
    color: PlayerColor;
    piecesRemaining: number[];
    currentPieceOrientations: number[];
    selectedPiece: number | null;
    winners: number[] | null;
}

export type NullableGameState = GameState | null;

export interface GlobalState {
    screen: Screen;
    gameState: NullableGameState;
}

export interface MutableState {
    globalState: GlobalState;
    updateGlobalState: (globalStateUpdater: (globalState: GlobalState) => GlobalState) => void;
}

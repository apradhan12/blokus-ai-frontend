import React from "react";

export enum PlayerColor {
    Orange = "orange",
    Blue = "blue"
}

export enum Screen {
    Lobby,
    SelectColor,
    InGame
}

export type NullablePlayerColor = PlayerColor | null;

export interface OrientedPiece {
    pieceId: number;
    orientation: number;
}

export interface GameState {
    webSocket: WebSocket;
    board: NullablePlayerColor[][];
    turn: NullablePlayerColor;
    color: PlayerColor;
    piecesRemaining: OrientedPiece[];
    selectedPiece: number | null;
    winners: number[] | null;
}

export type NullableGameState = GameState | null;

export interface GlobalState {
    screen: Screen;
    gameState: NullableGameState;
}

export type GlobalStateUpdater = (globalStateUpdater: (globalState: GlobalState) => GlobalState) => void;

export interface MutableState {
    globalState: GlobalState;
    updateGlobalState: GlobalStateUpdater
}

export const MutableStateContext = React.createContext<MutableState>({
    globalState: {
        screen: Screen.Lobby,
        gameState: null
    },
    updateGlobalState: (_: (state: GlobalState) => GlobalState) => {}
});

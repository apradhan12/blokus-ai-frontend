import {PlayerColor} from "./State";

export const BOARD_WIDTH = 14;
export const BOARD_HEIGHT = 14;
export const STARTING_POINT_LOCATIONS = [[4, 4], [9, 9]];

export const BOARD_PADDING_PX = 0; // padding
export const CELL_WIDTH_PX = 30;
export const OFFSET_PX = 0.5;

export const CANVAS_BORDER_WIDTH_PX = 1;
export const TILE_CANVAS_WIDTH_PX = 100 - CANVAS_BORDER_WIDTH_PX * 2;
export const PIECE_TILE_WIDTH_PX = 15;

export const COLOR_LIST = [PlayerColor.Orange, PlayerColor.Blue];

export const WEBSOCKET_URL = "ws://localhost:8080";

export function sum(array: number[]) {
    return array.reduce((a, b) => a + b, 0);
}

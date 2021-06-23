# Blokus AI Frontend

## Background

Blokus is a board game for four players where each player aims to place as many of their pieces on the board as possible. Each player starts out with the same 21 pieces, each with a unique shape. Each player must start by placing a piece in the corner, and from then on, players must place pieces diagonally adjacent to the pieces already placed. The game ends when no player can place any more pieces. The winner is the player for which the sum of the tiles in their remaining pieces is the least. If a player places all of their pieces on the board, they get a 15 point bonus, and if their last piece placed is the 1x1 piece, they get an additional 5 points.

Blokus Duo is a variant of Blokus for two players. Players start by placing a piece somewhere on top of either the square at (5, 5) or (10, 10), indexed from 1. Also, the board is 14x14 instead of 20x20. The other rules are the same.

## Technologies

The frontend is written in TypeScript. React is used for state management and view components. The Canvas API is used for drawing the board and tiles. The WebSocket API is used for communication with the backend.

## How to run

First, run the backend server (see instructions at [https://github.com/apradhan12/blokus-ai-backend](https://github.com/apradhan12/blokus-ai-backend)). Then, run `yarn start` to start the app in development mode.

import {allPieces, applyOrientation, readPieces} from "./Pieces";
import assert from "assert";

const pieceString = ` XX
XC
 X

X
XCX
 X

 X
 CX
XX

 X
XCX
  X

XX
 CX
 X

 X
XCX
X

 X
XC
 XX

  X
XCX
 X`;

const pieceRotations = readPieces(pieceString);

function arrayEquals<T>(a: T[], b: T[]) {
    return a.length === b.length &&
        a.every((val, index) => val === b[index]);
}

test("Piece rotations", () => {
    expect(pieceRotations.length).toBe(8);
    for (let i = 0; i < 8; i++) {
        const rotatedPiece = allPieces[18].map(tile => applyOrientation(tile[0], tile[1], i));
        assert(rotatedPiece.length === 4);
        for (const tile of pieceRotations[i]) {
            assert(rotatedPiece.some(rotatedPieceTile => arrayEquals(rotatedPieceTile, tile)), `${i}`);
        }
    }
});


test("Adds", () => {expect(3).toBe(3)});

export {}

const PIECES = `C

CX

XC
 X

XCX

CX
XX

 X
XCX

XCXX

  X
XCX

 CX
XX

X
XCXX

 X
 X
XCX

X
X
CXX

 CXX
XX

  X
XCX
X

XXCXX

X
CX
XX

 XX
XC
X

XX
C
XX

 XX
XC
 X

 X
XCX
 X

 X
XCXX`;

function getPieceCoords(lines: string[]): [number, number][] {
    const otherCoords: [number, number][] = [];
    let centerCoords: [number, number] | null = null;
    for (let i = 0; i < lines.length; i++) {
        for (let j = 0; j < lines[i].length; j++) {
            if (lines[i][j] === "C") {
                centerCoords = [i, j];
            } else if (lines[i][j] === "X") {
                otherCoords.push([i, j]);
            }
        }
    }
    if (centerCoords === null) {
        throw new Error("Could not find the center of the piece");
    }
    return otherCoords.map((coordPair: [number, number]) => [coordPair[0] - centerCoords![0], coordPair[1] - centerCoords![1]]);
}

export function readPieces() {
    const splitPieces = PIECES.split("\n\n");
    const allPieceCoords = [];
    for (const piece of splitPieces) {
        allPieceCoords.push(getPieceCoords(piece.split("\n")));
    }
    return allPieceCoords;
}

export const allPieces = readPieces();

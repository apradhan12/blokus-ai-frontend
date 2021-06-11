import React, {useEffect, useRef} from "react";
import {MutableStateContext} from "./State";

interface Props {
    draw: (ctx: CanvasRenderingContext2D, frameCount: number) => void;
}

export function Canvas(props: Props) {

    const { draw } = props;
    const canvasRef: React.MutableRefObject<HTMLCanvasElement | null> = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas!.getContext('2d');
        let frameCount = 0;
        let animationFrameId: number | null = null;

        const render = () => {
            frameCount++;
            draw(context!, frameCount);
            animationFrameId = window.requestAnimationFrame(render);
        }
        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId!);
        }
    }, [draw]);

    return (
        <MutableStateContext.Consumer>
            {({globalState}) => (
                <div>
                    You are playing as {globalState.gameState!.color}.<br />
                    {globalState.gameState!.color === globalState.gameState!.turn ?
                        <span>It's your turn. Select a piece from the ones shown to the right.</span> :
                        <span>It's {globalState.gameState!.turn}'s turn.</span>
                    }
                    <br/>
                    <canvas ref={canvasRef} width={800} height={800}/>
                </div>
            )}
        </MutableStateContext.Consumer>
    );
}

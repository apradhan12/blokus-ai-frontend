import React, {useEffect, useRef} from "react";

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

    return <canvas ref={canvasRef} width={800} height={800}/>;
}

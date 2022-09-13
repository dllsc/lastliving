import { PIXI } from "./pixi";

export const drawRect = (width: number, height: number) => {
    const upPipe = new PIXI.Graphics();
    upPipe.beginFill(0xFFFF00);
    upPipe.lineStyle(5, 0xFF0000);
    upPipe.drawRect(0, 0, width, height);

    return upPipe;
};

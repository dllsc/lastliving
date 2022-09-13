import { PIXI } from './pixi';

const downPipe_fromPublic = PIXI.Sprite.from('pipe-down.png');


export const drawUpPipe = (width: number, height: number) => {
    const upPipe = PIXI.AnimatedSprite.fromFrames(['pipe-up-1.png', 'pipe-up-2.png']);

    // const upPipe = drawRect(width, height)

    upPipe.animationSpeed = 1 / 5;
    upPipe.play();
    upPipe.width = width;
    upPipe.height = height;
    upPipe.zIndex = 3;

    return upPipe;

};

export const drawDownPipe = (width: number, height: number) => {
    const downPipe = PIXI.Sprite.from(downPipe_fromPublic.texture);
    downPipe.height = height;
    downPipe.width = width;
    downPipe.zIndex = 3;
    downPipe.y = 768 - height;
    return downPipe;
};

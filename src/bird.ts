import { Sprite } from 'pixi.js';
import { PIXI } from './pixi';


for (let i = 1; i <= 4; i++) {
    Sprite.from(`bird-${i}-1.png`);
    Sprite.from(`bird-${i}-2.png`);
}

export const initBird = (num: number, width: number, height: number) => {
    const sprite = PIXI.AnimatedSprite.fromFrames([`bird-${num}-1.png`, `bird-${num}-2.png`]);
    // const sprite = drawRect(width, height);

    sprite.animationSpeed = 1 / 6;
    sprite.scale.set(0.3, 0.3);
    sprite.x = 100;
    sprite.y = 100;

    sprite.width = width;
    sprite.height = height;

    sprite.pivot.set(0, 0);

    sprite.anchor.set(0, 0);
    sprite.play();

    sprite.zIndex = 3;

    return sprite;
};

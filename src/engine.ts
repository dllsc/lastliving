import { AnimatedGIFLoader } from '@pixi/gif';
import { Client } from 'colyseus.js';
import { PIXI } from './pixi';
import { sound } from '@pixi/sound';

sound.add('my-sound', 'sound.wav');
sound.play('my-sound', {
    loop: true,
    volume: 0.1
});

export const client = new Client(
    process.env.NODE_ENV == 'development'
        ? 'ws://localhost:4500'
        : 'ws://ec2-3-70-250-180.eu-central-1.compute.amazonaws.com:4500',
);


(window as any).PIXI = PIXI;

PIXI.Loader.registerPlugin(AnimatedGIFLoader);

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;
PIXI.settings.TARGET_FPMS = 0.08;

PIXI.extensions.add(PIXI.BatchRenderer);

PIXI.utils.skipHello();

export const viewEngine = new PIXI.Application({
    width: 1024,
    height: 768,
    // transparent: true,
    backgroundColor: 0xFFFFFF,
    antialias: true,
});

export const initViewEngine = () => {
    viewEngine.start();
    document.getElementById('game')!.appendChild(viewEngine.view);
};

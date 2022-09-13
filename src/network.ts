import { Room } from 'colyseus.js';
import { initBird } from './bird';
import { drawDownPipe, drawUpPipe } from './drawPipe';
import { viewEngine } from './engine';
import { setMouseMoveListener } from './events';
import { IState } from './models';
import { NetworkEvents } from './networkEvents';
import { PIXI } from './pixi';
import { PositionSyncer } from './positionSyncer';
import { commonDataHolder } from './сommonDataHolder';


const pipesSyncer = new PositionSyncer();
const birdsSyncer = new PositionSyncer();
//
// setInterval(() => {
//     pipesSyncer.log();
// }, 100);


const textsGraphics: PIXI.DisplayObject[] = [];

export const initializeSync = (): void => {
    PIXI.Ticker.shared.add(() => {
        pipesSyncer.update();
        birdsSyncer.update();

        for (const bird of birdsSyncer.displayObjects) {
            const index = birdsSyncer.displayObjects.indexOf(bird);
            textsGraphics[index].x = bird.x;
            textsGraphics[index].y = bird.y - 30;
        }
    });
};

export const destroyRoomSubscriptions = (room: Room<IState>) => {
    room.onStateChange.clear();

    room.state.birds.onAdd = undefined!;
    room.state.pipes.onAdd = undefined!;

    room.state.birds.onRemove = undefined!;
    room.state.pipes.onRemove = undefined!;

    setMouseMoveListener(() => void 0);

    pipesSyncer.clear();
    birdsSyncer.clear();

    for (let textsGraphic of textsGraphics) {
        textsGraphic.destroy();
    }

    textsGraphics.splice(0);
};

export const initializeRoomSubscriptions = (room: Room<IState>): void => {
    room.onStateChange(() => {
        commonDataHolder.setStarted(room.state.started);
    });

    room.state.birds.onAdd = bird => {
        const birdGraphic = initBird(birdsSyncer.length + 1, bird.width, bird.height);
        birdGraphic.position.set(bird.x, bird.y);
        birdsSyncer.add(birdGraphic, bird);

        const text = new PIXI.Text(bird.username, {
            fontSize: 24,
            lineHeight: 28,
            letterSpacing: 0,
            fill: 0xFFFFFF,
            align: 'center',
        });
        text.zIndex = 4;
        text.y = 100;
        textsGraphics.push(text);

        viewEngine.stage.addChild(birdGraphic);
        viewEngine.stage.addChild(text);
    };

    room.state.birds.onRemove = bird => {
        const birdIndex = birdsSyncer.indexOf(bird);
        textsGraphics[birdIndex].destroy();
        textsGraphics.splice(birdIndex, 1);
        birdsSyncer.remove(bird).destroy();

        if (bird.username === commonDataHolder.username) {
            if (!room.state.birds.length && room.state.multiplayer) {
                commonDataHolder.setWinner(true);
            } else {
                commonDataHolder.setLooser(true);
            }
        }
    };

    room.state.pipes.onAdd = pipe => {

        const pipeGraphic = pipe.y !== 0
            ? drawDownPipe(pipe.width, pipe.height)
            : drawUpPipe(pipe.width, pipe.height);
        pipeGraphic.pivot.set(0, 0);
        pipeGraphic.position.set(pipe.x, pipe.y);

        pipesSyncer.add(pipeGraphic, pipe);

        viewEngine.stage.addChild(pipeGraphic);
    };

    room.state.pipes.onRemove = pipe => {
        pipesSyncer.remove(pipe).destroy();
    };

    setMouseMoveListener((x, y) => {
        room.send(
            NetworkEvents.MOUSE,
            {
                x,
                y,
            },
        );
    });
};

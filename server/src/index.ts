import { Client, Room, Server } from 'colyseus';
import { Rectangle } from 'pixi.js';
import { CreateOptions, FlappyMetadata, JoinOptions } from './models';
import { MouseMessagePayload, NetworkEvents } from './network-events';
import { Bird, Pipe, State } from './schema';

const sceneRect = new Rectangle(0, 0, 1024, 768);

const spaceBetweenPipes = new Rectangle(sceneRect.right, 0, 100, sceneRect.height);

const removeManyFromArray = <T>(valuesArr: T[], itemsToRemove: number[]) => {
    itemsToRemove.sort((a, b) => a - b);

    for (let i = itemsToRemove.length - 1; i >= 0; i--) {
        valuesArr.splice(itemsToRemove[i], 1);
    }

};

const removeOneFromArray = <T>(values: T[], item: T): void => {
    values.splice(values.indexOf(item), 1);
};

const BIRD_ASPECT_RATIO = 0.883;
const BIRD_MIN_WIDTH = 100;
const BIRD_MAX_WIDTH = 180;
const BIRD_SMALL_MULTIPLIER = 0.5;

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class FlappyRoom extends Room<State, FlappyMetadata> {
    private pipesSpeed = 3;
    private targetMsBetweenFrames = 25;
    private verticalGapBetweenPipes = 100;

    private readonly mouses: { x: number, y: number }[] = [];
    private readonly pipes: Rectangle[] = [];
    private readonly birds: Rectangle[] = [];
    private readonly birdsSmall: Rectangle[] = [];
    private readonly clientIds: string[] = [];

    private readonly pipeIndexesToRemove: number[] = [];

    async onCreate(
        {
            roomName,
            username,
        }: CreateOptions,
    ): Promise<void> {
        await this.setMetadata({ roomName });
        this.setState(new State());
        this.setPatchRate(this.targetMsBetweenFrames);

        this.state.ownerUsername = username;

        this.onMessage<MouseMessagePayload>(NetworkEvents.MOUSE, this.setMouse.bind(this));
        this.onMessage(NetworkEvents.MOUSE, this.setMouse.bind(this));
        this.onMessage(NetworkEvents.START, this.setStart.bind(this));

        this.setSimulationInterval(this.update.bind(this), this.targetMsBetweenFrames);
    }

    onJoin(client: Client, { username }: JoinOptions): void {
        this.addBird(client.id, username);
    }

    onLeave(client: Client, consented?: boolean): void | Promise<any> {
        this.removeBird(this.clientIds.indexOf(client.id));
    }

    private async setStart(): Promise<void> {
        this.state.started = true;

        await this.lock();

        this.broadcastPatch();
    }

    private update() {
        if (!this.state.started || !this.state.birds.length) {
            return;
        }

        this.moveBirds();
        this.increaseSpeedOfPipes();

        if (this.readyToGeneratePipe()) {
            this.changeHorizontalSpaceBetweenPipes();
            this.addPipePair();
        }

        this.movePipes();
        this.removePipesThatMovedOut();
        this.checkBirdsLoose();
    }

    private increaseSpeedOfPipes(): void {
        this.pipesSpeed += 0.007;
    }

    private checkBirdsLoose(): void {
        for (let birdIndex = 0; birdIndex < this.birds.length; birdIndex++) {
            let bird = this.birdsSmall[birdIndex];
            for (let pipeIndex = 0; pipeIndex < this.pipes.length; pipeIndex++) {
                let pipe = this.pipes[pipeIndex];

                if (pipe.intersects(bird)) {
                    this.removeBird(birdIndex);
                }
            }
        }
    }

    private moveBirds(): void {
        for (let i = 0; i < this.birds.length; i++) {
            const birdSchema = this.state.birds[i];
            const birdRect = this.birds[i];
            const birdSmallRect = this.birdsSmall[i];
            const mouse = this.mouses[i];

            const newBirdTopLeftX = mouse.x - (birdRect.width / 2);
            const newBirdTopLeftY = mouse.y - (birdRect.height / 2);

            birdRect.x = birdRect.x + (newBirdTopLeftX - birdRect.x) / 20;
            birdRect.y = birdRect.y + (newBirdTopLeftY - birdRect.y) / 20;

            this.syncBird(birdRect, birdSchema);
            this.syncSmallBirdRect(birdRect, birdSmallRect);
        }
    }

    private movePipes(): void {
        for (let i = 0; i < this.pipes.length; i++) {
            const pipe = this.state.pipes[i];
            const pipeRect = this.pipes[i];

            const speed = this.pipesSpeed;

            pipe.x -= speed;
            pipeRect.x -= speed;
        }
    }

    private readyToGeneratePipe(): boolean {
        return this.pipes.every(pipe => !pipe.intersects(spaceBetweenPipes));
    }

    private removePipesThatMovedOut(): void {
        for (let i = 0; i < this.pipes.length; i++) {
            const pipeRect = this.pipes[i];

            if (pipeRect.right < sceneRect.left) {
                this.pipeIndexesToRemove.push(i);
            }
        }

        removeManyFromArray(this.pipes, this.pipeIndexesToRemove);
        removeManyFromArray(this.state.pipes, this.pipeIndexesToRemove);

        if (this.pipeIndexesToRemove.length) {
            this.pipeIndexesToRemove.splice(0, this.pipeIndexesToRemove.length);
        }
    }

    private getRandomPipeHeight(): number {
        return getRandomInt(200, (spaceBetweenPipes.height / 2) - (this.verticalGapBetweenPipes / 2));
    }

    private changeHorizontalSpaceBetweenPipes(): void {
        spaceBetweenPipes.width = getRandomInt(30, 200);
    }

    private addPipePair(): void {
        const topPipe = new Rectangle(
            spaceBetweenPipes.right - 1,
            0,
            100,
            this.getRandomPipeHeight(),
        );

        const bottomPipeHeight = this.getRandomPipeHeight();
        const bottomPipeY = sceneRect.bottom - bottomPipeHeight;

        const bottomPipe = new Rectangle(
            spaceBetweenPipes.right - 1,
            bottomPipeY,
            100,
            bottomPipeHeight,
        );

        this.addPipe(topPipe);
        this.addPipe(bottomPipe);
    }

    private addPipe(pipeRect: Rectangle): void {
        const pipeSchema = new Pipe();

        this.syncPipe(pipeRect, pipeSchema);

        this.state.pipes.push(pipeSchema);
        this.pipes.push(pipeRect);
    }

    private syncPipe(pipeRect: Rectangle, pipeSchema: Pipe): void {
        pipeSchema.x = pipeRect.x;
        pipeSchema.y = pipeRect.y;
        pipeSchema.width = pipeRect.width;
        pipeSchema.height = pipeRect.height;
    }

    private syncBird(birdRect: Rectangle, birdSchema: Bird): void {
        birdSchema.x = birdRect.x;
        birdSchema.y = birdRect.y;
    }

    private setMouse(client: Client, message: MouseMessagePayload) {
        this.mouses[this.clientIds.indexOf(client.id)] = message;
    }

    private configureGapBetweenPipes = () => {
        for (let bird of this.birds) {
            this.verticalGapBetweenPipes = Math.max(
                this.verticalGapBetweenPipes,
                bird.height + 20,
            );
        }
    };

    private removeBird(birdIndex: number): void {
        this.birds.splice(birdIndex, 1);
        this.state.birds.splice(birdIndex, 1);
        this.mouses.splice(birdIndex, 1);
        this.clientIds.splice(birdIndex, 1);
        this.birdsSmall.splice(birdIndex, 1);

        this.configureGapBetweenPipes();
    }

    private syncSmallBirdRect(original: Rectangle, small: Rectangle): void {
        const heightDiff = (original.height - small.height) / 2;
        const widthDiff = (original.width - small.width) / 2;

        small.x = original.x + widthDiff;
        small.y = original.y + heightDiff;

    }

    private addBird(clientId: string, username: string): void {
        const birdX = 100;
        const birdY = 100 * (this.birds.length + 1);
        const birdWidth = getRandomInt(BIRD_MIN_WIDTH, BIRD_MAX_WIDTH);
        const birdHeight = birdWidth * BIRD_ASPECT_RATIO;
        const birdRect = new Rectangle(
            birdX,
            birdY,
            birdWidth,
            birdHeight,
        );

        const smallBirdRect = new Rectangle(
            0,
            0,
            birdWidth * BIRD_SMALL_MULTIPLIER,
            birdHeight * BIRD_SMALL_MULTIPLIER,
        );


        const bird = new Bird();

        bird.username = username;
        bird.clientId = clientId;
        bird.width = birdWidth;
        bird.height = birdHeight;

        this.syncBird(birdRect, bird);
        this.syncSmallBirdRect(birdRect, smallBirdRect);

        this.clientIds.push(clientId);
        this.state.birds.push(bird);
        this.birds.push(birdRect);
        this.birdsSmall.push(smallBirdRect);
        this.mouses.push({
            x: birdX,
            y: birdY,
        });

        if (this.state.birds.length > 1) {
            this.state.multiplayer = true;
        }

        this.configureGapBetweenPipes();
    }
}


const server = new Server();

const express = require('express')
const app = express();

app.use(express.static('dist/frontend'));

server.define('flappy', FlappyRoom);

server.listen(4500);

app.listen(4000);

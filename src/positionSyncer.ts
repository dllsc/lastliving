import { DisplayObject, IPointData } from 'pixi.js';
import { PIXI } from './pixi';

export class PositionSyncer {
    readonly displayObjects: PIXI.DisplayObject[] = [];
    readonly positions: IPointData[] = [];
    readonly previousPositions: IPointData[] = [];

    get length(): number {
        return this.positions.length;
    }

    add(item: DisplayObject, position: IPointData): void {
        this.displayObjects.push(item);
        this.positions.push(position);
        this.previousPositions.push({
            x: position.x,
            y: position.y,
        });
    }

    indexOf(position: IPointData): number {
        return this.positions.indexOf(position);
    }

    remove(position: IPointData): DisplayObject {
        const indexOfRemoved = this.positions.indexOf(position);

        const removedDisplayObject = this.displayObjects[indexOfRemoved];

        this.displayObjects.splice(indexOfRemoved, 1);
        this.positions.splice(indexOfRemoved, 1);
        this.previousPositions.splice(indexOfRemoved, 1);

        return removedDisplayObject;
    }

    clear(): void {
        for (let displayObject of this.displayObjects) {
            displayObject.destroy();
        }

        this.displayObjects.splice(0);
        this.positions.splice(0);
        this.previousPositions.splice(0);
    }

    update(): void {
        for (let i = 0; i < this.positions.length; i++) {
            const displayObject = this.displayObjects[i];
            const position = this.positions[i];
            const previousPosition = this.previousPositions[i];

            const shouldSyncPosition = position.x != previousPosition.x;

            if (shouldSyncPosition) {
                displayObject.position.set(previousPosition.x, previousPosition.y);
                previousPosition.x = position.x;
                previousPosition.y = position.y;
            }


            displayObject.position.set(
                displayObject.position.x + (position.x - displayObject.position.x) / 3,
                displayObject.position.y + (position.y - displayObject.position.y) / 3,
            );
        }
    }

    log(): void {
        if (!this.positions.length) {
            return;
        }

        console.log(this.displayObjects[0].position.x, this.positions[0].x);
    }
}

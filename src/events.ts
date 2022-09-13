import { viewEngine } from './engine';

interface IMouseMoveHandler {
    (x: number, y: number): void;
}

interface IEventHandlers {
    onMouseMove: IMouseMoveHandler;
    canvasRect: DOMRect;
}

const eventHandlers: IEventHandlers = {
    onMouseMove: (x: number, y: number) => {
    },
    canvasRect: undefined!
};


const leftRightPadding = 100;
const topBottomPadding = 90;

const boundNumber = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
}

export const initEventListeners = () => {
    eventHandlers.canvasRect = viewEngine.view.getBoundingClientRect();

    document.addEventListener('mousemove', event => {
        eventHandlers.onMouseMove(
            boundNumber(
                event.clientX - eventHandlers.canvasRect.x,
                leftRightPadding,
                eventHandlers.canvasRect.width - leftRightPadding
            ),
            boundNumber(
                event.clientY - eventHandlers.canvasRect.y,
                topBottomPadding,
                eventHandlers.canvasRect.height - topBottomPadding
            )
        );
    });
};

export const setMouseMoveListener = (listener: (x: number, y: number) => void): void => {
    eventHandlers.onMouseMove = listener;
};

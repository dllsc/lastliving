export interface MouseMessagePayload {
    readonly x: number;
    readonly y: number;
}

export const NetworkEvents = {
    MOUSE: 'mouse',
    START: 'start',
};

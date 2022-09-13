export interface JoinOptions {
    readonly username: string;
}

export interface CreateOptions extends JoinOptions {
    readonly roomName: string;
}

export interface FlappyMetadata {
    readonly roomName: string;
}

type IEventState<T, Full> = Full & {
    onAdd: (t: T) => void;
    onRemove: (t: T) => void;
};

type IEventStateItem<T> = T & {
    onChange: (t: T) => void;
}

export interface IBird {
    x: number;
    y: number;
    width: number;
    height: number;
    username: string;
    clientId: string;
}

export interface IPipe {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IState {
    birds: IEventState<IEventStateItem<IBird>, IEventStateItem<IBird>[]>;
    pipes: IEventState<IEventStateItem<IPipe>, IEventStateItem<IPipe>[]>;

    ownerUsername: string;
    started: boolean;
    multiplayer: boolean;
}

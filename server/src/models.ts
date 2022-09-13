export interface JoinOptions {
    readonly username: string;
}

export interface CreateOptions extends JoinOptions {
    readonly roomName: string;
}

export interface FlappyMetadata {
    readonly roomName: string;
}


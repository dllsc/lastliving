import { Room, RoomAvailable } from 'colyseus.js';
import React, { useEffect, useState } from 'react';
import { client } from '../engine';
import { CreateOptions, FlappyMetadata, IState, JoinOptions } from '../models';
import { destroyRoomSubscriptions, initializeRoomSubscriptions } from '../network';
import { NetworkEvents } from '../networkEvents';
import { randomString } from '../utils';
import { commonDataHolder } from '../сommonDataHolder';

export const Menu = () => {
    const [rooms, setRooms] = useState<RoomAvailable<FlappyMetadata>[]>([]);
    const [myRoomName, setMyRoomName] = useState(`room ${randomString()}`);
    const [username, setUsername] = useState(`player ${randomString()}`);
    const [joinedRoom, setJoinedRoom] = useState<Room<IState>>();
    const [createdRoom, setCreatedRoom] = useState<Room<IState>>();
    const [looser, setLooser] = useState(false);
    const [winner, setWinner] = useState(false);
    const [isGame, setIsGame] = useState(false);
    const [started, setStarted] = useState(false);

    const fetchRooms = async () => {
        setRooms(await client.getAvailableRooms('flappy'));
    };

    const createRoom = async () => {
        const createOptions: CreateOptions = {
            roomName: myRoomName,
            username,
        };

        const room = await client.create<IState>('flappy', createOptions);

        setJoinedRoom(room);
        setCreatedRoom(room);

        initializeRoomSubscriptions(room);
        setIsGame(true);
    };

    const joinRoom = async (roomId: string) => {
        const joinOptions: JoinOptions = {
            username,
        };

        const room = await client.joinById<IState>(roomId, joinOptions);

        setJoinedRoom(room);

        initializeRoomSubscriptions(room);
        setIsGame(true);
    };

    const leaveRoom = () => {
        setJoinedRoom(null!);
        setCreatedRoom(null!);
        setIsGame(false);
        setLooser(false);
        setWinner(false);
        setStarted(false);

        destroyRoomSubscriptions(joinedRoom!);
        joinedRoom!.leave();
    };

    const startGame = () => {
        createdRoom!.send(NetworkEvents.START);
    };

    const setAndSaveUsername = (newUsername: string) => {
        setUsername(newUsername);
        commonDataHolder.username = newUsername;
    };

    useEffect(() => {
        fetchRooms();

        commonDataHolder.setLooser = setLooser;
        commonDataHolder.setStarted = setStarted;
        commonDataHolder.setWinner = setWinner;
        commonDataHolder.username = username;

        const intervalId = setInterval(() => {
            fetchRooms();
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);


    return <div className="wrapper">
        <div className="inner-container">
            {isGame &&
              <div className="in-game-controls">
                <button type="button"
                        onClick={leaveRoom}>
                  Leave
                </button>
                  {!!createdRoom && !started &&
                    <button type="button"
                            onClick={startGame}>
                      Start
                    </button>
                  }
                  <div className="me">Me: {username}</div>
              </div>
            }
            {looser &&
              <div className="you_died">YOU DIED</div>
            }
            {winner &&
              <div className="you_win">YOU WIN</div>
            }
            {!isGame &&
              <>
            <div className="menu">
              <label htmlFor="username">User name</label>
              <input type="text"
                     id="username"
                     onChange={e => setAndSaveUsername(e.target.value)}
                     placeholder="USERNAME"
                     value={username}/>
              <label htmlFor="roomname">Room name</label>
              <input type="text"
                     id="roomname"
                     placeholder="ROOM NAME"
                     onChange={e => setMyRoomName(e.target.value)}
                     value={myRoomName}/>

              <button type="button"
                      disabled={!!createdRoom || !username.length || !myRoomName.length}
                      onClick={createRoom}>
                CREATE
              </button>
            </div>

            <div className="rooms">
                {rooms.map(room =>
                    <div className="room_wrapper"
                         key={room.roomId}>
                        <div className="room_info">
                            <div className="rooms_name">
                                {room.metadata!.roomName}
                            </div>

                            <div>
                                Connected: {room.clients}
                            </div>
                        </div>


                        <button type="button"
                                onClick={() => joinRoom(room.roomId)}>
                            JOIN
                        </button>
                    </div>,
                )}
            </div>
           </>
            }
        </div>
    </div>;
};

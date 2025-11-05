import { useState } from "react";
import { joinRoom } from "../../api/api"
import useStore from "../../tools/store";
export default function StartGameInputs() {
    const {setWaitingState, setRoomCode, roomCode} = useStore();
    const [name, setName] = useState("");
    const [err, setErr] = useState("");
    const joinRoomHandler = async () => {
        const data = await joinRoom(roomCode, name);
      console.log(data);
      setErr(data.error );
      if (!data.error) {
        setRoomCode(roomCode);
        // save current player's name for voting
        useStore.getState().setPlayerName(name);
        setWaitingState();
      }
    }

    return (
    <div className="start-game-inputs">
        <p>Введите ваше имя:</p>
        <input onChange={(e) => setName(e.target.value)} type="text" />
        <p>Введите код комнаты:</p>
        <input onChange={(e) => setRoomCode(e.target.value)} value={roomCode} type="text" />
        <button onClick={joinRoomHandler} className="join-button">Присоединиться</button>
        <p className="error">{err}</p>
      </div>
      )
}
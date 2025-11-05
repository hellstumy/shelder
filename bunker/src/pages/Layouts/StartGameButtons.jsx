import { useState } from "react";
import useStore from "../../tools/store";
import copy from "../../assets/copy.svg";
import { createRoom } from "../../api/api";
export default function StartGameButtons() {
  const {setInputState} = useStore();
    const [visibility, setVisibility] = useState("hidden");
    const [code, setCode] = useState("");
    const createRoomHandler = async () => {
        const data = await createRoom();
        setCode(data.roomCode);
        setVisibility("visible");
    }


  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };
  return (
    <div className="start-game-buttons">
        <button className="start-button" onClick={createRoomHandler}>
          Создать комнату
        </button>

        <p style={{ visibility: visibility }}>
          Code: {code}{" "}
          <span onClick={handleCopy} >
            <img src={copy} alt="copy" />
          </span>
        </p>

        <button onClick={setInputState}  className="join-button">Присоединиться</button>
      </div>
  );
}
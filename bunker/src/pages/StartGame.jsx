import useStore from "../tools/store";
import back from "../assets/back.svg";
import StartGameButtons from "./Layouts/StartGameButtons";
import StartGameInputs from "./Layouts/StartGameInputs";
import StartGameWaiting from "./Layouts/StartGameWaiting";
import "./StartGame.css";


export default function StartGame() {
  const {startState, goBack, setRulesState } = useStore();
  
  

  return (
    <div className="start-game-container">
      <div>
        <img onClick={goBack} className="back" src={back} alt="" />
        <h1 className="title">Bunker</h1>
      </div>
        {startState === "buttons" && <StartGameButtons />}
        {startState === "inputs" && <StartGameInputs/>}
        {startState === "waiting"  && <StartGameWaiting />}
      <button
        onClick={setRulesState}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "8px 12px",
          fontSize: "14px",
          borderRadius: "4px",
          backgroundColor: "#2232a5ff",
          border: "1px solid #ccc",
          cursor: "pointer"
        }}
      >
        Правила
      </button>
    </div>
  );
}

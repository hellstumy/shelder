import useStore from "../tools/store";
import back from "../assets/back.svg";
import StartGameButtons from "./Layouts/StartGameButtons";
import StartGameInputs from "./Layouts/StartGameInputs";
import StartGameWaiting from "./Layouts/StartGameWaiting";
import "./StartGame.css";


export default function StartGame() {
  const {startState, goBack} = useStore();
  
  

  return (
    <div className="start-game-container">
      <div>
        <img onClick={goBack} className="back" src={back} alt="" />
        <h1 className="title">Bunker</h1>
      </div>
        {startState === "buttons" && <StartGameButtons />}
        {startState === "inputs" && <StartGameInputs/>}
        {startState === "waiting"  && <StartGameWaiting />}
      
    </div>
  );
}

import Game from './pages/Game'
import useStore from './tools/store'
import StartGame from './pages/StartGame'

function App() {
  const {windowState} = useStore();

  if(windowState === "Game"){
    return(
      <>
      <Game />
      </>
    )
  } else {
    return(
      <>
      <StartGame />
      </>
    )
  
}}

export default App

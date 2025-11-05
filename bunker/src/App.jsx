import Game from './pages/Game'
import useStore from './tools/store'
import StartGame from './pages/StartGame'
import Rules from './pages/Rules'

function App() {
  const {windowState} = useStore();

  if(windowState === "Game"){
    return(
      <>
      <Game />
      </>
    )
  } else if(windowState === "Rules"){
    return(
      <>
      <Rules />
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

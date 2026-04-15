import { useReducer } from 'react'
import { gameReducer, initialState } from './game/gameReducer'
import { SelectScreen } from './components/SelectScreen'
import { LoadingScreen } from './components/LoadingScreen'
import { GameBoard } from './components/GameBoard'
import { FinishLetter } from './components/FinishLetter'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  if (state.phase === 'selecting') {
    return (
      <SelectScreen
        onSelect={(boardSize, mode) =>
          dispatch({ type: 'START_GAME', payload: { boardSize, mode } })
        }
      />
    )
  }

  if (state.phase === 'loading') {
    return (
      <LoadingScreen
        imageIds={state.selectedImageIds}
        onLoaded={() => dispatch({ type: 'IMAGES_LOADED' })}
      />
    )
  }

  if (state.phase === 'finished') {
    return <FinishLetter onRestart={() => dispatch({ type: 'RESTART' })} />
  }

  return <GameBoard state={state} dispatch={dispatch} />
}

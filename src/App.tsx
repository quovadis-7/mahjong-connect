import { useReducer } from 'react'
import { gameReducer, initialState } from './game/gameReducer'
import { CARDS } from './data/cards'
import { SelectScreen } from './components/SelectScreen'
import { GameBoard } from './components/GameBoard'
import { FinishLetter } from './components/FinishLetter'

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  if (state.phase === 'selecting') {
    return (
      <SelectScreen
        onSelect={boardSize =>
          dispatch({ type: 'START_GAME', payload: { boardSize } })
        }
      />
    )
  }

  if (state.phase === 'finished') {
    return <FinishLetter onRestart={() => dispatch({ type: 'RESTART' })} />
  }

  return <GameBoard state={state} dispatch={dispatch} cards={CARDS} />
}
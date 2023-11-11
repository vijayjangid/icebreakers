import { useEffect, useState } from "react";
import "./App.css";
import data from "./data.json";
import DB from './localStorage.js';
import Tile from "./components/Tile/index.js";
import Dropdown from "./components/Dropdown/index.js";

const { getScoresHistory, saveScoresHistory, getEmojiSet, saveEmojiSet, clear } = DB;
// clear();



const EMOJI_SETS = Object.keys(data);

const resetTiles = (emojiSet) => {
  let emojiSetRandom = emojiSet;
  if (emojiSet === 'random') {
    emojiSetRandom = EMOJI_SETS.slice(1)[Math.floor(Math.random() * (EMOJI_SETS.length - 1))]
  }
  const initialTiles = [
    ...data[emojiSetRandom],
    ...data[emojiSetRandom],
    { id: "bomb", content: "🔥", bombed: true },
  ];
  return initialTiles
    .sort(() => Math.random() - 0.5)
    .map((x, index) => ({ ...x, key: index /* guessed: true */ }));
};

const GAME_STATUS = {
  start: "Start clicking tiles to match pairs!",
  matched: "Wow! You found a pair. Continue playing.",
  bombed: "Boom! You lost all your matched pairs. Continue playing.",
  over: "Game ended! You found all matching tiles. Click to restart.",
  reloading: "reloading",
};

const TIMEOUT = 500;

// let scoreTimeoutId;
function App() {
  const [emojiSet, setEmojiSet] = useState(() => getEmojiSet() ?? EMOJI_SETS[0]);
  const [tiles, setTiles] = useState(() => resetTiles(emojiSet));
  const [firstGuess, setFirstGuess] = useState(null);
  const [secondGuess, setSecondGuess] = useState(null);
  const [bombed, setBombed] = useState();
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.start);
  const [totalScore, setTotalScore] = useState(0);
  const [openDropdown, setOpenDropdown] = useState();
  const [scoreHistory, setScoreHistory] = useState(getScoresHistory);

  // Reset entire game and game stats
  const resetGame = (newEmojiSet) => {
    setFirstGuess(null);
    setSecondGuess(null);
    setBombed(null);
    setTotalScore(0);
    setTiles(resetTiles(newEmojiSet));
    setGameStatus(GAME_STATUS.start);
  };

  const handleReset = () => {
    setGameStatus(GAME_STATUS.reloading);
  };

  const resetGuesses = () => {
    setFirstGuess(null);
    setSecondGuess(null);
  };

  // reset game on emoji set change
  useEffect(() => {
    setGameStatus(GAME_STATUS.reloading);
  }, [emojiSet]);

  //update tiles based on game status
  useEffect(() => {
    let timeoutId;
    console.log('emoji set changing', emojiSet, gameStatus);
    // reset the game with some delay
    if (gameStatus === GAME_STATUS.reloading) {
      timeoutId = setTimeout(() => {
        resetGame(emojiSet);
      }, TIMEOUT);
    } else if (gameStatus === GAME_STATUS.bombed) {
      timeoutId = setTimeout(() => {
        setTiles((prevTiles) => {
          return prevTiles.map((x) => ({
            ...x,
            guessed: x.guessed || x.bombed,
            bombed: x.guessed || x.bombed,
          }));
        });
        resetGuesses();
      }, TIMEOUT);
    } else if (gameStatus === GAME_STATUS.over) {
      setTiles((prevTiles) => prevTiles.map((x) => ({ ...x, guessed: true })));
    }
    return () => clearTimeout(timeoutId);
  }, [gameStatus, emojiSet]);

  const handleClick = (guess) => {
    // clicking same tile just ignore
    if (firstGuess?.key === guess.key || secondGuess?.key === guess.key) return;

    // lock clicks when both guesses are different until the guesses are cleared
    if (firstGuess && secondGuess && firstGuess.id !== secondGuess.id) return;

    // bombed and guessed already, ignore
    if (guess.bombed && guess.guessed) {
      return;
    }
    //clicked on bomb first time
    if (guess.bombed) {
      setBombed(true);
      setGameStatus(GAME_STATUS.bombed);
    }
    firstGuess ? setSecondGuess(guess) : setFirstGuess(guess);
  };

  useEffect(() => {
    let timeoutId;
    if (firstGuess && secondGuess) {
      if (firstGuess.id !== secondGuess.id) {
        timeoutId = setTimeout(() => {
          resetGuesses();
        }, TIMEOUT);
      } else {
        timeoutId = setTimeout(() => {
          setTiles((prevTiles) => {
            return prevTiles.map((x) => ({
              ...x,
              guessed: x.guessed || x.id === firstGuess.id,
            }));
          });
          setGameStatus(GAME_STATUS.matched);
          resetGuesses();
        }, TIMEOUT);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [firstGuess, secondGuess]);

  // update score based on tiles
  useEffect(() => {
    const calculatedScore = tiles.reduce((prev, curr) => {
      if (curr.guessed) prev += 10;
      if (curr.guessed && curr.bombed && bombed) prev -= 10;
      if (curr.guessed && curr.bombed && !bombed) prev += 10;
      return prev;
    }, 0);
    setTotalScore(
      calculatedScore
    );

    if (tiles.filter((x) => x.bombed || x.guessed).length === tiles.length) {
      setGameStatus(prev => prev !== GAME_STATUS.reloading ? GAME_STATUS.over : prev);
    }
  }, [tiles, bombed]);

  useEffect(() => {
    if (gameStatus === GAME_STATUS.over && ((!bombed && totalScore === 100) || bombed)) {
      setScoreHistory(prev => Array.isArray(prev) ? [totalScore, ...prev].slice(0, 20) : [totalScore]);
    }
  }, [totalScore, gameStatus, bombed])

  useEffect(() => {
    console.log('storing history in DB', scoreHistory);
    scoreHistory && saveScoresHistory(scoreHistory)
  }, [scoreHistory])

  return (
    <div className="App">
      <header className="App-header">
        <span className="logo" aria-label="memory logo">
          <span>mem</span>
          <span>🔥 ry</span>
        </span>
        <Dropdown
          open={openDropdown}
          onClick={() => setOpenDropdown(true)}
          items={EMOJI_SETS}
          selectedItem={emojiSet}
          onChange={(x) => {
            setEmojiSet(x);
            saveEmojiSet(x);
            setOpenDropdown(false);
          }}
          data={data}
        />
      </header>
      <>
        <div className="game-screen-wrapper">
          {gameStatus !== GAME_STATUS.reloading && (
            <div className="game-screen">
              {tiles?.map((x) => (
                <Tile
                  key={x.key}
                  data={x}
                  firstGuessKey={firstGuess?.key}
                  secondGuessKey={secondGuess?.key}
                  bombed={bombed}
                  onClick={() => handleClick(x)}
                />
              ))}
            </div>
          )}
        </div>
        {gameStatus !== GAME_STATUS.reloading && (
          <div className="scoreboard">
            <h2 className="game-status">
              {gameStatus}
            </h2>
            {gameStatus === GAME_STATUS.over && (
              <button className="btn-reset" onClick={handleReset}>
                🔄
              </button>
            )}
            <div className="score">{totalScore}</div>
            <div className="score-history">{
              scoreHistory?.map((x, index) => <span key={`${index} ${x}`} className={x === 100 ? 'max-score' : x === 20 ? 'min-score' : ''}>{x}{index === scoreHistory.length - 1 ? '' : `,`}</span>)
            }</div>
          </div>
        )}
      </>
    </div>
  );
}

export default App;

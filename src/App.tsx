import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import "./App.css";
import shuffle from "es-toolkit/compat/shuffle";
import clsx from "clsx";
import { Howl } from "howler";

const useSoundManager = () => {
  const sounds = useRef<{ [key: string]: Howl | null }>({
    flip: null,
    match: null,
    unmatch: null,
  });

  useEffect(() => {
    sounds.current.flip = new Howl({ src: ["sounds/flip.mp3"] });
    sounds.current.match = new Howl({ src: ["sounds/match.mp3"] });
    sounds.current.unmatch = new Howl({ src: ["sounds/unmatch.mp3"] });

    const currentSounds = sounds.current;

    return () => {
      Object.values(currentSounds).forEach((s) => s?.unload());
    };
  }, []);

  const playSound = (name: "flip" | "unmatch" | "match") => {
    sounds.current[name]?.play();
  };

  return { playSound };
};

const ONE_SECOND = 1000;
const DELAY_TIME = 0.5 * ONE_SECOND;
const GRID_SIZE = 6;

function App() {
  const [selected, setSelected] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [isDelay, setIsDelay] = useState(false);
  const [key, setKey] = useState(1);
  const [isMatch, setIsMatch] = useState(false);
  const [isUnMatch, setIsUnMatch] = useState(false);

  const grid = useMemo(() => {
    const n = GRID_SIZE ** 2;
    const arr = new Array(n).fill(key);

    for (let i = 0; i < n / 2; i++) {
      arr[i] = i + 1;
      arr[n / 2 + i] = i + 1;
    }

    return shuffle(arr);
  }, [key]);

  const { playSound } = useSoundManager();

  const onSelect = (index: number) => {
    const newSelected = selected.length < 2 ? [...selected, index] : [index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setIsDelay(true);

      const [first, second] = newSelected;
      if (grid[first] === grid[second]) {
        setIsMatch(true);
        playSound("match");

        setTimeout(() => {
          setSolved((prev) => [...prev, first, second]);
          setIsDelay(false);
          setIsMatch(false);
        }, DELAY_TIME);
      } else {
        setIsUnMatch(true);
        playSound("unmatch");

        setTimeout(() => {
          setSelected([]);
          setIsDelay(false);
          setIsUnMatch(false);
        }, DELAY_TIME);
      }
    }
  };

  const isEnd = solved.length === grid.length && solved.length !== 0;

  return (
    <main>
      <h1>Memory game</h1>

      {!isEnd && (
        <div
          className="grid"
          inert={isDelay}
          style={{ "--col": GRID_SIZE } as CSSProperties}
        >
          {grid.map((item, i) => {
            return (
              <div
                key={i}
                className={clsx("grid__item", {
                  "grid__item--is-selected": selected.includes(i),
                  "grid__item--is-unmatch": selected.includes(i) && isUnMatch,
                  "grid__item--is-match": selected.includes(i) && isMatch,
                  "grid__item--is-solved": solved.includes(i),
                })}
                onClick={() => onSelect(i)}
              >
                <img src="/sprites/Beer.png" width={16} />
              </div>
            );
          })}
        </div>
      )}

      {isEnd && (
        <button
          onClick={() => {
            setSelected([]);
            setSolved([]);
            setKey((k) => k + 1);
          }}
        >
          Play again
        </button>
      )}
    </main>
  );
}

export default App;

import { useState, useEffect, useRef } from "react";
import "./App.css";

const SOUNDS = [
  { file: "orale-cabron.mp3", label: "Órale Cabrón", emoji: "😤" },
  {
    file: "you-boys-like-mexico.mp3",
    label: "You Boys Like Mexico?",
    emoji: "🇲🇽",
  },
  {
    file: "avocados-from-mexico.mp3",
    label: "Avocados from Mexico",
    emoji: "🥑",
  },
  { file: "tequila-airhorn.mp3", label: "Tequila Airhorn", emoji: "📯" },
  { file: "tequila-it.mp3", label: "Tequila!", emoji: "🥃" },
  { file: "this-guy-is-loco.mp3", label: "This Guy is Loco", emoji: "🤪" },
  { file: "muy-loco.mp3", label: "Muy Loco", emoji: "🌀" },
  {
    file: "mexican-or-mexicant.mp3",
    label: "Mexican or Mexican't?",
    emoji: "🎬",
  },
  { file: "spanish-lessons.mp3", label: "Spanish Lessons", emoji: "📚" },
  { file: "dont-speak-spanish.mp3", label: "Don't Speak Spanish", emoji: "🎤" },
  {
    file: "real-authentic-mexican.mp3",
    label: "Real Authentic Mexican",
    emoji: "✨",
  },
  { file: "racist-workout.mp3", label: "Racist Workout", emoji: "💪" },
  { file: "aye-papi.mp3", label: "Aye Papi", emoji: "😏" },
];

const R = 108;
const CIRC = 2 * Math.PI * R;

function fmt(sec) {
  if (sec == null) return "--:--";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function App() {
  const [running, setRunning] = useState(false);
  const [minMin, setMinMin] = useState(7);
  const [maxMin, setMaxMin] = useState(19);
  const [volume, setVolume] = useState(0.7);
  const [nextIn, setNextIn] = useState(null);
  const [total, setTotal] = useState(null);
  const [lastPlayed, setLastPlayed] = useState(null);
  const [lastPlayedAt, setLastPlayedAt] = useState(null);
  const [sinceLastSound, setSinceLastSound] = useState(null);
  const [flash, setFlash] = useState(false);
  const [noAnim, setNoAnim] = useState(false);

  const timerRef = useRef(null);
  const tickRef = useRef(null);
  const runningRef = useRef(false);
  const volRef = useRef(volume);
  const minRef = useRef(minMin);
  const maxRef = useRef(maxMin);
  const lastFileRef = useRef(null);

  volRef.current = volume;
  minRef.current = minMin;
  maxRef.current = maxMin;

  function fireSound() {
    const pool = SOUNDS.filter((s) => s.file !== lastFileRef.current);
    const s = pool[Math.floor(Math.random() * pool.length)];
    lastFileRef.current = s.file;
    const audio = new Audio(`./resources/${s.file}`);
    audio.volume = volRef.current;
    audio.play().catch(() => {});
    setLastPlayed(s);
    setLastPlayedAt(Date.now());
    setSinceLastSound(0);
    setFlash(true);
    setTimeout(() => setFlash(false), 1800);
  }

  function scheduleNext() {
    const minSec = minRef.current * 60;
    const maxSec = maxRef.current * 60;
    const delay = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
    const target = Date.now() + delay * 1000;

    // Snap ring back to full instantly, then re-enable transitions
    setNoAnim(true);
    setTotal(delay);
    setNextIn(delay);
    requestAnimationFrame(() => requestAnimationFrame(() => setNoAnim(false)));

    clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setNextIn(Math.max(0, Math.ceil((target - Date.now()) / 1000)));
    }, 250);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      clearInterval(tickRef.current);
      if (runningRef.current) {
        fireSound();
        scheduleNext();
      }
    }, delay * 1000);
  }

  function handleStart() {
    runningRef.current = true;
    setRunning(true);
    scheduleNext();
  }

  function handlePause() {
    runningRef.current = false;
    setRunning(false);
    clearTimeout(timerRef.current);
    clearInterval(tickRef.current);
    setNextIn(null);
    setTotal(null);
  }

  function handlePlayNow() {
    fireSound();
    if (runningRef.current) {
      clearTimeout(timerRef.current);
      clearInterval(tickRef.current);
      scheduleNext();
    }
  }

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      clearInterval(tickRef.current);
    },
    [],
  );

  useEffect(() => {
    if (lastPlayedAt == null) return;
    const id = setInterval(() => {
      setSinceLastSound(Math.floor((Date.now() - lastPlayedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [lastPlayedAt]);

  const progress = total && nextIn != null ? nextIn / total : running ? 1 : 0;
  const dashOffset = CIRC * (1 - progress);
  const ringColor = flash
    ? "var(--gold)"
    : running
      ? "var(--red)"
      : "var(--muted)";
  const transition = noAnim
    ? "stroke 0.3s"
    : "stroke-dashoffset 0.25s linear, stroke 0.4s";

  return (
    <div className="app">
      <header>
        <div className="wordmark">
          🇲🇽🌮 MEXICOBAR 🇲🇽🌮<span>ayy papi</span>
        </div>
        <p className="sub">🌶️ sounds you didn't ask for 🌶️</p>
      </header>

      <div className={`ring-wrap ${flash ? "ring-flash" : ""}`}>
        <svg viewBox="0 0 260 260" width="260" height="260" aria-hidden>
          <circle
            cx="130"
            cy="130"
            r={R}
            fill="none"
            stroke="var(--surf2)"
            strokeWidth="5"
          />
          <circle
            cx="130"
            cy="130"
            r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 130 130)"
            style={{ transition }}
          />
        </svg>

        <div className="ring-inner">
          {flash && lastPlayed ? (
            <div className="ring-flash-inner">
              <span className="big-emoji">{lastPlayed.emoji}</span>
              <span className="flash-name">{lastPlayed.label}</span>
            </div>
          ) : (
            <>
              <div className="countdown">{fmt(nextIn)}</div>
              <div className="cdown-label">
                {running ? "next sound in" : nextIn ? "paused" : "ready"}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="btns">
        <button
          className={`btn-main ${running ? "pausing" : ""}`}
          onClick={running ? handlePause : handleStart}
          disabled={minMin >= maxMin}
        >
          {running ? "⏸ Pause" : "▶ Start"}
        </button>
        <button className="btn-ghost" onClick={handlePlayNow}>
          🎲 Play now
        </button>
      </div>

      <div className="panel">
        <div className="panel-row">
          <span className="plabel">Interval</span>
          <div className="interval-inputs">
            <input
              type="number"
              className="numinput"
              value={minMin}
              min={1}
              max={maxMin - 1}
              onChange={(e) =>
                setMinMin(
                  Math.max(1, Math.min(+e.target.value || 1, maxMin - 1)),
                )
              }
            />
            <span className="dash">–</span>
            <input
              type="number"
              className="numinput"
              value={maxMin}
              min={minMin + 1}
              max={180}
              onChange={(e) =>
                setMaxMin(
                  Math.max(
                    minMin + 1,
                    Math.min(+e.target.value || minMin + 1, 180),
                  ),
                )
              }
            />
            <span className="unit">min</span>
          </div>
        </div>

        <div className="panel-row">
          <span className="plabel">Volume</span>
          <div className="vol-row">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(+e.target.value)}
              className="slider"
              style={{ "--pct": `${volume * 100}%` }}
            />
            <span className="vol-val">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="last-row">
        {lastPlayed ? (
          <>
            <div className="lp-left">
              <span className="lp-tag">last played</span>
              <span className="lp-name">
                {lastPlayed.emoji} {lastPlayed.label}
              </span>
            </div>
            <div className="lp-since">
              <span className="lp-since-val">{fmt(sinceLastSound)}</span>
              <span className="lp-tag">ago</span>
            </div>
          </>
        ) : (
          <span className="lp-tag">no sounds played yet</span>
        )}
      </div>

      <div className="sounds-section">
        <div className="sounds-header">{SOUNDS.length} sounds in rotation</div>
        <div className="sounds-grid">
          {SOUNDS.map((s) => (
            <div
              key={s.file}
              className={`chip ${lastPlayed?.file === s.file ? "chip-lit" : ""}`}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

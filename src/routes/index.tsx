import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  band,
  CRIB,
  ITEMS,
  read,
  SCALES,
  score,
  type Mark,
} from "@/lib/inventory";

export const Route = createFileRoute("/")({ component: Home });

const STORAGE_KEY = "minnesota-practice-v1";

type Phase = "cover" | "book" | "profile" | "crib";

type Save = {
  phase: Phase;
  index: number;
  answers: Record<number, Mark>;
};

const EMPTY: Save = { phase: "cover", index: 0, answers: {} };

function loadSave(): Save {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Save;
    if (!parsed || typeof parsed.index !== "number" || !parsed.answers) return EMPTY;
    return {
      phase: parsed.phase ?? "cover",
      index: Math.min(Math.max(0, parsed.index), ITEMS.length - 1),
      answers: parsed.answers,
    };
  } catch {
    return EMPTY;
  }
}

function Home() {
  const [save, setSave] = useState<Save>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSave(loadSave());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  }, [save, ready]);

  function reset() {
    setSave(EMPTY);
  }

  return (
    <main data-ready={ready ? "true" : "false"} className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-6 pt-8 pb-24">
        <Header phase={save.phase} index={save.index} onCover={() => setSave((s) => ({ ...s, phase: "cover" }))} />
        {save.phase === "cover" && (
          <Cover
            ready={ready}
            onStart={() => {
              if (!ready) return;
              setSave((s) => ({ ...s, phase: "book", index: 0 }));
            }}
            onCrib={() => {
              if (!ready) return;
              setSave((s) => ({ ...s, phase: "crib" }));
            }}
          />
        )}
        {save.phase === "book" && (
          <Book
            index={save.index}
            answers={save.answers}
            onMark={(mark) => {
              const item = ITEMS[save.index];
              const answers = { ...save.answers, [item.id]: mark };
              const last = save.index >= ITEMS.length - 1;
              setSave({
                phase: last ? "profile" : "book",
                index: last ? save.index : save.index + 1,
                answers,
              });
            }}
            onBack={() => {
              if (save.index === 0) {
                setSave((s) => ({ ...s, phase: "cover" }));
                return;
              }
              setSave((s) => ({ ...s, index: s.index - 1 }));
            }}
          />
        )}
        {save.phase === "profile" && (
          <Profile
            answers={save.answers}
            onAgain={reset}
            onCrib={() => setSave((s) => ({ ...s, phase: "crib" }))}
          />
        )}
        {save.phase === "crib" && (
          <Crib
            onBack={() =>
              setSave((s) => ({
                ...s,
                phase: Object.keys(s.answers).length >= ITEMS.length ? "profile" : "cover",
              }))
            }
          />
        )}
      </div>
    </main>
  );
}

function Header({
  phase,
  index,
  onCover,
}: {
  phase: Phase;
  index: number;
  onCover: () => void;
}) {
  return (
    <header className="mb-8 flex items-baseline justify-between border-b border-rule pb-3">
      <button
        type="button"
        onClick={onCover}
        className="font-sans text-xs tracking-widest text-mist uppercase"
      >
        Minnesota Practice
      </button>
      <p className="text-xs text-mist tabular-nums">
        {phase === "book" ? `${index + 1} of ${ITEMS.length}` : "16 lines"}
      </p>
    </header>
  );
}

function Cover({
  ready,
  onStart,
  onCrib,
}: {
  ready: boolean;
  onStart: () => void;
  onCrib: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col">
      <p className="text-xs tracking-widest text-mist uppercase">Short form</p>
      <h1 className="mt-3 font-serif text-5xl leading-tight tracking-tight">
        Minnesota
        <br />
        Practice
      </h1>
      <p className="mt-6 max-w-sm text-base leading-relaxed text-mist">
        Sixteen original true or false lines, so you can rehearse the booklet
        before a real sitting. Answer for the past few weeks.
      </p>
      <div className="mt-10 flex flex-col gap-3">
        <button
          type="button"
          onClick={onStart}
          disabled={!ready}
          className="h-12 bg-lake px-6 text-on-lake disabled:opacity-60"
        >
          Open booklet
        </button>
        <button
          type="button"
          onClick={onCrib}
          className="h-12 border border-rule bg-sheet px-6 text-ink"
        >
          Scale names
        </button>
      </div>
      <p className="mt-8 text-sm leading-relaxed text-mist">
        Not the MMPI. Not a diagnosis. Raw counts, not T-scores.
      </p>
    </section>
  );
}

function Book({
  index,
  answers,
  onMark,
  onBack,
}: {
  index: number;
  answers: Record<number, Mark>;
  onMark: (mark: Mark) => void;
  onBack: () => void;
}) {
  const item = ITEMS[index];
  const chosen = answers[item.id];
  const progress = index / ITEMS.length;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const key = event.key.toLowerCase();
      if (key === "t") onMark("T");
      else if (key === "f") onMark("F");
      else if (key === "p") onMark("?");
      else if (key === "arrowleft") onBack();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onMark, onBack]);

  return (
    <section className="flex flex-1 flex-col">
      <div className="mb-8 h-1 w-full bg-rule">
        <div
          className="h-full w-full origin-left bg-lake transition-transform duration-200"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      <p className="text-xs tracking-widest text-mist uppercase tabular-nums">
        Item {item.id}
      </p>
      <h2 className="mt-4 font-serif text-3xl leading-snug tracking-tight">
        {item.text}
      </h2>
      <div className="mt-10 grid grid-cols-2 gap-3">
        <Choice label="True" mark="T" chosen={chosen} onMark={onMark} />
        <Choice label="False" mark="F" chosen={chosen} onMark={onMark} />
      </div>
      <button
        type="button"
        onClick={() => onMark("?")}
        className="mt-3 h-12 text-sm text-mist"
        aria-pressed={chosen === "?"}
      >
        Pass
      </button>
      <div className="mt-auto flex items-end justify-between pt-10">
        <button type="button" onClick={onBack} className="h-11 text-sm text-mist">
          Back
        </button>
        <p className="text-xs text-mist">T · F · P</p>
      </div>
    </section>
  );
}

function Choice({
  label,
  mark,
  chosen,
  onMark,
}: {
  label: string;
  mark: Mark;
  chosen: Mark | undefined;
  onMark: (mark: Mark) => void;
}) {
  const active = chosen === mark;
  return (
    <button
      type="button"
      onClick={() => onMark(mark)}
      aria-pressed={active}
      className={
        active
          ? "h-14 bg-lake text-on-lake"
          : "h-14 border border-rule bg-sheet text-ink"
      }
    >
      {label}
    </button>
  );
}

function Profile({
  answers,
  onAgain,
  onCrib,
}: {
  answers: Record<number, Mark>;
  onAgain: () => void;
  onCrib: () => void;
}) {
  const profile = score(answers);
  const lines = read(profile);

  return (
    <section className="flex flex-1 flex-col">
      <p className="text-xs tracking-widest text-mist uppercase">Practice profile</p>
      <h2 className="mt-3 font-serif text-4xl leading-tight tracking-tight">
        What rose
      </h2>
      <div className="mt-6 flex gap-6 text-sm text-mist tabular-nums">
        <p>Passed {profile.blank}</p>
        <p>Contradictions {profile.clash}</p>
      </div>
      {profile.clashPairs.length > 0 && (
        <p className="mt-2 text-sm text-mist">
          Both true:{" "}
          {profile.clashPairs.map(([a, b]) => `${a} & ${b}`).join(", ")}
        </p>
      )}
      <ul className="mt-8 flex flex-col gap-4">
        {SCALES.map((scale) => {
          const n = profile.counts[scale.id];
          const m = profile.max[scale.id];
          const level = band(n, m);
          const pct = m === 0 ? 0 : Math.round((n / m) * 100);
          return (
            <li key={scale.id} className="flex items-center gap-3">
              <div className="w-24 shrink-0">
                <p className="text-sm">{scale.name}</p>
                <p className="text-xs text-mist">{scale.cousin}</p>
              </div>
              <div className="h-1 flex-1 bg-rule">
                <div className="h-full bg-lake" style={{ width: `${pct}%` }} />
              </div>
              <p className="w-14 shrink-0 text-right text-xs text-mist tabular-nums">
                {level === "quiet" ? "Quiet" : level === "mixed" ? "Mixed" : "Raised"}
              </p>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 border-t border-rule pt-6">
        {lines.map((line) => (
          <p key={line} className="mb-3 text-sm leading-relaxed">
            {line}
          </p>
        ))}
      </div>
      <div className="mt-auto flex flex-col gap-3 pt-8">
        <button type="button" onClick={onAgain} className="h-12 bg-lake px-6 text-on-lake">
          Start over
        </button>
        <button
          type="button"
          onClick={onCrib}
          className="h-12 border border-rule bg-sheet px-6 text-ink"
        >
          Scale names
        </button>
      </div>
    </section>
  );
}

function Crib({ onBack }: { onBack: () => void }) {
  return (
    <section className="flex flex-1 flex-col">
      <p className="text-xs tracking-widest text-mist uppercase">Score report</p>
      <h2 className="mt-3 font-serif text-4xl leading-tight tracking-tight">
        Scale names
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-mist">
        Names you will see on a real Minnesota report. This booklet only scores
        seven cousins of them: L, F, D, Hs, Pa, Si, Ma.
      </p>
      <ul className="mt-8 flex flex-col">
        {CRIB.map(([code, name, gloss]) => (
          <li key={code} className="grid grid-cols-12 gap-3 border-t border-rule py-3">
            <p className="col-span-2 text-sm tabular-nums">{code}</p>
            <div className="col-span-10">
              <p className="text-sm">{name}</p>
              <p className="text-sm text-mist">{gloss}</p>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onBack}
        className="mt-8 h-12 border border-rule bg-sheet px-6 text-ink"
      >
        Back
      </button>
    </section>
  );
}

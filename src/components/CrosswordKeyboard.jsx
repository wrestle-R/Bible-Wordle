import { FiCheck, FiDelete } from "react-icons/fi";

const letterRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

const keyClassName =
  "flex min-w-0 touch-manipulation select-none items-center justify-center rounded-md border border-border bg-card font-semibold text-foreground shadow-sm transition-colors active:scale-[0.97] active:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function CrosswordKeyboard({ onKeyPress }) {
  return (
    <section
      aria-label="Crossword keyboard"
      className="crossword-mobile-keyboard fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-1.5 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_oklch(0.15_0.02_285/0.12)] backdrop-blur-xl md:hidden"
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2 px-0.5 pb-0.5">
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            Tap a square, then enter letters
          </span>
          <span className="shrink-0 text-[11px] text-muted-foreground">Enter checks</span>
        </div>

        {letterRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`grid gap-1 ${rowIndex === 1 ? "mx-[4.5%]" : ""}`}
            style={{
              gridTemplateColumns:
                rowIndex === 2
                  ? "1.35fr repeat(7, minmax(0, 1fr)) 1.35fr"
                  : `repeat(${row.length}, minmax(0, 1fr))`,
            }}
          >
            {rowIndex === 2 && (
              <button
                type="button"
                aria-label="Check answers"
                onClick={() => onKeyPress("ENTER")}
                className={`${keyClassName} h-10 bg-secondary text-[11px] sm:h-11`}
              >
                <FiCheck aria-hidden="true" />
              </button>
            )}
            {row.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => onKeyPress(letter)}
                className={`${keyClassName} h-10 text-[13px] sm:h-11 sm:text-sm`}
              >
                {letter}
              </button>
            ))}
            {rowIndex === 2 && (
              <button
                type="button"
                aria-label="Delete letter"
                onClick={() => onKeyPress("BACKSPACE")}
                className={`${keyClassName} h-10 bg-secondary text-sm sm:h-11`}
              >
                <FiDelete aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

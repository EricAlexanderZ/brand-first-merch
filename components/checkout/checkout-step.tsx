"use client";

type CheckoutStepProps = {
  stepNumber: number;
  title: string;
  isOpen: boolean;
  isComplete?: boolean;
  isLocked?: boolean;
  keepMounted?: boolean;
  /** One line shown under the title once the step is done and closed. */
  summary?: string;
  onToggle?: () => void;
  children?: React.ReactNode;
  id?: string;
};

export default function CheckoutStep({
  stepNumber,
  title,
  isOpen,
  isComplete = false,
  isLocked = false,
  keepMounted = false,
  summary,
  onToggle,
  children,
  id,
}: CheckoutStepProps) {
  return (
    <div id={id} className="overflow-hidden rounded-[1.25rem] border border-black/10 bg-white">
      <button
        type="button"
        onClick={isLocked ? undefined : onToggle}
        className={`flex w-full items-center justify-between px-5 py-4 text-left ${
          isLocked ? "cursor-not-allowed opacity-60" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              isComplete || isOpen
                ? "bg-[#e5b43d] text-black"
                : "bg-[#efefef] text-gray-500"
            }`}
          >
            {stepNumber}
          </div>

          <span className="min-w-0">
            <span className="block text-lg font-semibold text-black">{title}</span>
            {summary && isComplete && !isOpen && (
              <span className="block truncate text-sm text-gray-500">{summary}</span>
            )}
          </span>
        </div>

        {isComplete && !isOpen ? (
          <span className="shrink-0 text-sm font-semibold text-[#13294b] underline">Edit</span>
        ) : (
          <span className="text-gray-400">{isOpen ? "⌃" : "⌄"}</span>
        )}
      </button>

      {keepMounted ? (
        <div className={`border-t border-black/10 px-5 py-5 ${isOpen ? "" : "hidden"}`}>
          {children}
        </div>
      ) : isOpen ? (
        <div className="border-t border-black/10 px-5 py-5">
          {children}
        </div>
      ) : null}
    </div>
  );
}

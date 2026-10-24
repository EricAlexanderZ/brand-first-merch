"use client";

import { useRef, useState, type DragEvent } from "react";

type Props = {
  title: string;
  subtitle: string;
  buttonLabel?: string;
  helpText?: string;
  onUploaded?: (url: string) => void;
};

const ACCEPT = ".png,.jpg,.jpeg,.webp,.pdf,.ai,.eps,.svg";

/** Browsers can draw these; .pdf, .ai and .eps get a file badge instead. */
function isPreviewable(file: File) {
  return /^image\/(png|jpe?g|webp|svg\+xml)$/.test(file.type);
}

export default function ArtworkUpload({
  title,
  subtitle,
  buttonLabel = "Upload artwork",
  helpText = "PNG, JPG, PDF, AI, EPS or SVG, up to 10 MB",
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus]     = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [preview, setPreview]   = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError]       = useState("");

  async function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10 MB.");
      return;
    }
    setFileName(file.name);
    setFileSize(`${(file.size / 1024 / 1024).toFixed(2)} MB`);
    // A thumbnail lets the customer see at a glance that the right logo went up.
    setPreview(isPreviewable(file) ? URL.createObjectURL(file) : "");
    setStatus("uploading");
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Upload failed. Please try again.");
      setStatus("done");
      onUploaded?.(data.url);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }
  }

  function handleRemove() {
    if (preview) URL.revokeObjectURL(preview);
    setStatus("idle");
    setFileName("");
    setFileSize("");
    setPreview("");
    setError("");
    onUploaded?.("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const ext = fileName.split(".").pop()?.toUpperCase() ?? "";

  return (
    <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
      <div className="text-center">
        <p className="text-xl font-bold">{title}</p>
        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
      </div>

      {status === "idle" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`mt-6 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
            dragging ? "border-[#e5b43d] bg-[#fff8e7]" : "border-black/10"
          }`}
        >
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full bg-[#e5b43d] px-8 py-3 text-sm font-bold text-black transition hover:brightness-95"
          >
            {buttonLabel}
          </button>
          <p className="mt-3 hidden text-sm text-gray-500 sm:block">or drag your file here</p>
          <p className="mt-2 text-xs text-gray-400">{helpText}</p>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}

      {status === "uploading" && (
        <div className="mt-6 text-center text-sm text-gray-500">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#e5b43d] border-t-transparent" />
          <p className="mt-3">Uploading {fileName}…</p>
        </div>
      )}

      {(status === "done" || status === "error") && (
        <div className="mt-6 mx-auto flex max-w-md items-center justify-between gap-4 rounded-2xl bg-[#f8f8f8] px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {preview ? (
              // An object URL of the customer's own file; next/image cannot optimise it.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Your artwork" className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain p-1" />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-gray-500">
                {ext || "FILE"}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {status === "done" && <span className="text-green-500">✓</span>}
                <p className="truncate text-sm font-semibold">{fileName}</p>
              </div>
              <p className="text-xs text-gray-500">{status === "done" ? `Uploaded · ${fileSize}` : fileSize}</p>
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 text-sm font-semibold text-red-500"
          >
            {status === "error" ? "Try again" : "Remove"}
          </button>
        </div>
      )}
    </div>
  );
}

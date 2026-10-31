"use client";

import { useState } from "react";

const OPTIONS = [
  { value: "new",  label: "Following up" },
  { value: "won",  label: "Won" },
  { value: "lost", label: "Lost" },
];

/** Won/lost picker for a lead. Saves on change; either one stops follow-up texts. */
export default function LeadStatus({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function change(next: string) {
    const previous = value;
    setValue(next);
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      setValue(previous);
      setError("Not saved");
    }
  }

  return (
    <div className="text-right">
      <select
        value={value}
        onChange={(e) => change(e.target.value)}
        disabled={saving}
        aria-label="Lead status"
        className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
          value === "won"
            ? "border-green-200 bg-green-50 text-green-700"
            : value === "lost"
              ? "border-gray-200 bg-gray-50 text-gray-500"
              : "border-[#e3b33d] bg-[#fff8e7] text-[#13294b]"
        }`}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

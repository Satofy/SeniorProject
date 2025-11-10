import React from 'react'
import type { StageFormData } from "./stage-step-one";

const formats = [
  { id: "single-elimination", name: "Single Elimination" },
  { id: "double-elimination", name: "Double Elimination" },
  { id: "round-robin", name: "Round Robin" },
  { id: "swiss-round", name: "Swiss Round" },
  { id: "battle-royal", name: "Battle Royal" },
  { id: "custom", name: "Custom Stage" },
];

export function StageStepTwo({
  formData,
  setFormData,
}: {
  formData: StageFormData;
  setFormData: (d: StageFormData) => void;
}) {
  return (
    <div className="p-4 border rounded grid gap-3">
      {formats.map((f) => (
        <button
          key={f.id}
          onClick={() => setFormData({ ...formData, formatType: f.id })}
          className={`text-left p-3 rounded border ${
            formData.formatType === f.id
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <div className="font-medium">{f.name}</div>
          <div className="text-xs text-muted-foreground">{f.id}</div>
        </button>
      ))}
    </div>
  );
}

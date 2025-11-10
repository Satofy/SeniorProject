import React from 'react'

export interface StageFormData {
  stageName: string;
  participants: string;
  groups: string;
  qualifiers: string;
  formatType: string;
}

export function StageStepOne({
  formData,
  setFormData,
}: {
  formData: StageFormData;
  setFormData: (d: StageFormData) => void;
}) {
  return (
    <div className="p-4 border rounded space-y-3">
      <div>
        <label className="text-sm">Stage Name</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={formData.stageName}
          onChange={(e) =>
            setFormData({ ...formData, stageName: e.target.value })
          }
        />
      </div>
      <div>
        <label className="text-sm">Participants</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={formData.participants}
          onChange={(e) =>
            setFormData({ ...formData, participants: e.target.value })
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Groups</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={formData.groups}
            onChange={(e) =>
              setFormData({ ...formData, groups: e.target.value })
            }
          />
        </div>
        <div>
          <label className="text-sm">Qualifiers</label>
          <input
            className="w-full border rounded px-2 py-1"
            value={formData.qualifiers}
            onChange={(e) =>
              setFormData({ ...formData, qualifiers: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}

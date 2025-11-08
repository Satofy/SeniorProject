"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StageStepTwoProps {
  formData: any
  setFormData: (data: any) => void
}

const formats = [
  {
    id: "single-elimination",
    name: "Single Elimination",
    description: "Teams are eliminated after one loss",
  },
  {
    id: "double-elimination",
    name: "Double Elimination",
    description: "Teams get a second chance in losers bracket",
  },
  {
    id: "round-robin",
    name: "Round Robin",
    description: "All teams play each other",
    selected: true,
  },
  {
    id: "swiss-round",
    name: "Swiss Round",
    description: "Teams matched by skill level",
  },
  {
    id: "battle-royal",
    name: "Battle Royal",
    description: "Free-for-all tournament format",
  },
  {
    id: "custom",
    name: "Custom Stage",
    description: "Define your own format",
  },
]

export function StageStepTwo({ formData, setFormData }: StageStepTwoProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Select Stage Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => setFormData({ ...formData, formatType: format.id })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.formatType === format.id
                  ? "border-primary bg-background/50"
                  : "border-border bg-background/20 hover:border-border/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 transition-all ${
                    formData.formatType === format.id ? "border-primary bg-primary" : "border-border"
                  }`}
                />
                <div>
                  <h3 className="font-semibold text-foreground">{format.name}</h3>
                  <p className="text-sm text-muted-foreground">{format.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

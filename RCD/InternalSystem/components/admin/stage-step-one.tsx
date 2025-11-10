"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface StageFormData {
  stageName: string;
  participants: string;
  groups: string;
  qualifiers: string;
  formatType: string;
}

interface StageStepOneProps {
  formData: StageFormData;
  setFormData: (data: StageFormData) => void;
}

export function StageStepOne({ formData, setFormData }: StageStepOneProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Stage Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="stageName" className="text-foreground">
            Stage Name
          </Label>
          <Input
            id="stageName"
            placeholder="e.g., Online Major"
            value={formData.stageName}
            onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
            className="mt-2 bg-background border-border text-foreground"
          />
        </div>

        <div>
          <Label htmlFor="participants" className="text-foreground">
            Number of Participants
          </Label>
          <Input
            id="participants"
            type="number"
            placeholder="e.g., 8"
            value={formData.participants}
            onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
            className="mt-2 bg-background border-border text-foreground"
          />
        </div>

        <div>
          <Label htmlFor="groups" className="text-foreground">
            Number of Groups
          </Label>
          <Input
            id="groups"
            type="number"
            placeholder="e.g., 1"
            value={formData.groups}
            onChange={(e) => setFormData({ ...formData, groups: e.target.value })}
            className="mt-2 bg-background border-border text-foreground"
          />
        </div>

        <div>
          <Label htmlFor="qualifiers" className="text-foreground">
            Number of Qualifiers
          </Label>
          <Input
            id="qualifiers"
            type="number"
            placeholder="e.g., 4"
            value={formData.qualifiers}
            onChange={(e) => setFormData({ ...formData, qualifiers: e.target.value })}
            className="mt-2 bg-background border-border text-foreground"
          />
        </div>
      </CardContent>
    </Card>
  )
}

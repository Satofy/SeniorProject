"use client"

import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/api"
import { toast } from "sonner"

const BAHRAIN_ONLY_REGION = "Bahrain"

const GAMES = [
  "Valorant",
  "Rocket League",
  "EA FC25",
  "eFootball",
  "Tekken 8",
  "Street Fighter 6",
  "Counter-Strike 2",
  "Dota 2",
]

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated?: () => void
}

export function TeamCreateDialog({ open, onOpenChange, onCreated }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [tag, setTag] = useState("")
  const [games, setGames] = useState<string[]>([])
  const [discord, setDiscord] = useState("")
  const [twitter, setTwitter] = useState("")
  const [twitch, setTwitch] = useState("")

  const tagValid = useMemo(() => tag.length <= 5, [tag])

  const toggleGame = (g: string) => {
    setGames((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Team name is required")
      return
    }
    if (!tagValid) {
      toast.error("Short name must be at most 5 characters")
      return
    }
    setSubmitting(true)
    try {
      await api.createTeam(name.trim(), tag.trim() || undefined, games, {
        discord: discord || undefined,
        twitter: twitter || undefined,
        twitch: twitch || undefined,
      })
      toast.success("Team created")
      onOpenChange(false)
      setName("")
      setTag("")
      setGames([])
      setDiscord("")
      setTwitter("")
      setTwitch("")
      onCreated?.()
    } catch (e: any) {
      toast.error(e?.message || "Failed to create team")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>Start your team in Bahrain and recruit players</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input id="team-name" placeholder="Enter team name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-tag">Team Short Name</Label>
              <Input
                id="team-tag"
                placeholder="e.g., RCD"
                value={tag}
                onChange={(e) => setTag(e.target.value.toUpperCase())}
                maxLength={5}
              />
              {!tagValid && <p className="text-xs text-destructive">Max 5 characters</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Games</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {GAMES.map((g) => (
                <label key={g} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={games.includes(g)} onCheckedChange={() => toggleGame(g)} />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Region</Label>
              <Input value={BAHRAIN_ONLY_REGION} disabled />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value="Manager (creator)" disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Social Media</Label>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discord">Discord</Label>
                <Input id="discord" placeholder="Server or handle" value={discord} onChange={(e) => setDiscord(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter / X</Label>
                <Input id="twitter" placeholder="@handle" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitch">Twitch</Label>
                <Input id="twitch" placeholder="channel" value={twitch} onChange={(e) => setTwitch(e.target.value)} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Optional. You can add more details later.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>{submitting ? "Creating..." : "Create Team"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

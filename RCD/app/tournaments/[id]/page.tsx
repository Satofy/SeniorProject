"use client"

import { useEffect, useState } from "react"
import { api, type Tournament } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useParams, useRouter } from "next/navigation"
import { Trophy, Calendar, Users, ArrowLeft, DollarSign, Gamepad2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TournamentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isTeamManager, isPlayer } = useAuth()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const data = await api.getTournament(params.id as string)
        setTournament(data)
      } catch (error) {
        toast.error("Failed to load tournament")
        router.push("/tournaments")
      } finally {
        setLoading(false)
      }
    }

    fetchTournament()
  }, [params.id, router])

  const handleRegister = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (isTeamManager && !selectedTeamId) {
      toast.error("Please select a team")
      return
    }

    setRegistering(true)
    try {
      await api.registerForTournament(params.id as string, isTeamManager ? selectedTeamId : undefined)
      toast.success("Successfully registered for tournament!")
      setShowRegisterDialog(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to register")
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tournament) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tournaments
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-3xl">{tournament.title}</CardTitle>
                <Badge
                  variant={
                    tournament.status === "upcoming"
                      ? "default"
                      : tournament.status === "ongoing"
                        ? "secondary"
                        : "outline"
                  }
                  className="text-sm"
                >
                  {tournament.status}
                </Badge>
              </div>
              <CardDescription className="text-base">
                {tournament.description || "No description available"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-semibold">
                      {new Date(tournament.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {tournament.game && (
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Gamepad2 className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Game</p>
                      <p className="font-semibold">{tournament.game}</p>
                    </div>
                  </div>
                )}
                {tournament.maxParticipants && (
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Participants</p>
                      <p className="font-semibold">
                        {tournament.currentParticipants || 0} / {tournament.maxParticipants}
                      </p>
                    </div>
                  </div>
                )}
                {tournament.prizePool && (
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Prize Pool</p>
                      <p className="font-semibold">{tournament.prizePool}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Tournament Type</h3>
                <Badge variant="outline">{tournament.type}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <>
                  {tournament.status === "upcoming" ? (
                    <Button onClick={() => setShowRegisterDialog(true)} className="w-full" size="lg">
                      <Trophy className="w-4 h-4 mr-2" />
                      Register Now
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      Registration is {tournament.status === "ongoing" ? "closed" : "not available"}
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">Sign in to register for this tournament</p>
                  <Button asChild className="w-full" size="lg">
                    <a href="/login">Sign In</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Tournament Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">{tournament.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium">{tournament.type}</span>
              </div>
              {tournament.maxParticipants && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slots Available</span>
                  <span className="font-medium">
                    {tournament.maxParticipants - (tournament.currentParticipants || 0)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Register Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register for Tournament</DialogTitle>
            <DialogDescription>
              {isTeamManager
                ? "Select which team you want to register for this tournament"
                : "Confirm your registration for this tournament"}
            </DialogDescription>
          </DialogHeader>
          {isTeamManager && (
            <div className="py-4">
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team-1">Your Team Name</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Team selection will be populated from your actual teams
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegisterDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegister} disabled={registering}>
              {registering ? "Registering..." : "Confirm Registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

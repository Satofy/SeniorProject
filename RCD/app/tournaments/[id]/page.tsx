"use client"

import { useEffect, useState } from "react"
import { api, type Tournament, type Bracket } from "@/lib/api";
import { BracketViewer } from "@/components/bracket-viewer";
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useParams, useRouter } from "next/navigation"
import { Trophy, Calendar, Users, ArrowLeft, DollarSign, Gamepad2, Award } from "lucide-react"
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
  const rawParams = useParams();
  const id = (rawParams as any)?.id as string | undefined;
  const router = useRouter()
  const { user, isTeamManager, isPlayer } = useAuth()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [starting, setStarting] = useState(false);
  const [format, setFormat] = useState<"single" | "double">("single");
  const [managerTeams, setManagerTeams] = useState<Array<{id:string; name:string}>>([]);
  const [ending, setEnding] = useState(false);
  const [teamNames, setTeamNames] = useState<Record<string, string>>({});
  const [isCaptain, setIsCaptain] = useState(false);

  // Load teams for team manager picker
  useEffect(() => {
    if (user && isTeamManager) {
      api.getTeams().then(all => {
        const owned = all.filter(t => t.managerId === user.id).map(t => ({ id: t.id, name: t.name }));
        setManagerTeams(owned);
      }).catch(() => {});
    }
  }, [user, isTeamManager]);

  // Load all teams for mapping payout summary
  useEffect(() => {
    api.getTeams().then(all => {
      const map: Record<string,string> = {};
      all.forEach(t => { map[t.id] = t.name; });
      setTeamNames(map);
    }).catch(() => {});
  }, []);

  // Determine if current user is a captain of their team
  useEffect(() => {
    if (!user?.teamId) { setIsCaptain(false); return; }
    api.getTeam(user.teamId).then(t => {
      setIsCaptain(!!(t.captainIds && user && t.captainIds.includes(user.id)));
    }).catch(() => setIsCaptain(false));
  }, [user]);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        if (!id) return;
        const data = await api.getTournament(id);
        setTournament(data);
        // attempt to fetch bracket if ongoing or after generation
        try {
          const b = await api.getBracket(id);
          setBracket(b);
        } catch {
          setBracket(null);
        }
      } catch (error) {
        toast.error("Failed to load tournament");
        router.push("/tournaments");
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id, router]);

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
  if (!id) return;
  await api.registerForTournament(
    id,
    isTeamManager ? selectedTeamId : (isCaptain && user.teamId ? user.teamId : undefined)
  );
      toast.success("Successfully registered for tournament!")
      setShowRegisterDialog(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to register")
    } finally {
      setRegistering(false)
    }
  }

  const handleStart = async () => {
    if (!id) return;
    setStarting(true);
    try {
      const b = await api.startTournament(id, format);
      setBracket(b);
      toast.success(`Tournament started with ${b.kind} elimination`);
      // refresh tournament status
      const data = await api.getTournament(id);
      setTournament(data);
    } catch (e: any) {
      toast.error(e?.message || "Failed to start tournament");
    } finally {
      setStarting(false);
    }
  };

  const canEndTournament = (() => {
    if (!bracket) return false;
    if (bracket.kind === "single") {
      const rounds = bracket.rounds.winners;
      if (!rounds?.length) return false;
      const finalMatch = rounds[rounds.length - 1].matches.slice(-1)[0];
      return !!finalMatch && finalMatch.status === "completed";
    } else {
      const gm = bracket.rounds.grand?.[0]?.matches?.[0];
      return !!gm && gm.status === "completed";
    }
  })();

  const handleEnd = async () => {
    if (!id) return;
    setEnding(true);
    try {
      const payout = await api.endTournament(id);
      const summary = payout.awards
        .map((a) => `${teamNames[a.teamId] || a.teamId}: $${a.amount.toFixed(2)}`)
        .join("\n");
      toast.success(`Payout distributed ($${payout.total.toFixed(2)}):\n${summary}`);
      const data = await api.getTournament(id);
      setTournament(data);
    } catch (e: any) {
      toast.error(e?.message || "Failed to end tournament");
    } finally {
      setEnding(false);
    }
  };

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
                      <p className="text-sm text-muted-foreground">
                        Participants
                      </p>
                      <p className="font-semibold">
                        {tournament.currentParticipants || 0} /{" "}
                        {tournament.maxParticipants}
                      </p>
                    </div>
                  </div>
                )}
                {tournament.prizePool && (
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Prize Pool
                      </p>
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

          {/* Bracket Section (live viewer) */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Bracket</CardTitle>
              <CardDescription>
                {bracket ? `${bracket.kind} elimination` : "Bracket will appear after the tournament starts"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BracketViewer tournamentId={id!} initial={bracket} isAdmin={user?.role === "admin"} />
            </CardContent>
          </Card>

          {tournament.payout && (
            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Payout Summary</CardTitle>
                  <CardDescription>
                    Distributed ${tournament.payout.total.toFixed(2)} on {new Date(tournament.payout.timestamp).toLocaleString()}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="text-muted-foreground border-b">
                        <th className="text-left py-2 pr-4">Place</th>
                        <th className="text-left py-2 pr-4">Team</th>
                        <th className="text-left py-2 pr-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tournament.payout.awards.map((a: { place: number; teamId: string; amount: number }) => (
                        <tr key={`${a.place}-${a.teamId}`} className="border-b last:border-0">
                          <td className="py-1 pr-4 font-medium">{a.place}</td>
                          <td className="py-1 pr-4">{teamNames[a.teamId] || a.teamId}</td>
                          <td className="py-1 pr-4">${a.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
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
                    <Button
                      onClick={() => setShowRegisterDialog(true)}
                      className="w-full"
                      size="lg"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Register Now
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      Registration is{" "}
                      {tournament.status === "ongoing"
                        ? "closed"
                        : "not available"}
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Sign in to register for this tournament
                  </p>
                  <Button asChild className="w-full" size="lg">
                    <a href="/login">Sign In</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Controls */}
          {user && user.role === "admin" && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Admin Controls</CardTitle>
                <CardDescription>
                  Start the tournament and generate the bracket. When the final is complete, distribute prizes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">Format</div>
                <div className="flex gap-2">
                  <Button
                    variant={format === "single" ? "default" : "outline"}
                    onClick={() => setFormat("single")}
                  >
                    Single Elim
                  </Button>
                  <Button
                    variant={format === "double" ? "default" : "outline"}
                    onClick={() => setFormat("double")}
                  >
                    Double Elim
                  </Button>
                </div>
                <Button
                  className="w-full mt-2"
                  onClick={handleStart}
                  disabled={starting || tournament.status !== "upcoming"}
                >
                  {starting ? "Starting..." : "Start Tournament"}
                </Button>
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={handleEnd}
                  disabled={!canEndTournament || ending || !!tournament.payout}
                >
                  {ending ? "Ending..." : tournament.payout ? "Payout Distributed" : "End Tournament & Payout"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Tournament Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">
                  {tournament.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium">{tournament.type}</span>
              </div>
              {tournament.maxParticipants && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slots Available</span>
                  <span className="font-medium">
                    {tournament.maxParticipants -
                      (tournament.currentParticipants || 0)}
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
                  {managerTeams.length === 0 && (
                    <SelectItem value="" disabled>No teams found</SelectItem>
                  )}
                  {managerTeams.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Team selection will be populated from your actual teams
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRegisterDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRegister} disabled={registering}>
              {registering ? "Registering..." : "Confirm Registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

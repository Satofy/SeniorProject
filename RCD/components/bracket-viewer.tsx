"use client";
import { useEffect, useRef, useState } from "react";
import { api, type Bracket, type Match, type Team } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BracketViewerProps {
  tournamentId: string;
  initial?: Bracket | null;
  isAdmin?: boolean;
}

export function BracketViewer({ tournamentId, initial, isAdmin }: BracketViewerProps) {
  const [bracket, setBracket] = useState<Bracket | null>(initial || null);
  const [reportingMatch, setReportingMatch] = useState<Match | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [overrideMatch, setOverrideMatch] = useState<Match | null>(null);
  const [overrideWinner, setOverrideWinner] = useState<string>("");
  const score1Ref = useRef<HTMLInputElement | null>(null);
  const score2Ref = useRef<HTMLInputElement | null>(null);
  const editScore1Ref = useRef<HTMLInputElement | null>(null);
  const editScore2Ref = useRef<HTMLInputElement | null>(null);
  const [teamsById, setTeamsById] = useState<Record<string, string>>({});

  useEffect(() => {
    // fetch latest bracket if not provided
    if (!bracket) {
      api
        .getBracket(tournamentId)
        .then(setBracket)
        .catch(() => {});
    }
    const es = api.subscribeBracket(tournamentId, (b: Bracket) => {
      setBracket(b);
    });
    return () => es.close();
  }, [tournamentId]);

  // fetch teams once to show names
  useEffect(() => {
    api
      .getTeams()
      .then((all: Team[]) => {
        const map: Record<string, string> = {};
        all.forEach((t) => {
          map[t.id] = t.name;
        });
        setTeamsById(map);
      })
      .catch(() => {});
  }, []);

  const nameFor = (teamId?: string | null) => {
    if (!teamId) return "TBD";
    return teamsById[teamId] || teamId;
  };

  const beginReport = (m: Match) => {
    if (!isAdmin) return;
    setReportingMatch(m);
  };

  const submitReport = async () => {
    if (!reportingMatch) return;
    const s1 = Number(score1Ref.current?.value);
    const s2 = Number(score2Ref.current?.value);
    if (Number.isNaN(s1) || Number.isNaN(s2)) {
      toast.error("Enter numeric scores");
      return;
    }
    try {
      await api.reportMatch(tournamentId, reportingMatch.id, s1, s2);
      toast.success("Match reported");
      setReportingMatch(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to report");
    }
  };

  const performReset = async () => {
    // No longer used; kept as noop placeholder if referenced
  };

  if (!bracket) return <div className="text-sm text-muted-foreground">No bracket yet.</div>;

  return (
    <div className="overflow-x-auto">
      {(["winners", "losers", "grand"] as const).map((side) =>
        bracket.rounds[side] && bracket.rounds[side].length > 0 ? (
          <div key={side} className="mb-8">
            <h4 className="font-semibold capitalize mb-3">{side} bracket</h4>
            <div className="flex gap-6">
              {bracket.rounds[side].map((r) => (
                <div key={`${side}-r${r.round}`} className="min-w-[220px]">
                  <div className="text-xs text-muted-foreground mb-2">
                    Round {r.round}
                  </div>
                  <div className="space-y-3">
                    {r.matches.map((m) => (
                      <div
                        key={m.id}
                        className={`border rounded p-3 bg-card/60 relative ${
                          m.status === "completed" ? "opacity-70" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Match {m.index + 1}</span>
                          <Badge
                            variant={
                              m.status === "completed" ? "secondary" : "outline"
                            }
                          >
                            {m.status === "completed" ? "Completed" : "Pending"}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between">
                            <span>{nameFor(m.team1Id)}</span>
                            {typeof m.score1 === "number" && (
                              <span className="text-xs">{m.score1}</span>
                            )}
                          </div>
                          <div className="flex justify-between">
                            <span>{nameFor(m.team2Id)}</span>
                            {typeof m.score2 === "number" && (
                              <span className="text-xs">{m.score2}</span>
                            )}
                          </div>
                        </div>
                        {m.winnerId && (
                          <div className="text-xs text-primary mt-2">
                            Winner: {nameFor(m.winnerId)}
                          </div>
                        )}
                        {isAdmin &&
                          m.status !== "completed" &&
                          (m.team1Id || m.team2Id) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 w-full"
                              onClick={() => beginReport(m)}
                            >
                              Report
                            </Button>
                          )}
                        {isAdmin && m.status === "completed" && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingMatch(m)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setOverrideMatch(m);
                                setOverrideWinner(m.winnerId || "");
                              }}
                            >
                              Override
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}

      <Dialog
        open={!!reportingMatch}
        onOpenChange={(o) => !o && setReportingMatch(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Match</DialogTitle>
          </DialogHeader>
          {reportingMatch && (
            <div className="space-y-4">
              <div className="text-sm">
                {reportingMatch.team1Id || "TBD"} vs{" "}
                {reportingMatch.team2Id || "TBD"}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs mb-1 block">
                    Score {reportingMatch.team1Id || "T1"}
                  </label>
                  <Input
                    type="number"
                    ref={score1Ref}
                    min={0}
                    defaultValue={0}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block">
                    Score {reportingMatch.team2Id || "T2"}
                  </label>
                  <Input
                    type="number"
                    ref={score2Ref}
                    min={0}
                    defaultValue={0}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setReportingMatch(null)}
                >
                  Cancel
                </Button>
                <Button onClick={submitReport}>Submit</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Score Dialog */}
      <Dialog open={!!editingMatch} onOpenChange={(o) => !o && setEditingMatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Match Score</DialogTitle>
          </DialogHeader>
          {editingMatch && (
            <div className="space-y-4">
              <div className="text-sm">
                {editingMatch.team1Id || "TBD"} vs {editingMatch.team2Id || "TBD"}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs mb-1 block">
                    Score {editingMatch.team1Id || "T1"}
                  </label>
                  <Input
                    type="number"
                    ref={editScore1Ref}
                    min={0}
                    defaultValue={typeof editingMatch.score1 === "number" ? editingMatch.score1 : 0}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block">
                    Score {editingMatch.team2Id || "T2"}
                  </label>
                  <Input
                    type="number"
                    ref={editScore2Ref}
                    min={0}
                    defaultValue={typeof editingMatch.score2 === "number" ? editingMatch.score2 : 0}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingMatch(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    const s1 = Number(editScore1Ref.current?.value);
                    const s2 = Number(editScore2Ref.current?.value);
                    if (Number.isNaN(s1) || Number.isNaN(s2)) {
                      toast.error("Enter numeric scores");
                      return;
                    }
                    try {
                      await api.editMatch(tournamentId, editingMatch.id, s1, s2);
                      toast.success("Scores updated");
                      setEditingMatch(null);
                    } catch (e: any) {
                      toast.error(e?.message || "Failed to edit scores");
                    }
                  }}
                >
                  Save
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Override Winner (Admin) */}
      <Dialog open={!!overrideMatch} onOpenChange={(o) => !o && setOverrideMatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Winner (Admin)</DialogTitle>
          </DialogHeader>
          {overrideMatch && (
            <div className="space-y-4">
              <div className="text-sm">
                {overrideMatch.team1Id || "TBD"} vs {overrideMatch.team2Id || "TBD"}
              </div>
              <div>
                <label className="text-xs mb-1 block">New Winner</label>
                <Select value={overrideWinner} onValueChange={setOverrideWinner}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select winner" />
                  </SelectTrigger>
                  <SelectContent>
                    {overrideMatch.team1Id && (
                      <SelectItem value={overrideMatch.team1Id}>{nameFor(overrideMatch.team1Id)}</SelectItem>
                    )}
                    {overrideMatch.team2Id && (
                      <SelectItem value={overrideMatch.team2Id}>{nameFor(overrideMatch.team2Id)}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs mb-1 block">Score {overrideMatch.team1Id || "T1"}</label>
                  <Input type="number" min={0} defaultValue={typeof overrideMatch.score1 === "number" ? overrideMatch.score1 : 0} ref={editScore1Ref} />
                </div>
                <div>
                  <label className="text-xs mb-1 block">Score {overrideMatch.team2Id || "T2"}</label>
                  <Input type="number" min={0} defaultValue={typeof overrideMatch.score2 === "number" ? overrideMatch.score2 : 0} ref={editScore2Ref} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOverrideMatch(null)}>Cancel</Button>
                <Button
                  onClick={async () => {
                    if (!overrideWinner) {
                      toast.error("Pick a winner");
                      return;
                    }
                    const s1 = Number(editScore1Ref.current?.value);
                    const s2 = Number(editScore2Ref.current?.value);
                    try {
                      await api.overrideMatch(tournamentId, overrideMatch.id, overrideWinner, s1, s2);
                      toast.success("Winner overridden");
                      setOverrideMatch(null);
                    } catch (e: any) {
                      toast.error(e?.message || "Failed to override winner");
                    }
                  }}
                >
                  Save
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { api, type Bracket, type Match, type Team } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface BracketViewerProps {
  tournamentId: string;
  initial?: Bracket | null;
  isAdmin?: boolean;
}

export function BracketViewer({ tournamentId, initial, isAdmin }: BracketViewerProps) {
  const [bracket, setBracket] = useState<Bracket | null>(initial || null);
  const [reportingMatch, setReportingMatch] = useState<Match | null>(null);
  const [resetTarget, setResetTarget] = useState<Match | null>(null);
  const score1Ref = useRef<HTMLInputElement | null>(null);
  const score2Ref = useRef<HTMLInputElement | null>(null);
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
    if (!resetTarget) return;
    try {
      await api.resetMatch(tournamentId, resetTarget.id);
      toast.success("Match reset");
      setResetTarget(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to reset");
    }
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
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mt-2 w-full"
                            onClick={() => setResetTarget(m)}
                          >
                            Reset
                          </Button>
                        )}
                        {/* Reset Confirm Dialog */}
                        <Dialog
                          open={!!resetTarget}
                          onOpenChange={(o) => !o && setResetTarget(null)}
                        >
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Reset</DialogTitle>
                            </DialogHeader>
                            {resetTarget && (
                              <div className="space-y-4 text-sm">
                                <p>
                                  Reset match <strong>{resetTarget.id}</strong>?
                                  This will clear scores and winner. You cannot
                                  reset if the winner already propagated.
                                </p>
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    onClick={() => setResetTarget(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={performReset}
                                  >
                                    Reset
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { api, type Bracket, type Match } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface BracketViewerProps {
  tournamentId: string;
  initial?: Bracket | null;
  isAdmin?: boolean;
}

export function BracketViewer({ tournamentId, initial, isAdmin }: BracketViewerProps) {
  const [bracket, setBracket] = useState<Bracket | null>(initial || null);
  const [reportingMatch, setReportingMatch] = useState<Match | null>(null);
  const score1Ref = useRef<HTMLInputElement | null>(null);
  const score2Ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // fetch latest bracket if not provided
    if (!bracket) {
      api.getBracket(tournamentId).then(setBracket).catch(() => {});
    }
    const es = api.subscribeBracket(tournamentId, (b: Bracket) => {
      setBracket(b);
    });
    return () => es.close();
  }, [tournamentId]);

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
                  <div className="text-xs text-muted-foreground mb-2">Round {r.round}</div>
                  <div className="space-y-3">
                    {r.matches.map((m) => (
                      <div
                        key={m.id}
                        className={`border rounded p-3 bg-card/60 relative ${m.status === "completed" ? "opacity-70" : ""}`}
                      >
                        <div className="text-xs text-muted-foreground mb-1">Match {m.index + 1}</div>
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between">
                            <span>{m.team1Id || "TBD"}</span>
                            {typeof m.score1 === "number" && (
                              <span className="text-xs">{m.score1}</span>
                            )}
                          </div>
                          <div className="flex justify-between">
                            <span>{m.team2Id || "TBD"}</span>
                            {typeof m.score2 === "number" && (
                              <span className="text-xs">{m.score2}</span>
                            )}
                          </div>
                        </div>
                        {m.winnerId && (
                          <div className="text-xs text-primary mt-2">Winner: {m.winnerId}</div>
                        )}
                        {isAdmin && m.status !== "completed" && (m.team1Id || m.team2Id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 w-full"
                            onClick={() => beginReport(m)}
                          >
                            Report
                          </Button>
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

      <Dialog open={!!reportingMatch} onOpenChange={(o) => !o && setReportingMatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Match</DialogTitle>
          </DialogHeader>
          {reportingMatch && (
            <div className="space-y-4">
              <div className="text-sm">
                {reportingMatch.team1Id || "TBD"} vs {reportingMatch.team2Id || "TBD"}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs mb-1 block">Score {reportingMatch.team1Id || "T1"}</label>
                  <Input type="number" ref={score1Ref} min={0} defaultValue={0} />
                </div>
                <div>
                  <label className="text-xs mb-1 block">Score {reportingMatch.team2Id || "T2"}</label>
                  <Input type="number" ref={score2Ref} min={0} defaultValue={0} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReportingMatch(null)}>Cancel</Button>
                <Button onClick={submitReport}>Submit</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

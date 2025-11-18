"use client"

import { useEffect, useState } from "react"
import { api, type Team } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Shield,
  UserPlus,
  Check,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner"

export default function TeamDetailPage() {
  const rawParams = useParams();
  const id = (rawParams as any)?.id as string | undefined;
  const router = useRouter()
  const { user, isPlayer } = useAuth()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [myPending, setMyPending] = useState<any | null>(null);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTag, setEditTag] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  // Removal dialog state
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null)
  const [removeReason, setRemoveReason] = useState("")
  const [removingMember, setRemovingMember] = useState(false)

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        if (!id) return;
        const data = await api.getTeam(id);
        setTeam(data);
      } catch (error) {
        toast.error("Failed to load team");
        router.push("/teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [id, router]);

  // Load pending join requests (manager view) & detect user's own pending request
  useEffect(() => {
    const loadRequests = async () => {
      if (!id || !user) return;
      setLoadingRequests(true);
      try {
        const list = await api.getTeamJoinRequests(id);
        const pending = list.filter((r: any) => r.status === "pending");
        setPendingRequests(user.id === team?.managerId ? pending : []);
        setMyPending(pending.find((r: any) => r.userId === user.id) || null);
      } catch {
        setPendingRequests([]);
        setMyPending(null);
      } finally {
        setLoadingRequests(false);
      }
    };
    loadRequests();
  }, [id, user, team?.managerId, refreshToggle]);

  const handleRequestToJoin = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!id) return;
    setRequesting(true)
    try {
      await api.requestToJoinTeam(id);
      toast.success("Join request sent successfully!");
      setRefreshToggle((t) => t + 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to send join request");
    } finally {
      setRequesting(false)
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

  if (!team) {
    return null
  }

  const isManager = user?.id === team.managerId
  const isCaptain = !!(team && user && team.captainIds && team.captainIds.includes(user.id))
  const refreshRequests = () => setRefreshToggle(t => t + 1)

  const approve = async (reqId: string) => {
    if (!id) return;
    try {
      await api.approveJoinRequest(id, reqId);
      toast.success('Request approved');
      refreshRequests();
      // refresh team members
      const data = await api.getTeam(id);
      setTeam(data)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to approve');
    }
  }

  const decline = async (reqId: string) => {
    if (!id) return;
    try {
      await api.declineJoinRequest(id, reqId);
      toast.info('Request declined');
      refreshRequests();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to decline');
    }
  }

  const openProfileEditor = () => {
    if (!team) return;
    setEditName(team.name || "");
    setEditTag(team.tag || "");
    setProfileOpen(true);
  };

  const saveProfile = async () => {
    if (!id) return;
    setSavingProfile(true);
    try {
      const updated = await api.updateTeam(id, { name: editName.trim() || undefined, tag: editTag });
      setTeam(updated);
      setProfileOpen(false);
      toast.success("Team profile updated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleCaptain = async (memberId: string) => {
    if (!team) return;
    try {
      const enable = !(team.captainIds?.includes(memberId));
      const updated = await api.setTeamCaptain(team.id, memberId, enable);
      setTeam(updated);
      toast.success(enable ? "Captain assigned" : "Captain removed");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update captain");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Teams
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <CardTitle className="text-3xl flex items-center gap-3">
                    {team.name}
                    {team.tag && (
                      <Badge variant="outline" className="text-base">
                        {team.tag}
                      </Badge>
                    )}
                  </CardTitle>
                  {(isManager || isCaptain) && (
                    <Badge variant="secondary" className="mt-2">
                      <Shield className="w-3 h-3 mr-1" />
                      {isManager ? "You manage this team" : "You are a captain"}
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription className="text-base">
                {team.members?.length || 0} member
                {team.members?.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {team.gamesPlayed !== undefined && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Games Played
                    </p>
                    <p className="text-2xl font-bold">{team.gamesPlayed}</p>
                  </div>
                )}
                {team.balance !== undefined && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Team Balance
                    </p>
                    <p className="text-2xl font-bold">${team.balance}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                {team.members && team.members.length > 0 ? (
                  <div className="space-y-2">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{member.email}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {member.role}
                            {team.captainIds?.includes(member.id) && (
                              <span className="ml-2 inline-flex items-center rounded bg-primary/10 text-primary px-2 py-0.5 text-xs">Captain</span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.id === team.managerId && (
                            <Badge variant="outline">
                              <Shield className="w-3 h-3 mr-1" />
                              Manager
                            </Badge>
                          )}
                          {isManager && member.id !== team.managerId && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent"
                              onClick={() => {
                                setRemoveTargetId(member.id)
                                setRemoveReason("")
                                setShowRemoveDialog(true)
                              }}
                            >
                              Remove
                            </Button>
                          )}
                          {isManager && member.id !== team.managerId && (
                            <Button size="sm" variant="outline" className="bg-transparent" onClick={() => toggleCaptain(member.id)}>
                              {team.captainIds?.includes(member.id) ? "Remove Captain" : "Make Captain"}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No members yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Dialog open={showRemoveDialog} onOpenChange={(o) => { if (!o && !removingMember) { setShowRemoveDialog(false); setRemoveTargetId(null); setRemoveReason(""); } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove Team Member</DialogTitle>
                <DialogDescription>
                  Optionally provide a message. The member will receive a notification.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <Label htmlFor="remove-reason-team" className="text-sm">Message (optional)</Label>
                <Input
                  id="remove-reason-team"
                  value={removeReason}
                  placeholder="e.g. Roster change for next split"
                  onChange={(e) => setRemoveReason(e.target.value)}
                />
              </div>
              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" disabled={removingMember} onClick={() => { if (!removingMember) { setShowRemoveDialog(false); setRemoveTargetId(null); setRemoveReason(""); } }}>Cancel</Button>
                <Button
                  variant="destructive"
                  disabled={removingMember || !removeTargetId}
                  onClick={async () => {
                    if (!removeTargetId || !team) return;
                    setRemovingMember(true)
                    try {
                      await api.removeTeamMember(team.id, removeTargetId, removeReason.trim() || undefined)
                      const updated = await api.getTeam(team.id)
                      setTeam(updated)
                      toast.success("Member removed")
                      setShowRemoveDialog(false)
                      setRemoveTargetId(null)
                      setRemoveReason("")
                    } catch (e: any) {
                      toast.error(e?.message || "Failed to remove member")
                    } finally {
                      setRemovingMember(false)
                    }
                  }}
                >
                  {removingMember ? "Removing..." : "Remove Member"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {(isManager || isCaptain) && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Quick actions for your team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="default" onClick={openProfileEditor}>Manage Team Profile</Button>
                <Button className="w-full" variant="outline" asChild>
                  <a href="/tournaments">Schedule/Join Tournaments</a>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Join Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                isManager ? (
                  <p className="text-sm text-muted-foreground text-center">
                    You manage this team
                  </p>
                ) : user.teamId === team.id ? (
                  <p className="text-sm text-green-600 text-center font-medium">
                    You are a member of this team
                  </p>
                ) : user.teamId && user.teamId !== team.id ? (
                  <p className="text-sm text-muted-foreground text-center">
                    You are already a member of another team
                  </p>
                ) : myPending ? (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <p className="text-sm text-muted-foreground">
                      Join request pending approval
                    </p>
                  </div>
                ) : isPlayer ? (
                  <Button
                    onClick={handleRequestToJoin}
                    disabled={requesting}
                    className="w-full"
                    size="lg"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {requesting ? "Sending..." : "Request to Join"}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    Only players can join teams
                  </p>
                )
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Sign in to request to join this team
                  </p>
                  <Button asChild className="w-full" size="lg">
                    <a href="/login">Sign In</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {isManager && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>
                  Approve or decline player join requests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {loadingRequests ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : pendingRequests.length === 0 ? (
                  <p className="text-muted-foreground">No pending requests</p>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded border px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {r.user?.email || r.userId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested {new Date(r.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approve(r.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => decline(r.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshRequests}
                  className="w-full"
                >
                  Refresh Requests
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Team Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Members</span>
                <span className="font-medium">{team.members?.length || 0}</span>
              </div>
              {team.gamesPlayed !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Games Played</span>
                  <span className="font-medium">{team.gamesPlayed}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {team.createdAt
                    ? new Date(team.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Profile Editor Dialog (inline at bottom to avoid layout issues) */}
          {profileOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md rounded-lg bg-background border shadow-lg">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Edit Team Profile</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input id="team-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="team-tag">Tag</Label>
                    <Input id="team-tag" value={editTag} onChange={(e) => setEditTag(e.target.value)} placeholder="e.g. RCD" />
                  </div>
                </div>
                <div className="p-4 flex justify-end gap-2 border-t">
                  <Button variant="outline" onClick={() => setProfileOpen(false)}>Cancel</Button>
                  <Button onClick={saveProfile} disabled={savingProfile}>{savingProfile ? "Saving..." : "Save"}</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client"

import { useEffect, useState } from "react"
import { api, type Tournament } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Trophy, Users, Calendar, ArrowRight, Zap, Shield } from "lucide-react"
import { toast } from "sonner"

export default function HomePage() {
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await api.getTournaments()
        setTournaments(data.slice(0, 3))
      } catch (error) {
        toast.error("Failed to load tournaments")
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/20 via-background to-background">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="mx-auto" variant="outline">
              <Zap className="w-3 h-3 mr-1" />
              Professional Esports Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
              Compete in the{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Ultimate Esports
              </span>{" "}
              Arena
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Join tournaments, build your team, and dominate the competition. RCD Esports brings professional
              tournament management to competitive gaming.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {user ? (
                <>
                  <Button asChild size="lg" className="text-lg">
                    <Link href="/tournaments">
                      Browse Tournaments
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-lg bg-transparent">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg">
                    <Link href="/register">
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-lg bg-transparent">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose RCD Esports?</h2>
            <p className="text-muted-foreground text-lg">Everything you need for competitive gaming</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <Trophy className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Professional Tournaments</CardTitle>
                <CardDescription>
                  Compete in organized tournaments with brackets, schedules, and prize pools
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <Users className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Create and manage your team, recruit players, and compete together</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Secure Platform</CardTitle>
                <CardDescription>Role-based access control and secure authentication for all users</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Tournaments</h2>
              <p className="text-muted-foreground">Join the competition and prove your skills</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/tournaments">View All</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tournaments.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {tournaments.map((tournament) => (
                <Card
                  key={tournament.id}
                  className="border-primary/20 hover:border-primary/40 transition-colors bg-card/50 backdrop-blur"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl">{tournament.title}</CardTitle>
                      <Badge variant={tournament.status === "upcoming" ? "default" : "secondary"}>
                        {tournament.status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{tournament.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(tournament.date).toLocaleDateString()}
                    </div>
                    {tournament.prizePool && (
                      <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                        <Trophy className="w-4 h-4" />
                        {tournament.prizePool}
                      </div>
                    )}
                    <Button asChild className="w-full bg-transparent" variant="outline">
                      <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tournaments available yet</p>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-balance">Ready to Start Competing?</h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Join thousands of players in the ultimate esports experience
              </p>
              <Button asChild size="lg" className="text-lg">
                <Link href="/register">
                  Create Your Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

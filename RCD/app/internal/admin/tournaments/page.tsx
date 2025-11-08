"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { api, type Tournament } from "@/lib/api"
import { Plus, Search } from "lucide-react"

export default function InternalTournamentsPage() {
	const [items, setItems] = useState<Tournament[]>([])
	const [loading, setLoading] = useState(true)
	const [title, setTitle] = useState("")
	const [date, setDate] = useState("")
	const [type, setType] = useState("team")
	const [searchTerm, setSearchTerm] = useState("")

	const load = async () => {
		setLoading(true)
		try {
			const data = await api.getTournaments()
			setItems(data)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		load()
	}, [])

	const onCreate = async () => {
		if (!title || !date) return
		await api.createTournament({ title, date, type })
		setTitle("")
		setDate("")
		setType("team")
		await load()
	}

	const filtered = items.filter((t) => t.title.toLowerCase().includes(searchTerm.toLowerCase()))

	return (
		<div className="p-8 space-y-8">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-bold text-foreground">Tournaments</h2>
			</div>

			<Card className="border-border bg-card">
				<CardHeader>
					<CardTitle>Create Tournament</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<Label className="text-sm">Title</Label>
						<Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tournament title" />
					</div>
					<div>
						<Label className="text-sm">Date</Label>
						<Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
					</div>
					<div>
						<Label className="text-sm">Type</Label>
						<select
							value={type}
							onChange={(e) => setType(e.target.value)}
							className="px-3 py-2 rounded-md bg-card border border-border text-foreground w-full"
						>
							<option value="team">Team</option>
							<option value="solo">Solo</option>
						</select>
					</div>
					<div className="flex items-end">
						<Button onClick={onCreate} className="w-full bg-primary text-primary-foreground gap-2">
							<Plus size={18} />
							Add Tournament
						</Button>
					</div>
				</CardContent>
			</Card>

			<div className="flex gap-4">
				<div className="flex-1 relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
					<Input
						placeholder="Search tournament name"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 bg-card border-border text-foreground"
					/>
				</div>
			</div>

			<div className="space-y-3">
				{loading ? (
					<p className="text-muted-foreground">Loading...</p>
				) : filtered.length === 0 ? (
					<p className="text-muted-foreground">No tournaments</p>
				) : (
					filtered.map((t) => (
						<Card key={t.id} className="border-border bg-card">
							<CardContent className="p-4 flex items-center justify-between">
								<div>
									<div className="font-semibold">{t.title}</div>
									<div className="text-sm text-muted-foreground">
										{new Date(t.date).toLocaleDateString()} • {t.type}
									</div>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	)
}

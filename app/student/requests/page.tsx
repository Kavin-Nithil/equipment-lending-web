"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import StudentLayout from "@/components/layouts/student-layout"
import { Spinner } from "@/components/ui/spinner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface BorrowRequest {
  id: number
  equipment: { id: number; name: string }
  quantity: number
  purpose: string
  status: string
  borrow_from: string
  borrow_until: string
  created_at: string
}

interface Equipment {
  id: number
  name: string
  available_quantity: number
}

export default function StudentRequests() {
  const router = useRouter()
  const [requests, setRequests] = useState<BorrowRequest[]>([])
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // ✅ Borrow request form state
  const [formData, setFormData] = useState({
    equipment: "",
    quantity: 1,
    purpose: "",
    borrow_from: "",
    borrow_until: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchRequests()
    fetchAvailableEquipment()
  }, [router])

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_URL}/api/requests/my_requests/`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setRequests(data.results || data)
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableEquipment = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_URL}/api/equipment/?available=true`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setEquipmentList(data.results || data)
    } catch (error) {
      console.error("Failed to fetch equipment:", error)
    }
  }

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_URL}/api/requests/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          equipment: Number(formData.equipment),
        }),
      })

      if (!response.ok) throw new Error("Failed to create request")

      setShowModal(false)
      resetForm()
      fetchRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      equipment: "",
      quantity: 1,
      purpose: "",
      borrow_from: "",
      borrow_until: "",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "approved":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "rejected":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "issued":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case "returned":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Requests</h1>
            <p className="text-muted-foreground">Track your equipment borrowing requests</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
          >
            Create Request
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-4">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="p-6 rounded-lg border border-border bg-background hover:border-primary transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{request.equipment.name}</h3>
                      <p className="text-muted-foreground text-sm">Quantity: {request.quantity}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-3">{request.purpose}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">From</p>
                      <p className="text-foreground">{new Date(request.borrow_from).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Until</p>
                      <p className="text-foreground">{new Date(request.borrow_until).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No requests yet. Start by borrowing some equipment!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ Popup modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-background rounded-xl border border-border p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Create Borrow Request</h2>

            {error && (
              <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Equipment</label>
                <select
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  className="input-base"
                  required
                >
                  <option value="">Select Equipment</option>
                  {equipmentList.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.available_quantity} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={
                    equipmentList.find((e) => String(e.id) === formData.equipment)?.available_quantity || 1
                  }
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  className="input-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Purpose</label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="input-base resize-none"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Borrow From</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.borrow_from}
                    onChange={(e) => setFormData({ ...formData, borrow_from: e.target.value })}
                    className="input-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Borrow Until</label>
                  <input
                    type="date"
                    min={formData.borrow_from || new Date().toISOString().split("T")[0]}
                    value={formData.borrow_until}
                    onChange={(e) => setFormData({ ...formData, borrow_until: e.target.value })}
                    className="input-base"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StudentLayout>
  )
}

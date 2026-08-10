"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { PageLoader } from "@/components/shared/Loader"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getErrorMessage } from "@/lib/axios"
import { formatDate } from "@/lib/format"
import type { ApiResponse, User } from "@/types"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { default: axios } = await import("@/lib/axios")
        const res = await axios.get<ApiResponse<User[]>>("/users", {
          params: { limit: 100 },
        })
        if (active) setUsers(res.data.data ?? [])
      } catch (err) {
        if (active) setError(getErrorMessage(err))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const toggleBlock = async (user: User) => {
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.patch(`/users/${user.id}/block`)
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isBlocked: !u.isBlocked } : u))
      )
      toast.success(user.isBlocked ? "User unblocked" : "User blocked")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const deleteUser = async (user: User) => {
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.delete(`/users/${user.id}`)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      toast.success("User deleted")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) return <PageLoader label="Loading users..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage customers, vendors, and admins."
      />

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      {user.profileImage ? (
                        <AvatarImage src={user.profileImage} alt={user.name} />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={user.role} />
                </TableCell>
                <TableCell>
                  {user.isBlocked ? (
                    <StatusBadge status="REJECTED" />
                  ) : (
                    <span className="text-sm text-muted-foreground">Active</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleBlock(user)}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteUser(user)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

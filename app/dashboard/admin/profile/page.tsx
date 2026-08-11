"use client"

import { PageHeader } from "@/components/shared/PageHeader"
import { UserProfileForm } from "@/components/dashboard/UserProfileForm"
import { ChangePasswordForm } from "@/components/dashboard/ChangePasswordForm"

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Update your administrator profile details and profile picture."
      />
      <UserProfileForm />
      <ChangePasswordForm />
    </div>
  )
}

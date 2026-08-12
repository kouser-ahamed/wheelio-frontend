"use client"

import { PageHeader } from "@/components/shared/PageHeader"
import { UserProfileForm } from "@/components/dashboard/UserProfileForm"
import { ProfileSecuritySection } from "@/components/dashboard/ProfileSecuritySection"

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Update your administrator profile details and profile picture."
      />
      <UserProfileForm />
      <ProfileSecuritySection />
    </div>
  )
}

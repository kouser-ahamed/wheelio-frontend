"use client"

import { PageHeader } from "@/components/shared/PageHeader"
import { UserProfileForm } from "@/components/dashboard/UserProfileForm"

export default function VendorProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Update your vendor business profile and contact info."
      />
      <UserProfileForm />
    </div>
  )
}

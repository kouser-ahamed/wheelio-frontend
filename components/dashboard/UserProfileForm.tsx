"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, UploadCloud, User as UserIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/axios"
import { useAuthStore } from "@/lib/auth-store"
import { uploadImage } from "@/lib/uploadImage"
import type { ApiResponse, User } from "@/types"
import { ProfileFormSkeleton } from "./DashboardSkeletons"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function UserProfileForm() {
  const { user, token, setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        phone: user.phone ?? "",
      })
      setProfileImage(user.profileImage ?? null)
    }
  }, [user, form])

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setProfileImage(url)
      toast.success("Profile image uploaded")
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return
    setLoading(true)
    try {
      const { default: axios } = await import("@/lib/axios")
      const res = await axios.patch<ApiResponse<User>>(`/users/${user.id}`, {
        name: values.name,
        phone: values.phone || null,
        profileImage: profileImage || null,
      })

      const updatedUser = res.data.data
      if (token && updatedUser) {
        setAuth(updatedUser, token)
      }
      toast.success("Profile updated successfully!")
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <ProfileFormSkeleton />

  return (
    <div className="max-w-xl space-y-6 rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-6">
        <Avatar className="size-20 border">
          {profileImage ? (
            <AvatarImage src={profileImage} alt={user.name} className="object-cover" />
          ) : null}
          <AvatarFallback className="text-xl font-semibold">
            {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon />}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UploadCloud className="size-4" />
            )}
            {uploading ? "Uploading..." : "Upload photo"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files?.[0])}
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG or WEBP up to 5MB (ImgBB hosted).
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <Input value={user.email} disabled className="mt-1 bg-muted/50" />
            <p className="mt-1 text-xs text-muted-foreground">Email address cannot be changed.</p>
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading || uploading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </form>
      </Form>
    </div>
  )
}

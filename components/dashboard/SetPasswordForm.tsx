"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

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

const setPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SetPasswordFormValues = z.infer<typeof setPasswordSchema>

export function SetPasswordForm() {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: SetPasswordFormValues) => {
    setSubmitting(true)
    try {
      const { default: axios } = await import("@/lib/axios")
      const { useAuthStore } = await import("@/lib/auth-store")
      await axios.post("/auth/set-password", {
        newPassword: values.newPassword,
      })

      const { user, token } = useAuthStore.getState()
      if (user && token) {
        useAuthStore.getState().setAuth({ ...user, hasPassword: true }, token)
      }

      toast.success("Password set successfully. You can now log in with email and password.")
      form.reset()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <KeyRound className="size-4" />
        </span>
        <div>
          <h3 className="font-semibold text-foreground">Set Password</h3>
          <p className="text-xs text-muted-foreground">
            Add a password so you can also log in with email and password.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter a new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Re-enter your new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Set Password
          </Button>
        </form>
      </Form>
    </div>
  )
}

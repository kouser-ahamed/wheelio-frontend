"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, LogIn } from "lucide-react"
import { Suspense } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AuthShell } from "@/components/auth/AuthShell"
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton"
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
import type { User } from "@/types"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

function isSafeRedirect(redirect: string | null): boolean {
  return Boolean(
    redirect &&
      !redirect.startsWith("/login") &&
      !redirect.startsWith("/register") &&
      !redirect.startsWith("//")
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { default: axios } = await import("@/lib/axios")
      const { useAuthStore } = await import("@/lib/auth-store")
      const { setAuthCookie } = await import("@/lib/cookie")

      const res = await axios.post<{
        data: { user: User; token: string }
      }>("/auth/login", values)

      const { user, token } = res.data.data
      useAuthStore.getState().setAuth(user, token)
      setAuthCookie(token)

      toast.success("Logged in successfully")

      const redirect = searchParams.get("redirect")
      if (isSafeRedirect(redirect)) {
        router.push(redirect!)
      } else {
        router.push("/")
      }
      router.refresh()
    } catch (error) {
      const { getErrorMessage } = await import("@/lib/axios")
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogIn />
            )}
            Login
          </Button>
        </form>
      </Form>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          or continue with
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleLoginButton />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <AuthShell
        title="Welcome back"
        subtitle="Log in to manage your bookings and vehicles."
        footer={
          <>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Register
            </Link>
          </>
        }
      >
        <LoginForm />
      </AuthShell>
    </Suspense>
  )
}

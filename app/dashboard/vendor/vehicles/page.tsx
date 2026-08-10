"use client"

import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { Car, Loader2, Pencil, Plus, Trash2, UploadCloud } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { PageLoader } from "@/components/shared/Loader"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getErrorMessage } from "@/lib/axios"
import { formatCurrency } from "@/lib/format"
import { uploadImage } from "@/lib/uploadImage"
import type { ApiResponse, Category, Vehicle } from "@/types"

const vehicleSchema = z.object({
  name: z.string().min(2, "Name is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  categoryId: z.string().min(1, "Category is required"),
  pricePerDay: z
    .string()
    .min(1, "Price is required")
    .refine((value) => Number(value) > 0, "Price must be a positive number"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().optional(),
  status: z.enum(["AVAILABLE", "MAINTENANCE", "INACTIVE"]),
})

type VehicleFormValues = z.infer<typeof vehicleSchema>

export default function VendorVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: "",
      brand: "",
      model: "",
      categoryId: "",
      pricePerDay: "",
      description: "",
      location: "",
      status: "AVAILABLE",
    },
  })

  const load = async () => {
    try {
      const { default: axios } = await import("@/lib/axios")
      const [vehiclesRes, categoriesRes] = await Promise.all([
        axios.get<ApiResponse<Vehicle[]>>("/vehicles/my-vehicles", {
          params: { limit: 100 },
        }),
        axios.get<ApiResponse<Category[]>>("/categories", {
          params: { limit: 100 },
        }),
      ])
      setVehicles(vehiclesRes.data.data ?? [])
      setCategories(categoriesRes.data.data ?? [])
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setImageUrl(url)
      toast.success("Image uploaded")
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (values: VehicleFormValues) => {
    if (!imageUrl) {
      toast.error("Please upload at least one vehicle image")
      return
    }
    setSubmitting(true)
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.post("/vehicles", {
        ...values,
        pricePerDay: Number(values.pricePerDay),
        images: [imageUrl],
      })
      toast.success("Vehicle added successfully")
      setOpen(false)
      form.reset()
      setImageUrl(null)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const deleteVehicle = async (vehicle: Vehicle) => {
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.delete(`/vehicles/${vehicle.id}`)
      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id))
      toast.success("Vehicle deleted")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) return <PageLoader label="Loading your vehicles..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="My vehicles"
        description="Manage your rental fleet."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
              <Plus />
              Add vehicle
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add a vehicle</DialogTitle>
                <DialogDescription>
                  Fill in the details below to list your vehicle for rent.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                      {imageUrl ? (
                        <Image src={imageUrl} alt="" fill sizes="80px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <UploadCloud />
                        )}
                        {uploading ? "Uploading..." : "Upload image"}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                      />
                      <p className="text-xs text-muted-foreground">
                        Images are hosted via ImgBB.
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle name</FormLabel>
                        <FormControl>
                          <Input placeholder="Toyota Land Cruiser" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="Toyota" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="Land Cruiser" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pricePerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per day</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" placeholder="150" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Dhaka" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AVAILABLE">Available</SelectItem>
                              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your vehicle..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting || uploading}>
                      {submitting && <Loader2 className="animate-spin" />}
                      Add vehicle
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      {vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No vehicles yet"
          description="List your first vehicle to start accepting bookings."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus />
              Add vehicle
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardHeader className="p-0">
                <div className="relative aspect-[16/10] w-full bg-muted">
                  {vehicle.images?.[0] ? (
                    <Image
                      src={vehicle.images[0]}
                      alt={vehicle.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : null}
                  <StatusBadge
                    status={vehicle.status}
                    className="absolute right-3 top-3"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold">{vehicle.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {vehicle.brand} · {vehicle.model} ·{" "}
                  {vehicle.category?.name ?? "—"}
                </p>
                <p className="mt-2 font-semibold">
                  {formatCurrency(vehicle.pricePerDay)}
                  <span className="text-xs font-normal text-muted-foreground">
                    /day
                  </span>
                </p>
              </CardContent>
              <CardFooter className="gap-2 p-4 pt-0">
                <Button variant="outline" size="sm" className="flex-1">
                  <Pencil />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => deleteVehicle(vehicle)}
                >
                  <Trash2 />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

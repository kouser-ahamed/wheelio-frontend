"use client"

import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { Car, Loader2, Pencil, Plus, Trash2, UploadCloud, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { CardGridSkeleton } from "@/components/dashboard/DashboardSkeletons"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
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

  const openAddModal = () => {
    setEditingVehicle(null)
    setImageUrls([])
    form.reset({
      name: "",
      brand: "",
      model: "",
      categoryId: "",
      pricePerDay: "",
      description: "",
      location: "",
      status: "AVAILABLE",
    })
    setDialogOpen(true)
  }

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setImageUrls(vehicle.images ?? [])
    form.reset({
      name: vehicle.name,
      brand: vehicle.brand,
      model: vehicle.model,
      categoryId: vehicle.categoryId,
      pricePerDay: String(vehicle.pricePerDay),
      description: vehicle.description,
      location: vehicle.location ?? "",
      status: (vehicle.status as "AVAILABLE" | "MAINTENANCE" | "INACTIVE") || "AVAILABLE",
    })
    setDialogOpen(true)
  }

  const handleMultipleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map((file) => uploadImage(file))
      const urls = await Promise.all(uploadPromises)
      setImageUrls((prev) => [...prev, ...urls])
      toast.success(`${urls.length} image(s) uploaded`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (values: VehicleFormValues) => {
    if (imageUrls.length === 0) {
      toast.error("Please upload at least one vehicle image")
      return
    }
    setSubmitting(true)
    try {
      const { default: axios } = await import("@/lib/axios")
      const payload = {
        ...values,
        pricePerDay: Number(values.pricePerDay),
        images: imageUrls,
      }

      if (editingVehicle) {
        await axios.patch(`/vehicles/${editingVehicle.id}`, payload)
        toast.success("Vehicle updated successfully")
      } else {
        await axios.post("/vehicles", payload)
        toast.success("Vehicle created successfully")
      }

      setDialogOpen(false)
      await load()
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
      toast.success("Vehicle deleted successfully")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Vehicles" description="Manage your rental fleet." />
        <CardGridSkeleton count={6} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Vehicles"
        description="Manage your rental fleet."
        action={
          <Button onClick={openAddModal}>
            <Plus className="size-4 mr-1" />
            Add Vehicle
          </Button>
        }
      />

      {/* Add / Edit Vehicle Dialog Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
            <DialogDescription>
              {editingVehicle
                ? "Update vehicle specs, pricing, and availability."
                : "Fill in the details below to list a new vehicle for rent."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Image Upload Area */}
              <div className="space-y-2">
                <FormLabel>Vehicle Images</FormLabel>
                <div className="flex flex-wrap gap-3">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative size-20 overflow-hidden rounded-lg border bg-muted">
                      <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:opacity-90"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex size-20 flex-col items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground hover:bg-muted/50 disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="size-5 animate-spin text-primary" />
                    ) : (
                      <UploadCloud className="size-5" />
                    )}
                    <span>{uploading ? "Uploading" : "Add Image"}</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleMultipleFiles(e.target.files)}
                />
                <p className="text-xs text-muted-foreground">
                  Upload multiple photos. Images are securely hosted via ImgBB.
                </p>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Toyota Land Cruiser V8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Category" />
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
                      <FormLabel>Price Per Day ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="New York, NY" {...field} />
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
                        placeholder="Detailed description of features, condition, etc..."
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
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || uploading}>
                  {submitting && <Loader2 className="size-4 animate-spin mr-1" />}
                  {editingVehicle ? "Save Changes" : "Create Vehicle"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No vehicles listed"
          description="List your first vehicle to start accepting rental bookings."
          action={
            <Button onClick={openAddModal}>
              <Plus className="size-4 mr-1" />
              Add Vehicle
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price / Day</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 overflow-hidden rounded-md border bg-muted">
                          {vehicle.images?.[0] ? (
                            <Image src={vehicle.images[0]} alt="" fill sizes="48px" className="object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{vehicle.name}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.brand} · {vehicle.model}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.category?.name ?? "—"}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(vehicle.pricePerDay)}</TableCell>
                    <TableCell>
                      <StatusBadge status={vehicle.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(vehicle)}>
                          <Pencil className="size-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteVehicle(vehicle)}
                        >
                          <Trash2 className="size-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="grid gap-6 sm:grid-cols-2 md:hidden">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden">
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
                  <h3 className="font-semibold text-base">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.brand} · {vehicle.model} · {vehicle.category?.name ?? "—"}
                  </p>
                  <p className="mt-2 font-bold text-primary">
                    {formatCurrency(vehicle.pricePerDay)}
                    <span className="text-xs font-normal text-muted-foreground">
                      /day
                    </span>
                  </p>
                </CardContent>
                <CardFooter className="gap-2 p-4 pt-0">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(vehicle)}>
                    <Pencil className="size-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => deleteVehicle(vehicle)}
                  >
                    <Trash2 className="size-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

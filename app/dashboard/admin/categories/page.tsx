"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { FolderKanban, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { TableSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getErrorMessage } from "@/lib/axios"
import type { ApiResponse, Category } from "@/types"

const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
    },
  })

  const load = async () => {
    try {
      const { default: axios } = await import("@/lib/axios")
      const res = await axios.get<ApiResponse<Category[]>>("/categories", {
        params: { limit: 100 },
      })
      setCategories(res.data.data ?? [])
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
    setEditingCategory(null)
    form.reset({
      name: "",
      description: "",
      icon: "",
    })
    setDialogOpen(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    form.reset({
      name: category.name,
      description: category.description ?? "",
      icon: category.icon ?? "",
    })
    setDialogOpen(true)
  }

  const onSubmit = async (values: CategoryFormValues) => {
    setSubmitting(true)
    try {
      const { default: axios } = await import("@/lib/axios")
      if (editingCategory) {
        const res = await axios.patch<ApiResponse<Category>>(`/categories/${editingCategory.id}`, values)
        const updated = res.data.data
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? { ...c, ...updated, ...values } : c))
        )
        toast.success("Category updated successfully")
      } else {
        await axios.post("/categories", values)
        toast.success("Category created successfully")
      }

      setDialogOpen(false)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const deleteCategory = async (category: Category) => {
    try {
      const { default: axios } = await import("@/lib/axios")
      await axios.delete(`/categories/${category.id}`)
      setCategories((prev) => prev.filter((c) => c.id !== category.id))
      toast.success("Category deleted successfully")
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Categories Management" description="Manage vehicle categories and types." />
        <TableSkeleton rows={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories Management"
        description="Manage vehicle categories and classifications."
        action={
          <Button onClick={openAddModal}>
            <Plus className="size-4 mr-1" />
            Add Category
          </Button>
        }
      />

      {/* Add / Edit Category Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update category details and icon."
                : "Create a new category for vehicles."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SUV, Luxury, Electric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon Class / Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Car, Truck, Bike" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of vehicles in this category..."
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
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="size-4 animate-spin mr-1" />}
                  {editingCategory ? "Save Changes" : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {categories.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No categories found"
          description="Create your first vehicle category to categorize vehicles."
          action={
            <Button onClick={openAddModal}>
              <Plus className="size-4 mr-1" />
              Add Category
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
                  <TableHead>Category Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-semibold text-foreground">{category.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {category.description || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{category.icon || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(category)}>
                          <Pencil className="size-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteCategory(category)}
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

          {/* Mobile Card View */}
          <div className="grid gap-4 md:hidden">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="p-4 pb-2">
                  <h3 className="font-semibold text-base">{category.name}</h3>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                  <p>{category.description || "No description provided."}</p>
                </CardContent>
                <CardFooter className="flex gap-2 p-4 pt-0">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(category)}>
                    <Pencil className="size-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => deleteCategory(category)}
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

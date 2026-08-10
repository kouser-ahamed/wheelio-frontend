export type UserRole = "CUSTOMER" | "VENDOR" | "ADMIN"

export type VehicleStatus = "AVAILABLE" | "BOOKED" | "MAINTENANCE" | "INACTIVE"

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED"

export interface User {
  id: string
  name: string
  email: string
  password?: string | null
  phone?: string | null
  profileImage?: string | null
  role: UserRole
  authProvider: string
  isDeleted: boolean
  isBlocked: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  _count?: { vehicles: number }
  vehicles?: Vehicle[]
}

export interface CategorySummary {
  id: string
  name: string
}

export interface Vehicle {
  id: string
  name: string
  brand: string
  model: string
  images: string[]
  pricePerDay: string
  description: string
  status: VehicleStatus
  location?: string | null
  vendorId: string
  categoryId: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  category?: CategorySummary
  vendor?: {
    id: string
    name?: string
    email?: string
    phone?: string | null
    profileImage?: string | null
  }
  reviews?: Review[]
  averageRating?: number
  reviewCount?: number
  _count?: { bookings: number }
}

export interface Booking {
  id: string
  userId: string
  vehicleId: string
  startDate: string
  endDate: string
  totalPrice: string
  status: BookingStatus
  paymentStatus: PaymentStatus
  paymentIntentId?: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
    phone?: string | null
    profileImage?: string | null
  }
  vehicle?: {
    id: string
    name: string
    images?: string[]
    pricePerDay?: string
    status?: VehicleStatus
    category?: CategorySummary
    vendor?: { id: string; name?: string }
  }
}

export interface Review {
  id: string
  userId: string
  vehicleId: string
  rating: number
  comment?: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    profileImage?: string | null
  }
}

export interface Wishlist {
  id: string
  userId: string
  vehicleId: string
  createdAt: string
  vehicle?: Vehicle
}

export interface Payment {
  id: string
  bookingId: string
  amount: string
  currency: string
  stripePaymentIntentId?: string | null
  stripeSessionId?: string | null
  status: PaymentStatus
  createdAt: string
  updatedAt: string
  booking?: {
    id: string
    userId: string
    status: BookingStatus
    paymentStatus: PaymentStatus
  }
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: PaginationMeta
}

export interface ApiErrorShape {
  success: boolean
  message: string
  data: null
  statusCode?: number
  errors?: Record<string, string[]>
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RegisterResponse {
  user: User
}

export interface DashboardStats {
  totalUsers?: number
  totalVendors?: number
  totalCustomers?: number
  totalVehicles?: number
  totalBookings?: number
  totalRevenue?: number
  pendingBookings?: number
  totalEarnings?: number
  activeBookings?: number
  totalSpent?: number
  wishlistCount?: number
}

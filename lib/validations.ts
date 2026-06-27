import { z } from 'zod'
import { INDIAN_STATES } from './types'

// Reusable primitives
export const indianMobile = z
  .string()
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => /^[6-9]\d{9}$/.test(val), {
    message: "Enter a valid 10-digit Indian mobile number",
  })

export const indianPincode = z
  .string()
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => /^[1-9]\d{5}$/.test(val), {
    message: "Enter a valid 6-digit Indian pincode",
  })

export const personName = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => val.length >= 2, {
    message: "Name must be at least 2 characters",
  })
  .refine((val) => val.length <= 50, {
    message: "Name must be under 50 characters",
  })
  .refine((val) => /^[a-zA-Z\s'-]+$/.test(val), {
    message: "Name can only contain letters, spaces, hyphens, and apostrophes",
  })

export const cityName = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => val.length >= 2, {
    message: "City name must be at least 2 characters",
  })
  .refine((val) => val.length <= 50, {
    message: "City name must be under 50 characters",
  })
  .refine((val) => /^[a-zA-Z\s'.-]+$/.test(val), {
    message: "City name can only contain letters and spaces",
  })

export const optionalEmail = z
  .string()
  .transform((val) => val.trim())
  .optional()
  .refine((val) => !val || val.length === 0 || (val.length <= 254 && z.string().email().safeParse(val).success), {
    message: "Enter a valid email address",
  })
  .transform((val) => (val && val.length > 0) ? val.toLowerCase() : undefined)

export const addressLine = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => val.length >= 10, {
    message: "Enter your complete address including building/house number",
  })
  .refine((val) => val.length <= 200, {
    message: "Address must be under 200 characters",
  })
  .refine((val) => /\d/.test(val), {
    message: "Address must include a house or building number",
  })

export const reviewBody = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => val.length >= 20, {
    message: "Write at least 20 characters in your review",
  })
  .refine((val) => val.length <= 1000, {
    message: "Review must be under 1000 characters",
  })

export const reviewTitle = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => val.length >= 3, {
    message: "Enter a short title for your review (3–100 characters)",
  })
  .refine((val) => val.length <= 100, {
    message: "Review title must be under 100 characters",
  })

export const starRating = z
  .union([z.string(), z.number()])
  .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
  .refine((val) => !isNaN(val) && Number.isInteger(val) && val >= 1 && val <= 5, {
    message: "Please select a rating",
  })

// Composite Form Schemas

export const checkoutFormSchema = z.object({
  fullName: personName,
  mobile: indianMobile,
  email: optionalEmail,
  addressLine1: addressLine,
  addressLine2: z
    .string()
    .transform((val) => val.trim())
    .optional()
    .transform((val) => val || null),
  city: cityName,
  state: z.enum(INDIAN_STATES, {
    message: "Select your state",
  }),
  pincode: indianPincode,
  paymentMethod: z.enum(['Cash on Delivery', 'Prepaid'] as const, {
    message: "Select a payment method",
  }),
  notes: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val?.trim() || null)
    .refine((val) => !val || val.length <= 500, {
      message: "Notes must be under 500 characters",
    }),
})

export const checkoutSavedAddressSchema = z.object({
  fullName: personName,
  mobile: indianMobile,
  email: optionalEmail,
  paymentMethod: z.enum(['Cash on Delivery', 'Prepaid'] as const, {
    message: "Select a payment method",
  }),
  notes: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val?.trim() || null)
    .refine((val) => !val || val.length <= 500, {
      message: "Notes must be under 500 characters",
    }),
})

export const reviewFormSchema = z.object({
  reviewerName: personName,
  customerMobile: indianMobile,
  rating: starRating,
  title: z
    .string()
    .transform((val) => val.trim())
    .optional()
    .refine((val) => !val || val.length <= 100, {
      message: "Review title must be under 100 characters",
    })
    .transform((val) => val || null),
  body: reviewBody,
})

export const orderLookupSchema = z.object({
  mobile: indianMobile,
})

export const orderStatusSchema = z.object({
  phone: indianMobile,
})

export const adminLoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
})

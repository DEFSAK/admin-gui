import { z, ZodEffects, ZodObject, ZodTypeAny } from 'zod'
import { DefaultValues, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

type UnwrapZodEffects<T extends ZodTypeAny> =
  T extends ZodEffects<infer U> ? UnwrapZodEffects<U> : T

// Ensure the final type is a ZodObject
type EnsureZodObject<T> = T extends ZodObject<any> ? T : never

export function getBaseObject<T extends ZodTypeAny>(
  schema: T
): EnsureZodObject<UnwrapZodEffects<T>> {
  let currentSchema = schema

  while (currentSchema instanceof ZodEffects) {
    currentSchema = currentSchema._def.schema
  }

  if (currentSchema instanceof ZodObject) {
    return currentSchema as EnsureZodObject<UnwrapZodEffects<T>>
  } else {
    throw new Error('Base schema is not a ZodObject')
  }
}

export function getDefaults<Schema extends z.AnyZodObject>(
  schema: Schema
): DefaultValues<z.infer<Schema>> {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      if (value instanceof z.ZodDefault) {
        return [key, value._def.defaultValue()]
      }
      return [key, undefined]
    })
  ) as DefaultValues<z.infer<Schema>>
}

export function createForm<Schema extends z.AnyZodObject>(
  schema: Schema,
  defaultValues?: DefaultValues<z.infer<Schema>>
) {
  return useForm<z.infer<Schema>>({
    resolver: zodResolver(schema),
    values: defaultValues || getDefaults(schema),
    defaultValues: defaultValues || getDefaults(schema),
    resetOptions: {
      keepDirtyValues: true
    }
  })
}

export const PunishmentSchema = z
  .object({
    label: z
      .string()
      .min(1, {
        message: 'Label must be at least 1 character long'
      })
      .default(''),
    reason: z
      .string()
      .min(1, {
        message: 'Reason must be at least 1 character long'
      })
      .default(''),
    min_duration: z.coerce
      .number()
      .min(1, {
        message: 'Min. Duration must be at least 1 hour'
      })
      .max(999999, {
        message: 'Min. Duration must be at most 999999 hours'
      })
      .default(1),
    max_duration: z.coerce
      .number()
      .min(1, {
        message: 'Max. Duration must be at least 1 hour'
      })
      .max(999999, {
        message: 'Max. Duration must be at most 999999 hours'
      })
      .default(1)
  })
  .refine((data) => data.min_duration <= data.max_duration, {
    message: 'Min. Duration must be less than or equal to Max. Duration',
    path: ['min_duration']
  })
  .refine((data) => data.max_duration >= data.min_duration, {
    message: 'Max. Duration must be greater than or equal to Min. Duration',
    path: ['max_duration']
  })

export const AnnouncementSchema = z.object({
  label: z.string().min(1, {
    message: 'Label must be at least 1 character long'
  }),
  type: z.enum(['server', 'admin']).default('admin'),
  message: z
    .string()
    .min(1, {
      message: 'Message must be at least 1 character long'
    })
    .default('')
})

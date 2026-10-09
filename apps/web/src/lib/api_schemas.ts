import { z } from 'zod';
import { NextResponse } from 'next/server';

/**
 * Standardized Zod validation schemas for Waypoint API endpoints.
 */

export const loginSchema = z.object({
  email: z.string().email('Email is required and must be a valid email address').trim(),
  password: z.string().min(1, 'Email and password are required'),
  remember: z.boolean().optional().default(true),
});

export const validDeferralReasons = [
  'REEFER_CAPACITY',
  'VAN_ONLY',
  'WEIGHT_VOLUME',
  'TIME_BUDGET',
  'FUEL_QUOTA',
  'MALL_WINDOW',
] as const;

export const deferOrderSchema = z.object({
  reasonCode: z.enum(validDeferralReasons, {
    errorMap: () => ({ message: 'Invalid standard deferral reason code' }),
  }),
  impactNote: z.string().optional(),
  overrideReason: z.string().optional(),
  orderIds: z.array(z.string()).optional().default([]),
});

export const resolveExceptionSchema = z.object({
  incidentId: z.string().min(1, 'Incident ID is required'),
  action: z.string().min(1, 'Resolution action is required'),
  note: z.string().optional(),
});

export const allocateRequestSchema = z.record(z.unknown()).optional().default({});

export const validateRequestSchema = z.record(z.unknown()).optional().default({});

export const driverIssueSchema = z.object({
  issueType: z.string().min(1, 'Issue type is required'),
  notes: z.string().optional(),
  deliveryCode: z.string().optional(),
  stopId: z.string().optional(),
});

export const driverPodSchema = z
  .object({
    deliveryCode: z.string().trim().min(1, 'Delivery code is required'),
    stopId: z.string().optional(),
    orderId: z.string().optional(),
    receiverName: z.string().optional(),
    signatureData: z.string().nullable().optional(),
    photoCaptured: z.boolean().optional(),
    verifiedQty: z.boolean({
      required_error: 'Quantity confirmation is required before submitting proof of delivery',
      invalid_type_error: 'Quantity confirmation is required before submitting proof of delivery',
    }).refine((v) => v === true, {
      message: 'Quantity confirmation is required before submitting proof of delivery',
    }),
  })
  .refine(
    (data) => Boolean((data.signatureData && data.signatureData.trim()) || data.photoCaptured),
    {
      message: 'Proof of delivery requires either receiver signature or delivery photo',
      path: ['verificationArtifact'],
    }
  );

export const loaderScanSchema = z.object({
  sku: z.string().min(1, 'SKU barcode is required'),
  bayId: z.string().optional(),
  vehicleId: z.string().optional(),
});

export const loaderShortfallSchema = z.object({
  tripId: z.string().optional(),
  qtyShort: z.coerce.number().int().positive().optional().default(3),
  productLine: z.string().optional(),
  notes: z.string().optional(),
  decision: z.string().optional(),
});

export const loaderSignoffSchema = z.object({
  vehicleId: z.string().optional(),
  loaderName: z.string().optional(),
  stopsLoaded: z.string().optional(),
});

export const storeOrderSchema = z.object({
  outletCode: z.string().optional(),
  ambientProduct: z.string().optional(),
  ambientWeight: z.coerce
    .number({ invalid_type_error: 'Ambient cargo weight must be a non negative number' })
    .min(0, 'Ambient cargo weight must be a non negative number')
    .default(2100),
  chilledProduct: z.string().optional(),
  chilledWeight: z.coerce
    .number({ invalid_type_error: 'Chilled cargo weight must be a non negative number' })
    .min(0, 'Chilled cargo weight must be a non negative number')
    .default(4850),
});

export const storeDisputeSchema = z.object({
  deliveryCode: z.string().optional(),
  missingCount: z.coerce.number().int().min(1).default(1),
  damagedNotes: z.string().optional(),
  signatureSigned: z.boolean().optional(),
});

export const syncBatchSchema = z.object({
  pods: z
    .array(
      z.object({
        id: z.string().optional(),
        deliveryCode: z.string(),
        action: z.string().optional(),
        timestamp: z.string().optional(),
        signatureData: z.string().nullable().optional(),
        photoCaptured: z.boolean().optional(),
        receiverName: z.string().optional(),
      })
    )
    .default([]),
  tempReadings: z
    .array(
      z.object({
        id: z.string(),
        temp: z.number().optional(),
        timestamp: z.string().optional(),
      })
    )
    .default([]),
  issues: z.array(z.record(z.unknown())).default([]),
});

export const agentChatSchema = z.object({
  query: z.string().trim().min(1, 'Query is required'),
});

export const agentSynthesizeSchema = z.object({
  text: z.string().trim().min(1, 'Text is required for voice synthesis'),
  voiceId: z.string().optional(),
});

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse };

/**
 * Parses and validates incoming JSON request body against a Zod schema.
 * Returns a standardized 400 Bad Request response on validation failure.
 */
export async function validateRequestBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
  options?: { allowEmptyBody?: boolean }
): Promise<ValidationResult<z.output<T>>> {
  let rawBody: unknown;
  try {
    const text = await req.text();
    if (!text || text.trim() === '') {
      if (options?.allowEmptyBody) {
        rawBody = {};
      } else {
        return {
          success: false,
          response: NextResponse.json(
            { success: false, error: 'Request body cannot be empty', code: 'EMPTY_PAYLOAD' },
            { status: 400 }
          ),
        };
      }
    } else {
      rawBody = JSON.parse(text);
    }
  } catch {
    if (options?.allowEmptyBody) {
      rawBody = {};
    } else {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, error: 'Invalid JSON request payload', code: 'INVALID_PAYLOAD' },
          { status: 400 }
        ),
      };
    }
  }

  const result = schema.safeParse(rawBody);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const details = result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: firstIssue?.message || 'Validation failed',
          code: 'VALIDATION_ERROR',
          details,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}

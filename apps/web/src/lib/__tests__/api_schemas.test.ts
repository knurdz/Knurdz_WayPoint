import { describe, it, expect } from 'vitest';
import {
  validateRequestBody,
  loginSchema,
  deferOrderSchema,
  resolveExceptionSchema,
  driverPodSchema,
  loaderScanSchema,
  loaderShortfallSchema,
  storeOrderSchema,
  agentChatSchema,
  agentSynthesizeSchema,
} from '../api_schemas';

function createMockRequest(bodyString: string): Request {
  return new Request('https://test.internal/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bodyString,
  });
}

describe('api_schemas and validateRequestBody', () => {
  describe('validateRequestBody helper', () => {
    it('rejects malformed JSON payloads with 400 and structured error', async () => {
      const req = createMockRequest('{ invalid_json: ');
      const result = await validateRequestBody(req, loginSchema);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.status).toBe(400);
        const data = await result.response.json();
        expect(data.code).toBe('INVALID_PAYLOAD');
      }
    });

    it('rejects empty body when allowEmptyBody is false', async () => {
      const req = createMockRequest('');
      const result = await validateRequestBody(req, loginSchema);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.status).toBe(400);
        const data = await result.response.json();
        expect(data.code).toBe('EMPTY_PAYLOAD');
      }
    });

    it('allows empty body when allowEmptyBody is true', async () => {
      const req = createMockRequest('');
      const result = await validateRequestBody(req, storeOrderSchema, { allowEmptyBody: true });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ambientWeight).toBe(2100);
        expect(result.data.chilledWeight).toBe(4850);
      }
    });
  });

  describe('loginSchema', () => {
    it('validates correct email and password', () => {
      const parsed = loginSchema.safeParse({
        email: 'dispatcher@waypoint.test',
        password: 'REDACTED',
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.remember).toBe(true);
      }
    });

    it('rejects invalid email formats', () => {
      const parsed = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password',
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects empty password', () => {
      const parsed = loginSchema.safeParse({
        email: 'dispatcher@waypoint.test',
        password: '',
      });
      expect(parsed.success).toBe(false);
    });
  });

  describe('deferOrderSchema', () => {
    it('accepts all 6 standard deferral reasons', () => {
      const reasons = [
        'REEFER_CAPACITY',
        'VAN_ONLY',
        'WEIGHT_VOLUME',
        'TIME_BUDGET',
        'FUEL_QUOTA',
        'MALL_WINDOW',
      ] as const;

      for (const reasonCode of reasons) {
        const parsed = deferOrderSchema.safeParse({ reasonCode });
        expect(parsed.success).toBe(true);
      }
    });

    it('rejects arbitrary or unknown reason codes', () => {
      const parsed = deferOrderSchema.safeParse({ reasonCode: 'RANDOM_REASON' });
      expect(parsed.success).toBe(false);
    });
  });

  describe('resolveExceptionSchema', () => {
    it('validates incidentId and action are provided', () => {
      const parsed = resolveExceptionSchema.safeParse({
        incidentId: 'INC_001',
        action: 'APPROVED_REROUTE',
        note: 'Authorized by chief dispatcher',
      });
      expect(parsed.success).toBe(true);
    });

    it('fails when incidentId is missing', () => {
      const parsed = resolveExceptionSchema.safeParse({
        action: 'APPROVED_REROUTE',
      });
      expect(parsed.success).toBe(false);
    });
  });

  describe('driverPodSchema', () => {
    it('accepts POD with signature and verifiedQty', () => {
      const parsed = driverPodSchema.safeParse({
        deliveryCode: 'DEL_001',
        signatureData: 'data:image/png;base64,123',
        verifiedQty: true,
      });
      expect(parsed.success).toBe(true);
    });

    it('accepts POD with photo and verifiedQty', () => {
      const parsed = driverPodSchema.safeParse({
        deliveryCode: 'DEL_001',
        photoCaptured: true,
        verifiedQty: true,
      });
      expect(parsed.success).toBe(true);
    });

    it('rejects POD when verifiedQty is false or absent', () => {
      const parsed = driverPodSchema.safeParse({
        deliveryCode: 'DEL_001',
        photoCaptured: true,
        verifiedQty: false,
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects POD when neither signature nor photo is present', () => {
      const parsed = driverPodSchema.safeParse({
        deliveryCode: 'DEL_001',
        verifiedQty: true,
      });
      expect(parsed.success).toBe(false);
    });
  });

  describe('storeOrderSchema', () => {
    it('applies defaults for weights when not provided', () => {
      const parsed = storeOrderSchema.safeParse({});
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.ambientWeight).toBe(2100);
        expect(parsed.data.chilledWeight).toBe(4850);
      }
    });

    it('rejects negative cargo weights', () => {
      const parsed = storeOrderSchema.safeParse({ ambientWeight: -50 });
      expect(parsed.success).toBe(false);
    });
  });

  describe('loader and agent schemas', () => {
    it('loaderScanSchema requires sku', () => {
      expect(loaderScanSchema.safeParse({ sku: 'SKU_1' }).success).toBe(true);
      expect(loaderScanSchema.safeParse({ sku: '' }).success).toBe(false);
    });

    it('loaderShortfallSchema coerces and defaults qtyShort', () => {
      const parsed = loaderShortfallSchema.safeParse({ qtyShort: '5' });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.qtyShort).toBe(5);
      }
    });

    it('agentChatSchema requires non-empty query', () => {
      expect(agentChatSchema.safeParse({ query: 'Show ETA' }).success).toBe(true);
      expect(agentChatSchema.safeParse({ query: '   ' }).success).toBe(false);
    });

    it('agentSynthesizeSchema requires non-empty text', () => {
      expect(agentSynthesizeSchema.safeParse({ text: 'Route confirmed' }).success).toBe(true);
      expect(agentSynthesizeSchema.safeParse({ text: '' }).success).toBe(false);
    });
  });
});

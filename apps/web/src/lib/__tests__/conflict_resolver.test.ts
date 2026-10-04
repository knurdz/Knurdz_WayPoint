import { describe, it, expect } from 'vitest';
import {
  resolveSyncConflict,
  ClientRecord,
  ServerRecord,
} from '../conflict_resolver';

describe('conflict_resolver utility', () => {
  const baseClientRecord: ClientRecord = {
    id: 'client-rec-1',
    deliveryCode: 'DEL-101',
    action: 'STATUS_TRANSITION',
    timestamp: '2026-10-04T12:00:00Z',
    status: 'IN_TRANSIT',
  };

  it('accepts local client update when no server record exists', () => {
    const result = resolveSyncConflict(baseClientRecord, undefined);

    expect(result.deliveryCode).toBe('DEL-101');
    expect(result.resolvedStatus).toBe('IN_TRANSIT');
    expect(result.resolutionSource).toBe('CONVERGED');
    expect(result.explanation).toContain('No conflicting server record found');
  });

  it('defaults to DELIVERED if no server record and no status provided on client record', () => {
    const clientWithoutStatus: ClientRecord = {
      id: 'client-rec-2',
      deliveryCode: 'DEL-102',
      action: 'POD_CAPTURE',
      timestamp: '2026-10-04T12:05:00Z',
    };

    const result = resolveSyncConflict(clientWithoutStatus, undefined);
    expect(result.resolvedStatus).toBe('DELIVERED');
    expect(result.resolutionSource).toBe('CONVERGED');
  });

  describe('when server record is DEFERRED', () => {
    const deferredServer: ServerRecord = {
      deliveryCode: 'DEL-101',
      serverStatus: 'DEFERRED',
      serverTimestamp: '2026-10-04T11:00:00Z',
      deferralReason: 'TIME_BUDGET',
    };

    it('overrides server deferral with customer signature proof of delivery', () => {
      const clientWithSignature: ClientRecord = {
        id: 'client-pod-1',
        deliveryCode: 'DEL-101',
        action: 'POD_CAPTURE',
        timestamp: '2026-10-04T12:10:00Z',
        signatureData: 'data:image/png;base64,sample-signature',
        receiverName: 'Store Manager Jane',
      };

      const result = resolveSyncConflict(clientWithSignature, deferredServer);
      expect(result.resolvedStatus).toBe('DELIVERED');
      expect(result.resolutionSource).toBe('CLIENT_POD_OVERRIDE');
      expect(result.explanation).toContain('field signature overrides central deferral');
    });

    it('overrides server deferral with photo proof of delivery', () => {
      const clientWithPhoto: ClientRecord = {
        id: 'client-pod-2',
        deliveryCode: 'DEL-101',
        action: 'POD_CAPTURE',
        timestamp: '2026-10-04T12:12:00Z',
        photoCaptured: true,
      };

      const result = resolveSyncConflict(clientWithPhoto, deferredServer);
      expect(result.resolvedStatus).toBe('DELIVERED');
      expect(result.resolutionSource).toBe('CLIENT_POD_OVERRIDE');
    });

    it('sustains server deferral when POD lacks signature or photo', () => {
      const clientIncompletePOD: ClientRecord = {
        id: 'client-pod-3',
        deliveryCode: 'DEL-101',
        action: 'POD_CAPTURE',
        timestamp: '2026-10-04T12:15:00Z',
        signatureData: null,
        photoCaptured: false,
      };

      const result = resolveSyncConflict(clientIncompletePOD, deferredServer);
      expect(result.resolvedStatus).toBe('DEFERRED');
      expect(result.resolutionSource).toBe('SERVER_DEFERRAL_AUTHORITY');
      expect(result.explanation).toContain('Central deferral sustained');
    });

    it('sustains server deferral when client action is not POD_CAPTURE', () => {
      const clientOtherAction: ClientRecord = {
        id: 'client-issue-1',
        deliveryCode: 'DEL-101',
        action: 'ISSUE_REPORT',
        timestamp: '2026-10-04T12:15:00Z',
      };

      const result = resolveSyncConflict(clientOtherAction, deferredServer);
      expect(result.resolvedStatus).toBe('DEFERRED');
      expect(result.resolutionSource).toBe('SERVER_DEFERRAL_AUTHORITY');
    });
  });

  describe('when server record is not DEFERRED', () => {
    const inTransitServer: ServerRecord = {
      deliveryCode: 'DEL-101',
      serverStatus: 'IN_TRANSIT',
      serverTimestamp: '2026-10-04T11:30:00Z',
    };

    it('marks DELIVERED on standard POD_CAPTURE action', () => {
      const clientPod: ClientRecord = {
        id: 'client-pod-4',
        deliveryCode: 'DEL-101',
        action: 'POD_CAPTURE',
        timestamp: '2026-10-04T12:20:00Z',
      };

      const result = resolveSyncConflict(clientPod, inTransitServer);
      expect(result.resolvedStatus).toBe('DELIVERED');
      expect(result.resolutionSource).toBe('CLIENT_POD_OVERRIDE');
      expect(result.explanation).toContain('Standard delivery execution');
    });

    it('aligns to server status for non-POD events', () => {
      const clientStatusUpdate: ClientRecord = {
        id: 'client-stat-1',
        deliveryCode: 'DEL-101',
        action: 'STATUS_TRANSITION',
        timestamp: '2026-10-04T12:25:00Z',
      };

      const result = resolveSyncConflict(clientStatusUpdate, inTransitServer);
      expect(result.resolvedStatus).toBe('IN_TRANSIT');
      expect(result.resolutionSource).toBe('CONVERGED');
      expect(result.explanation).toContain('Server state aligned');
    });
  });
});

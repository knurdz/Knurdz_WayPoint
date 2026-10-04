import { describe, it, expect } from 'vitest';
import {
  formatAccessType,
  formatDeferralReason,
  humanizeSnakeCase,
  ACCESS_TYPE_LABELS,
  DEFERRAL_REASON_LABELS,
} from '../formatters';

describe('formatters utility', () => {
  describe('formatAccessType', () => {
    it('returns predefined label for known access types', () => {
      expect(formatAccessType('van_only')).toBe('Van Only');
      expect(formatAccessType('mall_dock')).toBe('Mall Dock');
      expect(formatAccessType('rear_dock')).toBe('Rear Dock');
      expect(formatAccessType('street')).toBe('Street Access');
      expect(formatAccessType('normal')).toBe('Standard Dock');
    });

    it('falls back to humanized snake_case for unknown access types', () => {
      expect(formatAccessType('curbside_pickup')).toBe('Curbside Pickup');
      expect(formatAccessType('underground_loading_bay')).toBe('Underground Loading Bay');
    });

    it('returns empty string when input is null, undefined, or empty', () => {
      expect(formatAccessType(null)).toBe('');
      expect(formatAccessType(undefined)).toBe('');
      expect(formatAccessType('')).toBe('');
    });
  });

  describe('formatDeferralReason', () => {
    it('returns mapped label for known deferral reasons', () => {
      expect(formatDeferralReason('REEFER_CAPACITY')).toBe('Reefer Capacity Shortage');
      expect(formatDeferralReason('VAN_ONLY')).toBe('Van-Only Access Constraint');
      expect(formatDeferralReason('WEIGHT_VOLUME')).toBe('Weight & Volume Exceeded');
      expect(formatDeferralReason('TIME_BUDGET')).toBe('Time Budget Exceeded');
      expect(formatDeferralReason('FUEL_QUOTA')).toBe('Fuel Quota Limit');
      expect(formatDeferralReason('MALL_WINDOW')).toBe('Mall Delivery Window Missed');
    });

    it('falls back to humanized case for unknown deferral codes', () => {
      expect(formatDeferralReason('ROAD_CLOSURE')).toBe('Road Closure');
      expect(formatDeferralReason('WEATHER_HAZARD')).toBe('Weather Hazard');
    });

    it('returns empty string when input is null, undefined, or empty', () => {
      expect(formatDeferralReason(null)).toBe('');
      expect(formatDeferralReason(undefined)).toBe('');
      expect(formatDeferralReason('')).toBe('');
    });
  });

  describe('humanizeSnakeCase', () => {
    it('formats single word snake case into title case', () => {
      expect(humanizeSnakeCase('pending')).toBe('Pending');
      expect(humanizeSnakeCase('DELIVERED')).toBe('Delivered');
    });

    it('replaces underscores and dashes with spaces and title cases words', () => {
      expect(humanizeSnakeCase('cold_chain_warning')).toBe('Cold Chain Warning');
      expect(humanizeSnakeCase('high-priority-shipment')).toBe('High Priority Shipment');
      expect(humanizeSnakeCase('mixed_delimiters-together_test')).toBe('Mixed Delimiters Together Test');
    });

    it('handles multiple consecutive delimiters gracefully', () => {
      expect(humanizeSnakeCase('excessive____delimiters----here')).toBe('Excessive Delimiters Here');
    });
  });

  describe('dictionary integrity', () => {
    it('contains all required standard access types', () => {
      expect(Object.keys(ACCESS_TYPE_LABELS)).toEqual(
        expect.arrayContaining(['van_only', 'mall_dock', 'rear_dock', 'street', 'normal'])
      );
    });

    it('contains all required standard deferral reasons', () => {
      expect(Object.keys(DEFERRAL_REASON_LABELS)).toEqual(
        expect.arrayContaining([
          'REEFER_CAPACITY',
          'VAN_ONLY',
          'WEIGHT_VOLUME',
          'TIME_BUDGET',
          'FUEL_QUOTA',
          'MALL_WINDOW',
        ])
      );
    });
  });
});

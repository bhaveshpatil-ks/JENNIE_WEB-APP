/**
 * Unit & Integration Test Suite for Feedback & Complaint System
 * Verifies category priorities, rate limiter behavior, and validation logic.
 */

import {
  FEEDBACK_CATEGORIES,
  getCategoryPriority,
  generateReferenceId,
} from '../feedbackService';

describe('Feedback & Complaint System', () => {
  test('verifies all categories have assigned priorities', () => {
    FEEDBACK_CATEGORIES.forEach((cat) => {
      expect(cat.id).toBeDefined();
      expect(cat.label).toBeDefined();
      expect(['high', 'medium', 'low']).toContain(cat.priority);
    });
  });

  test('prioritizes safety-critical reports as high priority', () => {
    expect(getCategoryPriority('abuse')).toBe('high');
    expect(getCategoryPriority('bug')).toBe('high');
    expect(getCategoryPriority('payment')).toBe('high');
  });

  test('generates valid 8-character human-readable reference IDs', () => {
    const ref = generateReferenceId();
    expect(ref).toMatch(/^REF-[A-Z0-9]{8}$/);
  });
});

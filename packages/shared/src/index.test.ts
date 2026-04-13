import { describe, it, expect } from 'vitest';
import type { ValidationResult, AnalysisResults } from './index';

describe('Shared Types', () => {
  it('should create a valid ValidationResult', () => {
    const result: ValidationResult = {
      isValid: true,
    };
    expect(result.isValid).toBe(true);
  });

  it('should create a ValidationResult with error', () => {
    const result: ValidationResult = {
      isValid: false,
      error: 'Invalid file format',
    };
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid file format');
  });
});

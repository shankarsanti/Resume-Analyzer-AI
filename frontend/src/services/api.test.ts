import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeResume, checkApiHealth, ApiError } from './api';
import { AnalysisResults } from '@resume-analyzer/shared';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('analyzeResume', () => {
    const mockFile = new File(['test content'], 'resume.pdf', { type: 'application/pdf' });
    const mockResults: AnalysisResults = {
      score: 85,
      breakdown: {
        formatting: 20,
        sections: 22,
        keywords: 23,
        content: 20,
      },
      suggestions: ['Add more skills', 'Improve summary'],
      keywords: {
        identified: [
          { keyword: 'JavaScript', category: 'technical' },
          { keyword: 'React', category: 'technical' },
        ],
        missing: [],
      },
      sections: {
        experience: { present: true, content: 'Experience content' },
        skills: { present: true, content: 'Skills content' },
        education: { present: true, content: 'Education content' },
        projects: { present: false },
      },
    };

    it('should successfully analyze a resume', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      });

      const result = await analyzeResume({ file: mockFile });

      expect(result).toEqual(mockResults);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analyze'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    it('should include job description in request when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      });

      await analyzeResume({
        file: mockFile,
        jobDescription: 'Looking for a React developer',
      });

      const formData = mockFetch.mock.calls[0][1].body as FormData;
      expect(formData.get('jobDescription')).toBe('Looking for a React developer');
    });

    it('should call progress callback during upload', async () => {
      const onProgress = vi.fn();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      });

      await analyzeResume({ file: mockFile, onProgress });

      expect(onProgress).toHaveBeenCalledWith(10, 'Uploading file...');
      expect(onProgress).toHaveBeenCalledWith(90, 'Processing results...');
      expect(onProgress).toHaveBeenCalledWith(100, 'Complete');
    });

    it('should throw ApiError for validation errors (400)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          code: 'INVALID_FILE_TYPE',
          stage: 'validation',
          message: 'Invalid file type',
          details: 'Only PDF and DOCX files are supported',
        }),
      });

      try {
        await analyzeResume({ file: mockFile });
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
          code: 'INVALID_FILE_TYPE',
          stage: 'validation',
          message: 'Invalid file type',
          recoverable: true,
        });
      }
    });

    it('should throw ApiError for processing errors (422)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({
          code: 'EXTRACTION_FAILED',
          stage: 'extraction',
          message: 'Failed to extract text from PDF',
          details: 'The PDF appears to be image-only',
        }),
      });

      try {
        await analyzeResume({ file: mockFile });
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
          code: 'EXTRACTION_FAILED',
          stage: 'extraction',
          recoverable: true,
        });
      }
    });

    it('should throw ApiError for server errors (500)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          code: 'INTERNAL_ERROR',
          stage: 'unknown',
          message: 'Internal server error',
        }),
      });

      try {
        await analyzeResume({ file: mockFile });
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
          code: 'INTERNAL_ERROR',
          stage: 'unknown',
          recoverable: false,
        });
      }
    });

    it('should throw ApiError for network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      try {
        await analyzeResume({ file: mockFile });
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
          code: 'NETWORK_ERROR',
          stage: 'network',
          message: 'Failed to connect to server',
          recoverable: true,
        });
      }
    });

    it('should throw ApiError for timeout', async () => {
      // Create an error that matches the AbortError pattern
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      try {
        await analyzeResume({ file: mockFile });
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
          code: 'TIMEOUT_ERROR',
          stage: 'network',
          message: 'Request timeout',
          recoverable: true,
        });
      }
    });

    it('should not include empty job description in request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults,
      });

      await analyzeResume({
        file: mockFile,
        jobDescription: '   ', // Only whitespace
      });

      const formData = mockFetch.mock.calls[0][1].body as FormData;
      expect(formData.has('jobDescription')).toBe(false);
    });
  });

  describe('checkApiHealth', () => {
    it('should return true when API is healthy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const result = await checkApiHealth();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return false when API is unhealthy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await checkApiHealth();

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await checkApiHealth();

      expect(result).toBe(false);
    });
  });

  describe('ApiError', () => {
    it('should create ApiError with all properties', () => {
      const error = new ApiError(
        'Test error',
        'TEST_CODE',
        'test_stage',
        'Test details',
        true
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.stage).toBe('test_stage');
      expect(error.details).toBe('Test details');
      expect(error.recoverable).toBe(true);
      expect(error.name).toBe('ApiError');
    });

    it('should default recoverable to false', () => {
      const error = new ApiError('Test error', 'TEST_CODE', 'test_stage');

      expect(error.recoverable).toBe(false);
    });
  });
});

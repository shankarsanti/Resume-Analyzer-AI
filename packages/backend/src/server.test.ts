import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from './server';
import { FileProcessor } from './FileProcessor';
import { TextExtractor } from './TextExtractor';
import { SectionDetector } from './SectionDetector';

// Mock the dependencies
vi.mock('./FileProcessor');
vi.mock('./TextExtractor');
vi.mock('./SectionDetector');
vi.mock('./ContentAnalyzer');
vi.mock('./ATSScorer');
vi.mock('./KeywordAnalyzer');
vi.mock('./JobMatcher');

describe('POST /api/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when no file is uploaded', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .expect(400);

    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      stage: 'upload',
      message: 'No file uploaded'
    });
  });

  it('should return 400 for invalid file type', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .attach('file', Buffer.from('test'), 'test.txt')
      .expect(400);

    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      stage: 'upload'
    });
  });

  it('should return 400 when file validation fails', async () => {
    const mockValidate = vi.fn().mockReturnValue({
      isValid: false,
      error: 'Invalid PDF format'
    });
    
    (FileProcessor as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      validate: mockValidate
    }));

    const response = await request(app)
      .post('/api/analyze')
      .attach('file', Buffer.from('fake pdf'), 'resume.pdf')
      .expect(400);

    expect(response.body).toMatchObject({
      code: 'VALIDATION_ERROR',
      stage: 'validation',
      message: 'Invalid PDF format'
    });
  });

  it('should return 422 when text extraction fails', async () => {
    const mockValidate = vi.fn().mockReturnValue({ isValid: true });
    const mockExtract = vi.fn().mockReturnValue({
      text: '',
      error: 'No text found in PDF'
    });

    (FileProcessor as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      validate: mockValidate
    }));

    (TextExtractor as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      extract: mockExtract
    }));

    const response = await request(app)
      .post('/api/analyze')
      .attach('file', Buffer.from('fake pdf'), 'resume.pdf')
      .expect(422);

    expect(response.body).toMatchObject({
      code: 'PROCESSING_ERROR',
      stage: 'extraction',
      message: 'No text found in PDF'
    });
  });

  it('should return 422 when no sections are detected', async () => {
    const mockValidate = vi.fn().mockReturnValue({ isValid: true });
    const mockExtract = vi.fn().mockReturnValue({
      text: 'Some resume text',
      error: undefined
    });
    const mockDetectSections = vi.fn().mockReturnValue({
      sections: [],
      error: 'No recognizable sections found'
    });

    (FileProcessor as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      validate: mockValidate
    }));

    (TextExtractor as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      extract: mockExtract
    }));

    (SectionDetector as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      detectSections: mockDetectSections
    }));

    const response = await request(app)
      .post('/api/analyze')
      .attach('file', Buffer.from('fake pdf'), 'resume.pdf')
      .expect(422);

    expect(response.body).toMatchObject({
      code: 'PROCESSING_ERROR',
      stage: 'section_detection',
      message: 'No recognizable sections found'
    });
  });
});

describe('GET /health', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'ok'
    });
    expect(response.body.timestamp).toBeDefined();
  });
});

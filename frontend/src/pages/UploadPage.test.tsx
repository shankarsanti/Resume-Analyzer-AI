import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UploadPage from './UploadPage';
import { AppProvider } from '../context/AppContext';
import * as apiService from '../services/api';
import type { AnalysisResults } from '@resume-analyzer/shared';

// Mock the API service
vi.mock('../services/api', () => ({
  analyzeResume: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(
      message: string,
      public code: string,
      public stage: string,
      public details?: string,
      public recoverable: boolean = false
    ) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render component with providers
const renderUploadPage = () => {
  return render(
    <BrowserRouter>
      <AppProvider>
        <UploadPage />
      </AppProvider>
    </BrowserRouter>
  );
};

// Helper to create a mock file
const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('UploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render upload page with title', () => {
      renderUploadPage();
      expect(screen.getByText('Upload Your Resume')).toBeInTheDocument();
    });

    it('should render upload zone with instructions', () => {
      renderUploadPage();
      expect(screen.getByText(/Drag & drop your resume here/i)).toBeInTheDocument();
      expect(screen.getByText(/or click to browse/i)).toBeInTheDocument();
      expect(screen.getByText(/Supports PDF and DOCX \(max 10MB\)/i)).toBeInTheDocument();
    });

    it('should render job description textarea', () => {
      renderUploadPage();
      expect(screen.getByLabelText(/Job Description \(Optional\)/i)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Paste the job description here/i)
      ).toBeInTheDocument();
    });

    it('should render disabled submit button initially', () => {
      renderUploadPage();
      const submitButton = screen.getByRole('button', { name: /Analyze Resume/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('File Upload - Drag and Drop', () => {
    it('should show drag active state when dragging file over zone', async () => {
      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');

      // Simulate drag enter
      fireEvent.dragEnter(dropzone!, {
        dataTransfer: {
          files: [createMockFile('resume.pdf', 1024 * 1024, 'application/pdf')],
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/Drop your resume here/i)).toBeInTheDocument();
      });
    });

    it('should accept valid PDF file via drag and drop', async () => {
      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const file = createMockFile('resume.pdf', 1024 * 1024, 'application/pdf');

      // Simulate file drop
      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(screen.getByText('resume.pdf')).toBeInTheDocument();
      });
    });

    it('should accept valid DOCX file via drag and drop', async () => {
      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const file = createMockFile(
        'resume.docx',
        1024 * 1024,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );

      // Simulate file drop
      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(screen.getByText('resume.docx')).toBeInTheDocument();
      });
    });
  });

  describe('File Validation', () => {
    it('should reject file exceeding 10MB size limit', async () => {
      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const largeFile = createMockFile('large.pdf', 11 * 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [largeFile],
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/File size exceeds 10MB limit/i)).toBeInTheDocument();
      });
    });

    it('should reject invalid file type', async () => {
      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const invalidFile = createMockFile('document.txt', 1024, 'text/plain');

      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [invalidFile],
        },
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Invalid file type. Please upload a PDF or DOCX file/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('File Preview', () => {
    it('should display file preview after successful upload', async () => {
      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const file = createMockFile('my-resume.pdf', 2 * 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(screen.getByText('my-resume.pdf')).toBeInTheDocument();
        expect(screen.getByText(/2.00 MB/i)).toBeInTheDocument();
      });
    });

    it('should show remove button in file preview', async () => {
      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const file = createMockFile('resume.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        const removeButton = screen.getByLabelText(/Remove file/i);
        expect(removeButton).toBeInTheDocument();
      });
    });

    it('should remove file when remove button is clicked', async () => {
      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const file = createMockFile('resume.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(screen.getByText('resume.pdf')).toBeInTheDocument();
      });

      const removeButton = screen.getByLabelText(/Remove file/i);
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('resume.pdf')).not.toBeInTheDocument();
        expect(screen.getByText(/Drag & drop your resume here/i)).toBeInTheDocument();
      });
    });
  });

  describe('Job Description Input', () => {
    it('should update character count when typing', async () => {
      renderUploadPage();
      const textarea = screen.getByLabelText(/Job Description \(Optional\)/i);

      fireEvent.change(textarea, { target: { value: 'Test job description' } });

      await waitFor(() => {
        expect(screen.getByText(/21 characters/i)).toBeInTheDocument();
      });
    });

    it('should allow empty job description', () => {
      renderUploadPage();
      const textarea = screen.getByLabelText(/Job Description \(Optional\)/i);
      expect(textarea).toHaveValue('');
    });
  });

  describe('Submit Button', () => {
    it('should enable submit button when file is selected', async () => {
      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const file = createMockFile('resume.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Analyze Resume/i });
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should disable submit button during processing', async () => {
      vi.mocked(apiService.analyzeResume).mockImplementation(
        () =>
          new Promise<AnalysisResults>((resolve) => {
            setTimeout(() => resolve({} as AnalysisResults), 1000);
          })
      );

      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const file = createMockFile('resume.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Analyze Resume/i });
        expect(submitButton).not.toBeDisabled();
      });

      const submitButton = screen.getByRole('button', { name: /Analyze Resume/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Processing your resume/i)).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should call API with file when submit is clicked', async () => {
      const mockResults: AnalysisResults = {
        score: 85,
        status: 'excellent',
        breakdown: {} as AnalysisResults['breakdown'],
        suggestions: [],
        keywords: { identifiedKeywords: [], missingKeywords: [] },
        sectionsAnalysis: [],
      };

      vi.mocked(apiService.analyzeResume).mockResolvedValue(mockResults);

      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const file = createMockFile('resume.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Analyze Resume/i });
        expect(submitButton).not.toBeDisabled();
      });

      const submitButton = screen.getByRole('button', { name: /Analyze Resume/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiService.analyzeResume).toHaveBeenCalledWith(
          expect.objectContaining({
            file: expect.any(File),
            jobDescription: undefined,
            onProgress: expect.any(Function),
          })
        );
      });
    });

    it('should navigate to results page on successful analysis', async () => {
      const mockResults: AnalysisResults = {
        score: 85,
        status: 'excellent',
        breakdown: {} as AnalysisResults['breakdown'],
        suggestions: [],
        keywords: { identifiedKeywords: [], missingKeywords: [] },
        sectionsAnalysis: [],
      };

      vi.mocked(apiService.analyzeResume).mockResolvedValue(mockResults);

      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const file = createMockFile('resume.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Analyze Resume/i });
        fireEvent.click(submitButton);
      });

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('/results');
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Error Handling', () => {
    it('should display validation error from API', async () => {
      const mockError = new apiService.ApiError(
        'Invalid file format',
        'VALIDATION_ERROR',
        'validation',
        'Please upload a valid PDF or DOCX file',
        true
      );

      vi.mocked(apiService.analyzeResume).mockRejectedValue(mockError);

      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const file = createMockFile('resume.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Analyze Resume/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Invalid file format/i)).toBeInTheDocument();
      });
    });

    it('should display processing error from API', async () => {
      const mockError = new apiService.ApiError(
        'No text could be extracted',
        'PROCESSING_ERROR',
        'extraction',
        'Please ensure your file contains readable text',
        true
      );

      vi.mocked(apiService.analyzeResume).mockRejectedValue(mockError);

      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const file = createMockFile('resume.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Analyze Resume/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/No text could be extracted/i)).toBeInTheDocument();
      });
    });

    it('should show retry button for recoverable errors', async () => {
      const mockError = new apiService.ApiError(
        'Processing failed',
        'PROCESSING_ERROR',
        'extraction',
        'Please try again',
        true
      );

      vi.mocked(apiService.analyzeResume).mockRejectedValue(mockError);

      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const file = createMockFile('resume.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Analyze Resume/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
      });
    });
  });

  describe('Progress Indicator', () => {
    it('should show progress indicator during processing', async () => {
      vi.mocked(apiService.analyzeResume).mockImplementation(
        () =>
          new Promise<AnalysisResults>((resolve) => {
            setTimeout(() => resolve({} as AnalysisResults), 1000);
          })
      );

      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const file = createMockFile('resume.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Analyze Resume/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Processing your resume/i)).toBeInTheDocument();
      });
    });

    it('should update progress percentage', async () => {
      let progressCallback: ((progress: number, stage: string) => void) | undefined;

      vi.mocked(apiService.analyzeResume).mockImplementation(({ onProgress }) => {
        progressCallback = onProgress;
        return new Promise<AnalysisResults>((resolve) => {
          setTimeout(() => {
            progressCallback?.(50, 'Analyzing content...');
            setTimeout(() => resolve({} as AnalysisResults), 500);
          }, 100);
        });
      });

      renderUploadPage();
      const dropzone = screen.getByText(/Drag & drop your resume here/i).closest('div');
      const file = createMockFile('resume.pdf', 1024 * 1024, 'application/pdf');

      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Analyze Resume/i });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/50%/i)).toBeInTheDocument();
      });
    });
  });
});

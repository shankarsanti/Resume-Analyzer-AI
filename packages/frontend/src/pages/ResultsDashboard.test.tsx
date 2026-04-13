import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResultsDashboard from './ResultsDashboard';
import type { AnalysisResults } from '@resume-analyzer/shared';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the useAppContext hook to return our test data
const mockResetState = vi.fn();
const mockSetAnalysisResults = vi.fn();
const mockSetUploadState = vi.fn();
const mockSetError = vi.fn();

let mockAnalysisResults: AnalysisResults | null = null;

vi.mock('../context/AppContext', async () => {
  const actual = await vi.importActual('../context/AppContext');
  return {
    ...actual,
    useAppContext: () => ({
      uploadState: {
        isProcessing: false,
        progress: 0,
        currentStage: '',
        file: null,
        jobDescription: undefined,
      },
      analysisResults: mockAnalysisResults,
      error: null,
      setUploadState: mockSetUploadState,
      setAnalysisResults: mockSetAnalysisResults,
      setError: mockSetError,
      resetState: mockResetState,
    }),
  };
});

const analysisResultsWithJobMatch: AnalysisResults = {
  score: 85,
  breakdown: {
    formatting: 90,
    sections: 85,
    keywords: 80,
    content: 85,
  },
  status: 'excellent',
  suggestions: [
    'Add more technical skills',
    'Include quantifiable achievements',
    'Add certifications section',
  ],
  keywords: {
    identifiedKeywords: [
      { text: 'JavaScript', category: 'technical' },
      { text: 'React', category: 'technical' },
    ],
    missingKeywords: [
      { text: 'TypeScript', category: 'technical' },
      { text: 'AWS', category: 'tool' },
    ],
  },
  sectionsAnalysis: [
    { sectionType: 'Experience', present: true, icon: 'Briefcase' },
    { sectionType: 'Skills', present: true, icon: 'Code' },
    { sectionType: 'Education', present: true, icon: 'GraduationCap' },
    { sectionType: 'Projects', present: false, icon: 'FolderGit' },
  ],
  jobMatch: {
    matchPercentage: 75,
    matchingSkills: ['JavaScript', 'React', 'Node.js'],
    missingSkills: ['Python', 'AWS', 'Docker'],
  },
};

const analysisResultsWithoutJobMatch: AnalysisResults = {
  ...analysisResultsWithJobMatch,
  jobMatch: undefined,
};

const renderWithResults = (results: AnalysisResults | null) => {
  mockAnalysisResults = results;
  return render(
    <BrowserRouter>
      <ResultsDashboard />
    </BrowserRouter>
  );
};

describe('ResultsDashboard - Task 15.6: Action Buttons and Job Match Display', () => {
  describe('Analyze Another Resume Button', () => {
    it('should render the button with correct text and icon', () => {
      renderWithResults(analysisResultsWithJobMatch);
      const button = screen.getByRole('button', { name: /analyze another resume/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-blue-600', 'text-white', 'px-8', 'py-3', 'rounded-lg', 'text-lg', 'font-semibold');
    });

    it('should have proper hover effects styling', () => {
      renderWithResults(analysisResultsWithJobMatch);
      const button = screen.getByRole('button', { name: /analyze another resume/i });
      expect(button).toHaveClass('hover:bg-blue-700', 'hover:scale-105', 'shadow-lg');
    });

    it('should be centered at the bottom of the dashboard', () => {
      renderWithResults(analysisResultsWithJobMatch);
      const button = screen.getByRole('button', { name: /analyze another resume/i });
      const container = button.parentElement;
      expect(container).toHaveClass('text-center');
    });
  });

  describe('Job Match Display', () => {
    it('should display job match section when jobMatch data is available', () => {
      renderWithResults(analysisResultsWithJobMatch);
      expect(screen.getByText('Job Match Analysis')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Match Percentage')).toBeInTheDocument();
    });

    it('should not display job match section when jobMatch data is not available', () => {
      renderWithResults(analysisResultsWithoutJobMatch);
      expect(screen.queryByText('Job Match Analysis')).not.toBeInTheDocument();
    });

    it('should display match percentage prominently', () => {
      renderWithResults(analysisResultsWithJobMatch);
      const percentage = screen.getByText('75%');
      expect(percentage).toHaveClass('text-4xl', 'font-bold', 'text-blue-600');
    });

    it('should display matched skills with proper styling', () => {
      renderWithResults(analysisResultsWithJobMatch);
      expect(screen.getByText('Matched Skills')).toBeInTheDocument();
      
      const matchedSkills = ['JavaScript', 'React', 'Node.js'];
      matchedSkills.forEach(skill => {
        const badges = screen.getAllByText(skill);
        // Find the badge in the job match section (green background)
        const jobMatchBadge = badges.find(badge => 
          badge.classList.contains('bg-green-100')
        );
        expect(jobMatchBadge).toBeInTheDocument();
        expect(jobMatchBadge).toHaveClass(
          'px-3',
          'py-1.5',
          'rounded-full',
          'text-sm',
          'font-medium',
          'bg-green-100',
          'text-green-700',
          'border',
          'border-green-200'
        );
      });
    });

    it('should display missing skills with proper styling', () => {
      renderWithResults(analysisResultsWithJobMatch);
      expect(screen.getByText('Missing Skills')).toBeInTheDocument();
      
      const missingSkills = ['Python', 'AWS', 'Docker'];
      missingSkills.forEach(skill => {
        const badges = screen.getAllByText(skill);
        // Find the badge in the job match section (red background)
        const jobMatchBadge = badges.find(badge => 
          badge.classList.contains('bg-red-100')
        );
        expect(jobMatchBadge).toBeInTheDocument();
        expect(jobMatchBadge).toHaveClass(
          'px-3',
          'py-1.5',
          'rounded-full',
          'text-sm',
          'font-medium',
          'bg-red-100',
          'text-red-700',
          'border',
          'border-red-200'
        );
      });
    });

    it('should use responsive grid layout for skills', () => {
      const { container } = renderWithResults(analysisResultsWithJobMatch);
      const skillsGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
      expect(skillsGrid).toBeInTheDocument();
    });

    it('should have proper card styling for job match section', () => {
      renderWithResults(analysisResultsWithJobMatch);
      const jobMatchCard = screen.getByText('Job Match Analysis').closest('div');
      expect(jobMatchCard).toHaveClass(
        'bg-white',
        'rounded-xl',
        'p-8',
        'shadow-md',
        'border',
        'border-gray-200',
        'mb-6'
      );
    });
  });

  describe('Requirements Validation', () => {
    it('should satisfy Requirement 8.2: Display match percentage', () => {
      renderWithResults(analysisResultsWithJobMatch);
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Match Percentage')).toBeInTheDocument();
    });

    it('should satisfy Requirement 8.3: Display matching skills', () => {
      renderWithResults(analysisResultsWithJobMatch);
      // Just check that the skills are present somewhere on the page
      expect(screen.getAllByText('JavaScript').length).toBeGreaterThan(0);
      expect(screen.getAllByText('React').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Node.js').length).toBeGreaterThan(0);
    });

    it('should satisfy Requirement 8.4: Display missing skills', () => {
      renderWithResults(analysisResultsWithJobMatch);
      // Just check that the skills are present somewhere on the page
      expect(screen.getAllByText('Python').length).toBeGreaterThan(0);
      expect(screen.getAllByText('AWS').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Docker').length).toBeGreaterThan(0);
    });

    it('should satisfy Requirement 8.5: Include match analysis in results', () => {
      renderWithResults(analysisResultsWithJobMatch);
      expect(screen.getByText('Job Match Analysis')).toBeInTheDocument();
      expect(screen.getByText('Matched Skills')).toBeInTheDocument();
      expect(screen.getByText('Missing Skills')).toBeInTheDocument();
    });
  });
});

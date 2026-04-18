import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KeywordAnalysisSection from './KeywordAnalysisSection';
import { KeywordAnalysis } from '@resume-analyzer/shared';

describe('KeywordAnalysisSection', () => {
  it('renders section header', () => {
    const keywords: KeywordAnalysis = {
      identifiedKeywords: [],
      missingKeywords: [],
    };

    render(<KeywordAnalysisSection keywords={keywords} />);
    expect(screen.getByText('Keyword Analysis')).toBeInTheDocument();
  });

  it('displays missing keywords with red badges', () => {
    const keywords: KeywordAnalysis = {
      identifiedKeywords: [],
      missingKeywords: [
        { text: 'JavaScript', category: 'technical' },
        { text: 'React', category: 'technical' },
      ],
    };

    render(<KeywordAnalysisSection keywords={keywords} />);
    
    const javascriptBadge = screen.getByText('JavaScript');
    const reactBadge = screen.getByText('React');
    
    expect(javascriptBadge).toBeInTheDocument();
    expect(reactBadge).toBeInTheDocument();
    expect(javascriptBadge).toHaveClass('bg-red-100', 'text-red-700', 'border-red-200');
    expect(reactBadge).toHaveClass('bg-red-100', 'text-red-700', 'border-red-200');
  });

  it('displays matching keywords with green badges', () => {
    const keywords: KeywordAnalysis = {
      identifiedKeywords: [
        { text: 'Python', category: 'technical' },
        { text: 'Leadership', category: 'soft_skill' },
      ],
      missingKeywords: [],
    };

    render(<KeywordAnalysisSection keywords={keywords} />);
    
    const pythonBadge = screen.getByText('Python');
    const leadershipBadge = screen.getByText('Leadership');
    
    expect(pythonBadge).toBeInTheDocument();
    expect(leadershipBadge).toBeInTheDocument();
    expect(pythonBadge).toHaveClass('bg-green-100', 'text-green-700', 'border-green-200');
    expect(leadershipBadge).toHaveClass('bg-green-100', 'text-green-700', 'border-green-200');
  });

  it('displays empty state when no missing keywords', () => {
    const keywords: KeywordAnalysis = {
      identifiedKeywords: [{ text: 'Python', category: 'technical' }],
      missingKeywords: [],
    };

    render(<KeywordAnalysisSection keywords={keywords} />);
    expect(screen.getByText('No missing keywords found! ✓')).toBeInTheDocument();
  });

  it('displays empty state when no matching keywords', () => {
    const keywords: KeywordAnalysis = {
      identifiedKeywords: [],
      missingKeywords: [{ text: 'JavaScript', category: 'technical' }],
    };

    render(<KeywordAnalysisSection keywords={keywords} />);
    expect(screen.getByText('No matching keywords found')).toBeInTheDocument();
  });

  it('applies rounded-full styling to badges', () => {
    const keywords: KeywordAnalysis = {
      identifiedKeywords: [{ text: 'Python', category: 'technical' }],
      missingKeywords: [{ text: 'JavaScript', category: 'technical' }],
    };

    render(<KeywordAnalysisSection keywords={keywords} />);
    
    const pythonBadge = screen.getByText('Python');
    const javascriptBadge = screen.getByText('JavaScript');
    
    expect(pythonBadge).toHaveClass('rounded-full');
    expect(javascriptBadge).toHaveClass('rounded-full');
  });

  it('renders both missing and matching keywords sections', () => {
    const keywords: KeywordAnalysis = {
      identifiedKeywords: [{ text: 'Python', category: 'technical' }],
      missingKeywords: [{ text: 'JavaScript', category: 'technical' }],
    };

    render(<KeywordAnalysisSection keywords={keywords} />);
    
    expect(screen.getByText('Missing Keywords')).toBeInTheDocument();
    expect(screen.getByText('Matching Keywords')).toBeInTheDocument();
  });
});

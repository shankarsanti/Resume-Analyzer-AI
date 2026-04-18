import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResumeSectionsAnalysis from './ResumeSectionsAnalysis';
import type { SectionAnalysis } from '@resume-analyzer/shared';

describe('ResumeSectionsAnalysis', () => {
  it('renders section header', () => {
    const sections: SectionAnalysis[] = [];
    render(<ResumeSectionsAnalysis sections={sections} />);
    expect(screen.getByText('Resume Sections Analysis')).toBeInTheDocument();
  });

  it('renders present sections with green styling', () => {
    const sections: SectionAnalysis[] = [
      { sectionType: 'Experience', present: true },
      { sectionType: 'Skills', present: true },
    ];
    render(<ResumeSectionsAnalysis sections={sections} />);
    
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
  });

  it('renders missing sections with red styling', () => {
    const sections: SectionAnalysis[] = [
      { sectionType: 'Projects', present: false },
      { sectionType: 'Education', present: false },
    ];
    render(<ResumeSectionsAnalysis sections={sections} />);
    
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
  });

  it('renders all four standard sections', () => {
    const sections: SectionAnalysis[] = [
      { sectionType: 'Experience', present: true },
      { sectionType: 'Skills', present: true },
      { sectionType: 'Education', present: true },
      { sectionType: 'Projects', present: false },
    ];
    render(<ResumeSectionsAnalysis sections={sections} />);
    
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('applies responsive grid classes', () => {
    const sections: SectionAnalysis[] = [
      { sectionType: 'Experience', present: true },
    ];
    const { container } = render(<ResumeSectionsAnalysis sections={sections} />);
    
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-2', 'md:grid-cols-4');
    // Check for responsive gap classes
    expect(grid).toHaveClass('gap-3');
    expect(grid).toHaveClass('sm:gap-4');
  });
});

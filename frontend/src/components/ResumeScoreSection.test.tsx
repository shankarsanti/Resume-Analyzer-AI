import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResumeScoreSection from './ResumeScoreSection';

describe('ResumeScoreSection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the component with title', () => {
    render(<ResumeScoreSection score={85} />);
    expect(screen.getByText('Resume Score')).toBeInTheDocument();
  });

  it('displays /100 suffix', () => {
    render(<ResumeScoreSection score={85} />);
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('shows "Excellent Score!" for scores 71-100', () => {
    render(<ResumeScoreSection score={85} />);
    expect(screen.getByText('Excellent Score!')).toBeInTheDocument();
  });

  it('shows "Good Progress" for scores 41-70', () => {
    render(<ResumeScoreSection score={60} />);
    expect(screen.getByText('Good Progress')).toBeInTheDocument();
  });

  it('shows "Needs Improvement" for scores 0-40', () => {
    render(<ResumeScoreSection score={30} />);
    expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
  });

  it('animates score from 0 to target value', async () => {
    render(<ResumeScoreSection score={85} />);
    
    // Initially should show 0
    expect(screen.getByText('0')).toBeInTheDocument();
    
    // Fast-forward time to complete animation
    await vi.advanceTimersByTimeAsync(1100);
    
    // Should now show the target score
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('handles edge case score of 0', async () => {
    render(<ResumeScoreSection score={0} />);
    await vi.advanceTimersByTimeAsync(1100);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
  });

  it('handles edge case score of 100', async () => {
    render(<ResumeScoreSection score={100} />);
    await vi.advanceTimersByTimeAsync(1100);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Excellent Score!')).toBeInTheDocument();
  });

  it('handles boundary score of 41 (yellow range)', () => {
    render(<ResumeScoreSection score={41} />);
    expect(screen.getByText('Good Progress')).toBeInTheDocument();
  });

  it('handles boundary score of 71 (green range)', () => {
    render(<ResumeScoreSection score={71} />);
    expect(screen.getByText('Excellent Score!')).toBeInTheDocument();
  });

  it('handles boundary score of 40 (red range)', () => {
    render(<ResumeScoreSection score={40} />);
    expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
  });

  it('handles boundary score of 70 (yellow range)', () => {
    render(<ResumeScoreSection score={70} />);
    expect(screen.getByText('Good Progress')).toBeInTheDocument();
  });
});

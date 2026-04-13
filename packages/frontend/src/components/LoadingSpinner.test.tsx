import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render spinner without text', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeInTheDocument();
  });

  it('should render spinner with text', () => {
    render(<LoadingSpinner text="Processing your resume..." />);
    expect(screen.getByText('Processing your resume...')).toBeInTheDocument();
  });

  it('should apply small size classes', () => {
    render(<LoadingSpinner size="sm" text="Loading" />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('w-6', 'h-6');
  });

  it('should apply medium size classes by default', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('w-12', 'h-12');
  });

  it('should apply large size classes', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('w-16', 'h-16');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <LoadingSpinner className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should have spinning animation', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('should apply correct text size for small spinner', () => {
    render(<LoadingSpinner size="sm" text="Loading" />);
    const text = screen.getByText('Loading');
    expect(text).toHaveClass('text-sm');
  });

  it('should apply correct text size for large spinner', () => {
    render(<LoadingSpinner size="lg" text="Loading" />);
    const text = screen.getByText('Loading');
    expect(text).toHaveClass('text-xl');
  });
});

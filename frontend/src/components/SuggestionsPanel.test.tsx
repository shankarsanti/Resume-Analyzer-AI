import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuggestionsPanel from './SuggestionsPanel';

describe('SuggestionsPanel', () => {
  it('renders the component with suggestions', () => {
    const suggestions = [
      'Add more technical skills',
      'Improve professional summary',
      'Include quantifiable achievements',
    ];

    render(<SuggestionsPanel suggestions={suggestions} />);

    expect(screen.getByText('Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Add more technical skills')).toBeInTheDocument();
    expect(screen.getByText('Improve professional summary')).toBeInTheDocument();
    expect(
      screen.getByText('Include quantifiable achievements')
    ).toBeInTheDocument();
  });

  it('displays the info note', () => {
    const suggestions = ['Add skills'];

    render(<SuggestionsPanel suggestions={suggestions} />);

    expect(
      screen.getByText('Note: Real systems analyze 50+ factors for suggestions')
    ).toBeInTheDocument();
  });

  it('limits display to top 5 suggestions', () => {
    const suggestions = [
      'Suggestion 1',
      'Suggestion 2',
      'Suggestion 3',
      'Suggestion 4',
      'Suggestion 5',
      'Suggestion 6',
      'Suggestion 7',
    ];

    render(<SuggestionsPanel suggestions={suggestions} />);

    // Should display first 5
    expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
    expect(screen.getByText('Suggestion 2')).toBeInTheDocument();
    expect(screen.getByText('Suggestion 3')).toBeInTheDocument();
    expect(screen.getByText('Suggestion 4')).toBeInTheDocument();
    expect(screen.getByText('Suggestion 5')).toBeInTheDocument();

    // Should not display 6th and 7th
    expect(screen.queryByText('Suggestion 6')).not.toBeInTheDocument();
    expect(screen.queryByText('Suggestion 7')).not.toBeInTheDocument();
  });

  it('renders lightbulb icons for each suggestion', () => {
    const suggestions = ['Suggestion 1', 'Suggestion 2'];

    const { container } = render(<SuggestionsPanel suggestions={suggestions} />);

    // Check for SVG elements (Lucide icons render as SVGs)
    const icons = container.querySelectorAll('svg');
    // Should have at least 2 lightbulb icons (one per suggestion)
    expect(icons.length).toBeGreaterThanOrEqual(2);
  });

  it('handles empty suggestions array', () => {
    render(<SuggestionsPanel suggestions={[]} />);

    expect(screen.getByText('Suggestions')).toBeInTheDocument();
    expect(
      screen.getByText('Note: Real systems analyze 50+ factors for suggestions')
    ).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const suggestions = ['Test suggestion'];

    const { container } = render(<SuggestionsPanel suggestions={suggestions} />);

    // Check card container styling - updated for responsive classes
    const card = container.querySelector('.bg-white.rounded-xl.shadow-md');
    expect(card).toBeInTheDocument();

    // Check header styling - updated for responsive classes
    const header = screen.getByText('Suggestions');
    expect(header).toHaveClass('font-semibold', 'text-gray-900');
  });
});

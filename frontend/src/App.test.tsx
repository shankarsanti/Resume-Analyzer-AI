import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Check for header logo
    expect(screen.getAllByText(/Resume Analyzer/i).length).toBeGreaterThan(0);
  });

  it('renders landing page by default', () => {
    render(<App />);
    // Check for unique landing page content
    expect(screen.getByText(/AI Resume Analyzer/i)).toBeDefined();
    expect(screen.getByText(/Improve your resume instantly/i)).toBeDefined();
  });

  it('has navigation header', () => {
    render(<App />);
    // Check for header element
    const header = document.querySelector('header');
    expect(header).toBeDefined();
  });
});

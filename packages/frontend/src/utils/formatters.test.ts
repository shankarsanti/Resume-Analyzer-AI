import { describe, it, expect } from 'vitest';
import { formatFileSize, getFileTypeDisplay } from './formatters';

describe('formatFileSize', () => {
  it('should format 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
    expect(formatFileSize(1023)).toBe('1023 Bytes');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(10240)).toBe('10.0 KB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1.0 MB');
    expect(formatFileSize(2621440)).toBe('2.5 MB');
    expect(formatFileSize(10485760)).toBe('10.0 MB');
  });

  it('should format gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1.0 GB');
    expect(formatFileSize(2147483648)).toBe('2.0 GB');
  });

  it('should round to 1 decimal place', () => {
    expect(formatFileSize(1536000)).toBe('1.5 MB');
    expect(formatFileSize(1638400)).toBe('1.6 MB');
  });
});

describe('getFileTypeDisplay', () => {
  it('should return PDF for .pdf extension', () => {
    const file = new File([''], 'resume.pdf', { type: 'application/pdf' });
    expect(getFileTypeDisplay(file)).toBe('PDF');
  });

  it('should return DOCX for .docx extension', () => {
    const file = new File([''], 'resume.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    expect(getFileTypeDisplay(file)).toBe('DOCX');
  });

  it('should return DOCX for .doc extension', () => {
    const file = new File([''], 'resume.doc', { type: 'application/msword' });
    expect(getFileTypeDisplay(file)).toBe('DOCX');
  });

  it('should fallback to MIME type for PDF', () => {
    const file = new File([''], 'resume', { type: 'application/pdf' });
    expect(getFileTypeDisplay(file)).toBe('PDF');
  });

  it('should fallback to MIME type for DOCX', () => {
    const file = new File([''], 'resume', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    expect(getFileTypeDisplay(file)).toBe('DOCX');
  });

  it('should return extension for unknown types', () => {
    const file = new File([''], 'file.txt', { type: 'text/plain' });
    expect(getFileTypeDisplay(file)).toBe('TXT');
  });
});

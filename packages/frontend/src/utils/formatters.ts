/**
 * Utility functions for formatting data
 */

/**
 * Format file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.4 MB", "156 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  // Limit to 1 decimal place for readability
  const value = bytes / Math.pow(k, i);
  const formattedValue = i === 0 ? value : value.toFixed(1);

  return `${formattedValue} ${sizes[i]}`;
}

/**
 * Get file type display name from file extension or MIME type
 * @param file - File object
 * @returns Display name (e.g., "PDF", "DOCX")
 */
export function getFileTypeDisplay(file: File): string {
  const extension = file.name.split('.').pop()?.toUpperCase();
  
  if (extension === 'PDF') return 'PDF';
  if (extension === 'DOCX' || extension === 'DOC') return 'DOCX';
  
  // Fallback to MIME type
  if (file.type.includes('pdf')) return 'PDF';
  if (file.type.includes('word') || file.type.includes('document')) return 'DOCX';
  
  return extension || 'Unknown';
}

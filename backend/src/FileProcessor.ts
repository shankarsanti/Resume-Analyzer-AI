import { ValidationResult } from '@resume-analyzer/shared';
import * as fs from 'fs';

/**
 * FileProcessor handles validation of uploaded resume files
 * Supports PDF (versions 1.4-2.0) and DOCX (Office Open XML) formats
 */
export class FileProcessor {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  private static readonly PDF_MAGIC_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF
  private static readonly DOCX_MAGIC_BYTES = Buffer.from([0x50, 0x4B, 0x03, 0x04]); // PK (ZIP signature)

  /**
   * Validates a resume file for format, size, and integrity
   * @param filePathOrBuffer - Path to the file or Buffer containing file data
   * @param originalName - Original filename (used for extension checking)
   * @returns ValidationResult indicating success or failure with error message
   */
  validate(filePathOrBuffer: string | Buffer, originalName: string): ValidationResult {
    try {
      let fileBuffer: Buffer;

      // Handle Buffer input (from multer memory storage)
      if (Buffer.isBuffer(filePathOrBuffer)) {
        fileBuffer = filePathOrBuffer;

        // Validate file size (max 10MB)
        if (fileBuffer.length > FileProcessor.MAX_FILE_SIZE) {
          return {
            isValid: false,
            error: `File size exceeds 10MB limit. Your file is ${(fileBuffer.length / (1024 * 1024)).toFixed(2)}MB`
          };
        }

        // Check if file is empty
        if (fileBuffer.length === 0) {
          return {
            isValid: false,
            error: 'File is empty'
          };
        }
      } else {
        // Handle file path input
        const filePath = filePathOrBuffer;

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          return {
            isValid: false,
            error: 'File not found'
          };
        }

        // Get file stats for size validation
        const stats = fs.statSync(filePath);
        
        // Validate file size (max 10MB)
        if (stats.size > FileProcessor.MAX_FILE_SIZE) {
          return {
            isValid: false,
            error: `File size exceeds 10MB limit. Your file is ${(stats.size / (1024 * 1024)).toFixed(2)}MB`
          };
        }

        // Check if file is empty
        if (stats.size === 0) {
          return {
            isValid: false,
            error: 'File is empty'
          };
        }

        // Read file buffer for format validation
        fileBuffer = fs.readFileSync(filePath);
      }

      // Determine file type from extension
      const extension = originalName.toLowerCase().split('.').pop();

      if (extension === 'pdf') {
        return this.validatePDF(fileBuffer);
      } else if (extension === 'docx') {
        return this.validateDOCX(fileBuffer);
      } else {
        return {
          isValid: false,
          error: `Unsupported file format. Only PDF and DOCX files are accepted. Received: ${extension}`
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: `File validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validates PDF file format and version
   * Supports PDF versions 1.4 through 2.0
   */
  private validatePDF(buffer: Buffer): ValidationResult {
    try {
      // Check PDF magic bytes (%PDF)
      if (!buffer.subarray(0, 4).equals(FileProcessor.PDF_MAGIC_BYTES)) {
        return {
          isValid: false,
          error: 'File is not a valid PDF (invalid file signature)'
        };
      }

      // Extract PDF version from header (format: %PDF-X.Y)
      const header = buffer.subarray(0, 20).toString('ascii');
      const versionMatch = header.match(/%PDF-(\d+\.\d+)/);

      if (!versionMatch) {
        return {
          isValid: false,
          error: 'PDF file is corrupted or unreadable (cannot determine version)'
        };
      }

      const version = parseFloat(versionMatch[1]);

      // Validate PDF version (1.4 to 2.0)
      if (version < 1.4 || version > 2.0) {
        return {
          isValid: false,
          error: `PDF version ${version} is not supported. Supported versions: 1.4 through 2.0`
        };
      }

      // Check for basic PDF structure markers
      const content = buffer.toString('binary');
      
      // PDF must contain %%EOF marker at the end
      if (!content.includes('%%EOF')) {
        return {
          isValid: false,
          error: 'PDF file is corrupted or unreadable (missing end-of-file marker)'
        };
      }

      // PDF should contain basic structure elements
      if (!content.includes('/Type') && !content.includes('obj')) {
        return {
          isValid: false,
          error: 'PDF file is corrupted or unreadable (missing required structure)'
        };
      }

      return {
        isValid: true
      };
    } catch (error) {
      return {
        isValid: false,
        error: `PDF validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validates DOCX file format (Office Open XML)
   * Checks for ZIP structure and required DOCX components
   */
  private validateDOCX(buffer: Buffer): ValidationResult {
    try {
      // Check ZIP magic bytes (PK\x03\x04) - DOCX is a ZIP archive
      if (!buffer.subarray(0, 4).equals(FileProcessor.DOCX_MAGIC_BYTES)) {
        return {
          isValid: false,
          error: 'File is not a valid DOCX (invalid file signature)'
        };
      }

      // Convert buffer to string for content checking
      const content = buffer.toString('binary');

      // DOCX files must contain specific Office Open XML structure
      // Check for required DOCX components
      const hasContentTypes = content.includes('[Content_Types].xml');
      const hasWordDocument = content.includes('word/document.xml');
      const hasRels = content.includes('_rels/.rels');

      if (!hasContentTypes) {
        return {
          isValid: false,
          error: 'DOCX file is corrupted or unreadable (missing Content_Types.xml)'
        };
      }

      if (!hasWordDocument) {
        return {
          isValid: false,
          error: 'DOCX file is corrupted or unreadable (missing word/document.xml)'
        };
      }

      if (!hasRels) {
        return {
          isValid: false,
          error: 'DOCX file is corrupted or unreadable (missing relationships)'
        };
      }

      // Check for Office Open XML namespace
      if (!content.includes('schemas.openxmlformats.org')) {
        return {
          isValid: false,
          error: 'File is not a valid Office Open XML document (DOCX format required)'
        };
      }

      // Check for ZIP end of central directory signature
      const eocdrSignature = Buffer.from([0x50, 0x4B, 0x05, 0x06]);
      let hasEOCDR = false;
      
      // Search for EOCDR signature in the last 1KB of the file
      const searchStart = Math.max(0, buffer.length - 1024);
      for (let i = searchStart; i < buffer.length - 4; i++) {
        if (buffer.subarray(i, i + 4).equals(eocdrSignature)) {
          hasEOCDR = true;
          break;
        }
      }

      if (!hasEOCDR) {
        return {
          isValid: false,
          error: 'DOCX file is corrupted or unreadable (incomplete ZIP archive)'
        };
      }

      return {
        isValid: true
      };
    } catch (error) {
      return {
        isValid: false,
        error: `DOCX validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

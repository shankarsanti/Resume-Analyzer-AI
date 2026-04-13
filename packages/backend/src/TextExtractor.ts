import { ExtractionResult } from '@resume-analyzer/shared';
import * as fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * TextExtractor handles text extraction from PDF and DOCX resume files
 * Preserves text order as it appears in the original file
 */
export class TextExtractor {
  /**
   * Extracts text content from a PDF or DOCX file
   * @param filePathOrBuffer - Path to the file or Buffer containing file data
   * @param fileTypeOrName - File type ('pdf' or 'docx') or original filename to derive type from
   * @returns ExtractionResult with extracted text or error message
   */
  async extract(filePathOrBuffer: string | Buffer, fileTypeOrName: string): Promise<ExtractionResult> {
    try {
      let fileBuffer: Buffer;
      let fileType: 'pdf' | 'docx';

      // Determine file type from parameter
      if (fileTypeOrName === 'pdf' || fileTypeOrName === 'docx') {
        fileType = fileTypeOrName;
      } else {
        // Extract file type from filename
        const extension = fileTypeOrName.toLowerCase().split('.').pop();
        if (extension === 'pdf' || extension === 'docx') {
          fileType = extension;
        } else {
          return {
            text: '',
            error: `Unsupported file type: ${extension}`
          };
        }
      }

      // Handle Buffer input (from multer memory storage)
      if (Buffer.isBuffer(filePathOrBuffer)) {
        fileBuffer = filePathOrBuffer;
      } else {
        // Handle file path input
        const filePath = filePathOrBuffer;

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          return {
            text: '',
            error: 'File not found'
          };
        }

        fileBuffer = fs.readFileSync(filePath);
      }

      // Extract text based on file type
      if (fileType === 'pdf') {
        return await this.extractFromPDF(fileBuffer);
      } else {
        return await this.extractFromDOCX(fileBuffer);
      }
    } catch (error) {
      return {
        text: '',
        error: `Text extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Extracts text from a PDF file using pdf-parse library
   * Detects image-only/scanned PDFs and returns appropriate error
   */
  private async extractFromPDF(dataBuffer: Buffer): Promise<ExtractionResult> {
    try {
      // Parse PDF and extract text
      const pdfData = await pdfParse(dataBuffer);
      
      // Get extracted text
      const extractedText = pdfData.text.trim();

      // Check if text is empty (image-only or scanned PDF)
      if (!extractedText || extractedText.length === 0) {
        // Check if PDF has pages but no text (likely scanned/image-only)
        if (pdfData.numpages > 0) {
          return {
            text: '',
            error: 'PDF contains images or scanned content. OCR is not supported. Please provide a text-based PDF.'
          };
        }
        
        return {
          text: '',
          error: 'No text found in PDF file'
        };
      }

      // Additional check: if text is very short relative to page count, might be scanned
      // Heuristic: less than 50 characters per page suggests scanned content
      const avgCharsPerPage = extractedText.length / pdfData.numpages;
      if (avgCharsPerPage < 50) {
        return {
          text: '',
          error: 'PDF appears to contain mostly images or scanned content. OCR is not supported. Please provide a text-based PDF.'
        };
      }

      return {
        text: extractedText
      };
    } catch (error) {
      // Handle specific pdf-parse errors
      if (error instanceof Error) {
        if (error.message.includes('Invalid PDF')) {
          return {
            text: '',
            error: 'PDF file is corrupted or unreadable'
          };
        }
        if (error.message.includes('encrypted')) {
          return {
            text: '',
            error: 'PDF file is password-protected. Please provide an unencrypted PDF.'
          };
        }
      }
      
      return {
        text: '',
        error: `PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Extracts text from a DOCX file using mammoth library
   * Preserves text order and basic structure
   */
  private async extractFromDOCX(dataBuffer: Buffer): Promise<ExtractionResult> {
    try {
      // Extract text from DOCX using mammoth
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      
      // Get extracted text
      const extractedText = result.value.trim();

      // Check if text is empty
      if (!extractedText || extractedText.length === 0) {
        return {
          text: '',
          error: 'No text found in DOCX file'
        };
      }

      // Log any warnings from mammoth (but don't fail extraction)
      if (result.messages && result.messages.length > 0) {
        const errors = result.messages.filter(m => m.type === 'error');
        if (errors.length > 0) {
          console.warn('DOCX extraction warnings:', errors);
        }
      }

      return {
        text: extractedText
      };
    } catch (error) {
      // Handle specific mammoth errors
      if (error instanceof Error) {
        if (error.message.includes('ENOENT') || error.message.includes('no such file')) {
          return {
            text: '',
            error: 'DOCX file not found'
          };
        }
        if (error.message.includes('not a valid zip file') || error.message.includes('invalid')) {
          return {
            text: '',
            error: 'DOCX file is corrupted or unreadable'
          };
        }
      }
      
      return {
        text: '',
        error: `DOCX extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

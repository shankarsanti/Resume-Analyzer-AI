import { describe, it, beforeEach, afterEach } from 'vitest';
import { TextExtractor } from './TextExtractor';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Property-Based Tests for TextExtractor
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**
 */
describe('TextExtractor - Property-Based Tests', () => {
  let textExtractor: TextExtractor;
  let tempDir: string;

  beforeEach(() => {
    textExtractor = new TextExtractor();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'textextractor-pbt-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  /**
   * Property 2: Text Extraction Completeness and Order Preservation
   * **Validates: Requirements 2.1, 2.2, 2.5**
   * 
   * For any valid PDF or DOCX with readable text content, the Text_Extractor SHALL
   * extract all text content and preserve the order in which text appears in the original file.
   */
  describe('Property 2: Text Extraction Completeness and Order Preservation', () => {
    it('should extract all text from valid PDFs and preserve order', async () => {
      await fc.assert(
        fc.asyncProperty(
          validPDFWithTextGenerator(),
          async (pdfData) => {
            const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.pdf`);
            fs.writeFileSync(filePath, pdfData.buffer);

            try {
              const result = await textExtractor.extract(filePath, 'pdf');

              // Check that extraction succeeded
              if (result.error !== undefined) {
                return false;
              }

              // Check that text is not empty
              if (!result.text || result.text.trim().length === 0) {
                return false;
              }

              // Check that all text segments appear in order
              // The text should contain all segments in the same order they were added
              let lastIndex = -1;
              for (const segment of pdfData.textSegments) {
                const trimmedSegment = segment.trim();
                if (trimmedSegment.length === 0) continue;
                
                const currentIndex = result.text.indexOf(trimmedSegment);
                if (currentIndex === -1 || currentIndex < lastIndex) {
                  return false;
                }
                lastIndex = currentIndex;
              }

              return true;
            } finally {
              // Cleanup
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should extract all text from valid DOCX files and preserve order', async () => {
      await fc.assert(
        fc.asyncProperty(
          validDOCXWithTextGenerator(),
          async (docxData) => {
            const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.docx`);
            fs.writeFileSync(filePath, docxData.buffer);

            try {
              const result = await textExtractor.extract(filePath, 'docx');

              // Check that extraction succeeded
              if (result.error !== undefined) {
                return false;
              }

              // Check that text is not empty
              if (!result.text || result.text.trim().length === 0) {
                return false;
              }

              // Check that all text segments appear in order
              let lastIndex = -1;
              for (const segment of docxData.textSegments) {
                const trimmedSegment = segment.trim();
                if (trimmedSegment.length === 0) continue;
                
                const currentIndex = result.text.indexOf(trimmedSegment);
                if (currentIndex === -1 || currentIndex < lastIndex) {
                  return false;
                }
                lastIndex = currentIndex;
              }

              return true;
            } finally {
              // Cleanup
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 3: Text Extraction Error Handling
   * **Validates: Requirements 2.3, 2.4, 2.6**
   * 
   * For any PDF that contains only images/scanned content or any file that produces empty text,
   * the Text_Extractor SHALL return a descriptive error message indicating the specific issue
   * (OCR not supported or no text found).
   */
  describe('Property 3: Text Extraction Error Handling', () => {
    it('should return error for image-only/scanned PDFs', async () => {
      await fc.assert(
        fc.asyncProperty(
          imageOnlyPDFGenerator(),
          async (pdfData) => {
            const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.pdf`);
            fs.writeFileSync(filePath, pdfData.buffer);

            try {
              const result = await textExtractor.extract(filePath, 'pdf');

              // Should return error
              if (result.error === undefined) {
                return false;
              }

              // Text should be empty
              if (result.text !== '') {
                return false;
              }

              // Error message should indicate OCR not supported or scanned content
              const errorLower = result.error.toLowerCase();
              return (
                errorLower.includes('ocr') ||
                errorLower.includes('scanned') ||
                errorLower.includes('image')
              );
            } finally {
              // Cleanup
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should return error for empty PDFs (no text)', async () => {
      await fc.assert(
        fc.asyncProperty(
          emptyPDFGenerator(),
          async (pdfData) => {
            const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.pdf`);
            fs.writeFileSync(filePath, pdfData.buffer);

            try {
              const result = await textExtractor.extract(filePath, 'pdf');

              // Should return error
              if (result.error === undefined) {
                return false;
              }

              // Text should be empty
              if (result.text !== '') {
                return false;
              }

              // Error message should indicate no text found
              const errorLower = result.error.toLowerCase();
              return (
                errorLower.includes('no text') ||
                errorLower.includes('empty') ||
                errorLower.includes('scanned') ||
                errorLower.includes('image')
              );
            } finally {
              // Cleanup
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should return error for empty DOCX files (no text)', async () => {
      await fc.assert(
        fc.asyncProperty(
          emptyDOCXGenerator(),
          async (docxData) => {
            const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.docx`);
            fs.writeFileSync(filePath, docxData.buffer);

            try {
              const result = await textExtractor.extract(filePath, 'docx');

              // Should return error
              if (result.error === undefined) {
                return false;
              }

              // Text should be empty
              if (result.text !== '') {
                return false;
              }

              // Error message should indicate no text found
              const errorLower = result.error.toLowerCase();
              return errorLower.includes('no text');
            } finally {
              // Cleanup
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should return error for corrupted PDFs', async () => {
      await fc.assert(
        fc.asyncProperty(
          corruptedPDFGenerator(),
          async (pdfData) => {
            const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.pdf`);
            fs.writeFileSync(filePath, pdfData.buffer);

            try {
              const result = await textExtractor.extract(filePath, 'pdf');

              // Should return error
              if (result.error === undefined) {
                return false;
              }

              // Text should be empty
              if (result.text !== '') {
                return false;
              }

              // Error message should be descriptive
              return result.error.length > 0;
            } finally {
              // Cleanup
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should return error for corrupted DOCX files', async () => {
      await fc.assert(
        fc.asyncProperty(
          corruptedDOCXGenerator(),
          async (docxData) => {
            const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.docx`);
            fs.writeFileSync(filePath, docxData.buffer);

            try {
              const result = await textExtractor.extract(filePath, 'docx');

              // Should return error
              if (result.error === undefined) {
                return false;
              }

              // Text should be empty
              if (result.text !== '') {
                return false;
              }

              // Error message should be descriptive
              return result.error.length > 0;
            } finally {
              // Cleanup
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});

// ============================================================================
// Custom Generators
// ============================================================================

/**
 * Generates valid PDFs with readable text content
 */
function validPDFWithTextGenerator() {
  return fc.record({
    version: fc.constantFrom('1.4', '1.5', '1.6', '1.7', '2.0'),
    textSegments: fc.array(
      fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length > 0),
      { minLength: 3, maxLength: 10 }
    ),
  }).map(({ version, textSegments }) => {
    // Ensure segments have enough non-whitespace characters to avoid scanned PDF detection
    const enhancedSegments = textSegments.map((seg, idx) => {
      const trimmed = seg.trim();
      const base = trimmed.length > 0 ? trimmed : `text${idx}`;
      // Ensure at least 50 characters per segment to avoid scanned detection (50 chars/page threshold)
      return base.length < 50 ? base + ' additional content '.repeat(Math.ceil((50 - base.length) / 20)) : base;
    });
    const content = enhancedSegments.join('\n');
    const pdfContent = createValidPDF(version, content);
    return {
      buffer: pdfContent,
      textSegments: enhancedSegments,
      version,
    };
  });
}

/**
 * Generates valid DOCX files with readable text content
 */
function validDOCXWithTextGenerator() {
  return fc.record({
    textSegments: fc.array(
      fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length > 0),
      { minLength: 3, maxLength: 10 }
    ),
  }).map(({ textSegments }) => {
    // Ensure segments have non-whitespace content
    const enhancedSegments = textSegments.map((seg, idx) => {
      const trimmed = seg.trim();
      return trimmed.length > 0 ? trimmed : `text${idx}`;
    });
    const content = enhancedSegments.join('\n');
    const docxContent = createValidDOCX(content);
    return {
      buffer: docxContent,
      textSegments: enhancedSegments,
    };
  });
}

/**
 * Generates image-only/scanned PDFs (PDFs with very little text)
 */
function imageOnlyPDFGenerator() {
  return fc.constantFrom('1.4', '1.5', '1.6', '1.7', '2.0').map((version) => {
    // Create PDF with minimal text (< 50 chars per page to trigger scanned detection)
    const minimalText = 'x'; // Just 1 character
    const pdfContent = createValidPDF(version, minimalText);
    return {
      buffer: pdfContent,
      version,
    };
  });
}

/**
 * Generates empty PDFs (no text content)
 */
function emptyPDFGenerator() {
  return fc.constantFrom('1.4', '1.5', '1.6', '1.7', '2.0').map((version) => {
    const pdfContent = createPDFWithoutText(version);
    return {
      buffer: pdfContent,
      version,
    };
  });
}

/**
 * Generates empty DOCX files (no text content)
 */
function emptyDOCXGenerator() {
  return fc.constant(null).map(() => {
    const docxContent = createValidDOCX('');
    return {
      buffer: docxContent,
    };
  });
}

/**
 * Generates corrupted PDF files
 */
function corruptedPDFGenerator() {
  return fc.constantFrom(
    'no_eof',
    'no_structure',
    'truncated',
    'invalid_header'
  ).map((corruptionType) => {
    let buffer: Buffer;
    
    switch (corruptionType) {
      case 'no_eof':
        buffer = Buffer.from(
          '%PDF-1.7\n' +
          '1 0 obj\n' +
          '<< /Type /Catalog >>\n' +
          'endobj\n'
        );
        break;
      
      case 'no_structure':
        buffer = Buffer.from(
          '%PDF-1.7\n' +
          'Random content without structure\n' +
          '%%EOF'
        );
        break;
      
      case 'truncated':
        buffer = Buffer.from('%PDF-1.7\n1 0 obj\n<<');
        break;
      
      case 'invalid_header':
        buffer = Buffer.from('Not a PDF file');
        break;
      
      default:
        buffer = Buffer.from('%PDF-1.7\n');
    }
    
    return {
      buffer,
      corruptionType,
    };
  });
}

/**
 * Generates corrupted DOCX files
 */
function corruptedDOCXGenerator() {
  return fc.constantFrom(
    'no_content_types',
    'no_document',
    'incomplete_zip',
    'wrong_signature'
  ).map((corruptionType) => {
    let buffer: Buffer;
    
    switch (corruptionType) {
      case 'no_content_types':
        buffer = createInvalidDOCX('no-content-types');
        break;
      
      case 'no_document':
        buffer = createInvalidDOCX('no-document');
        break;
      
      case 'incomplete_zip':
        buffer = createInvalidDOCX('incomplete');
        break;
      
      case 'wrong_signature':
        buffer = Buffer.from('Not a DOCX file');
        break;
      
      default:
        buffer = Buffer.from([0x50, 0x4B, 0x03, 0x04]);
    }
    
    return {
      buffer,
      corruptionType,
    };
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates a valid PDF with specified version and content
 */
function createValidPDF(version: string, content: string): Buffer {
  const pdfContent = `%PDF-${version}
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length ${content.length + 50} >>
stream
BT
/F1 12 Tf
50 700 Td
(${content.replace(/\n/g, ') Tj T* (')}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000300 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
${400 + content.length}
%%EOF`;
  return Buffer.from(pdfContent);
}

/**
 * Creates a PDF without text content
 */
function createPDFWithoutText(version: string): Buffer {
  const pdfContent = `%PDF-${version}
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [0 0 612 792] >>
endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer
<< /Size 4 /Root 1 0 R >>
startxref
200
%%EOF`;
  return Buffer.from(pdfContent);
}

/**
 * Creates a valid DOCX with specified content
 */
function createValidDOCX(content: string): Buffer {
  const parts: Buffer[] = [];
  
  // [Content_Types].xml
  const contentTypesData = Buffer.from(
    '<?xml version="1.0"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '</Types>'
  );
  parts.push(createZipEntry('[Content_Types].xml', contentTypesData));
  
  // _rels/.rels
  const relsData = Buffer.from(
    '<?xml version="1.0"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>'
  );
  parts.push(createZipEntry('_rels/.rels', relsData));
  
  // word/document.xml
  const paragraphs = content.split('\n').map(line => 
    `<w:p><w:r><w:t>${escapeXml(line)}</w:t></w:r></w:p>`
  ).join('');
  
  const documentData = Buffer.from(
    '<?xml version="1.0"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    `<w:body>${paragraphs}</w:body>` +
    '</w:document>'
  );
  parts.push(createZipEntry('word/document.xml', documentData));
  
  // EOCDR
  const eocdr = Buffer.from([
    0x50, 0x4B, 0x05, 0x06,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00
  ]);
  parts.push(eocdr);
  
  return Buffer.concat(parts);
}

/**
 * Escapes XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Creates a ZIP entry for DOCX files
 */
function createZipEntry(filename: string, data: Buffer): Buffer {
  const filenameBuffer = Buffer.from(filename);
  const header = Buffer.alloc(30 + filenameBuffer.length);
  
  header.writeUInt32LE(0x04034b50, 0); // Local file header signature
  header.writeUInt16LE(20, 4); // Version needed to extract
  header.writeUInt16LE(0, 6); // General purpose bit flag
  header.writeUInt16LE(0, 8); // Compression method (0 = no compression)
  header.writeUInt16LE(0, 10); // File modification time
  header.writeUInt16LE(0, 12); // File modification date
  header.writeUInt32LE(0, 14); // CRC-32
  header.writeUInt32LE(data.length, 18); // Compressed size
  header.writeUInt32LE(data.length, 22); // Uncompressed size
  header.writeUInt16LE(filenameBuffer.length, 26); // Filename length
  header.writeUInt16LE(0, 28); // Extra field length
  filenameBuffer.copy(header, 30); // Filename
  
  return Buffer.concat([header, data]);
}

/**
 * Creates invalid DOCX files for testing
 */
function createInvalidDOCX(type: string): Buffer {
  const parts: Buffer[] = [];
  
  switch (type) {
    case 'no-content-types':
      // Missing [Content_Types].xml
      parts.push(Buffer.from([0x50, 0x4B, 0x03, 0x04]));
      parts.push(createZipEntry('_rels/.rels', Buffer.from('<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>')));
      parts.push(createZipEntry('word/document.xml', Buffer.from('<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"></w:document>')));
      break;
    
    case 'no-document':
      // Missing word/document.xml
      parts.push(Buffer.from([0x50, 0x4B, 0x03, 0x04]));
      parts.push(createZipEntry('[Content_Types].xml', Buffer.from('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>')));
      parts.push(createZipEntry('_rels/.rels', Buffer.from('<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>')));
      break;
    
    case 'incomplete':
      // Missing EOCDR
      parts.push(Buffer.from([0x50, 0x4B, 0x03, 0x04]));
      parts.push(createZipEntry('[Content_Types].xml', Buffer.from('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>')));
      parts.push(createZipEntry('_rels/.rels', Buffer.from('<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>')));
      parts.push(createZipEntry('word/document.xml', Buffer.from('<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"></w:document>')));
      return Buffer.concat(parts);
  }
  
  // Add EOCDR for all cases except 'incomplete'
  const eocdr = Buffer.from([
    0x50, 0x4B, 0x05, 0x06,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00
  ]);
  parts.push(eocdr);
  
  return Buffer.concat(parts);
}

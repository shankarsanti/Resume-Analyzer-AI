import { describe, it, beforeEach, afterEach } from 'vitest';
import { FileProcessor } from './FileProcessor';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Property-Based Tests for FileProcessor
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7**
 */
describe('FileProcessor - Property-Based Tests', () => {
  let fileProcessor: FileProcessor;
  let tempDir: string;

  beforeEach(() => {
    fileProcessor = new FileProcessor();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fileprocessor-pbt-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  /**
   * Property 1: File Format Validation
   * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7**
   * 
   * For any uploaded file, the File_Processor SHALL accept the file if and only if
   * it is a valid PDF format (version 1.4-2.0) or DOCX format (Office Open XML),
   * is not corrupted, and does not exceed 10MB in size.
   */
  describe('Property 1: File Format Validation', () => {
    it('should accept all valid PDF files (versions 1.4-2.0) under 10MB', () => {
      fc.assert(
        fc.property(
          validPDFGenerator(),
          (pdfData) => {
            const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.pdf`);
            fs.writeFileSync(filePath, pdfData.buffer);

            const result = fileProcessor.validate(filePath, 'test.pdf');

            // Cleanup
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }

            return result.isValid === true && result.error === undefined;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept all valid DOCX files under 10MB', () => {
      fc.assert(
        fc.property(
          validDOCXGenerator(),
          (docxData) => {
            const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.docx`);
            fs.writeFileSync(filePath, docxData.buffer);

            const result = fileProcessor.validate(filePath, 'test.docx');

            // Cleanup
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }

            return result.isValid === true && result.error === undefined;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject all invalid files (wrong format, too large, or corrupted)', () => {
      fc.assert(
        fc.property(
          invalidFileGenerator(),
          (fileData) => {
            const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.${fileData.extension}`);
            fs.writeFileSync(filePath, fileData.buffer);

            const result = fileProcessor.validate(filePath, `test.${fileData.extension}`);

            // Cleanup
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }

            return result.isValid === false && result.error !== undefined && result.error.length > 0;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject PDF files with unsupported versions (< 1.4 or > 2.0)', () => {
      fc.assert(
        fc.property(
          unsupportedPDFVersionGenerator(),
          (pdfData) => {
            const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.pdf`);
            fs.writeFileSync(filePath, pdfData.buffer);

            const result = fileProcessor.validate(filePath, 'test.pdf');

            // Cleanup
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }

            return (
              result.isValid === false &&
              result.error !== undefined &&
              result.error.includes('not supported')
            );
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject files exceeding 10MB size limit', () => {
      fc.assert(
        fc.property(
          oversizedFileGenerator(),
          (fileData) => {
            const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.${fileData.extension}`);
            fs.writeFileSync(filePath, fileData.buffer);

            const result = fileProcessor.validate(filePath, `test.${fileData.extension}`);

            // Cleanup
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }

            return (
              result.isValid === false &&
              result.error !== undefined &&
              result.error.includes('10MB')
            );
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject corrupted PDF files', () => {
      fc.assert(
        fc.property(
          corruptedPDFGenerator(),
          (pdfData) => {
            const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.pdf`);
            fs.writeFileSync(filePath, pdfData.buffer);

            const result = fileProcessor.validate(filePath, 'test.pdf');

            // Cleanup
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }

            return (
              result.isValid === false &&
              result.error !== undefined &&
              result.error.includes('corrupted')
            );
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject corrupted DOCX files', () => {
      fc.assert(
        fc.property(
          corruptedDOCXGenerator(),
          (docxData) => {
            const filePath = path.join(tempDir, `test-${Date.now()}-${Math.random()}.docx`);
            fs.writeFileSync(filePath, docxData.buffer);

            const result = fileProcessor.validate(filePath, 'test.docx');

            // Cleanup
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }

            return (
              result.isValid === false &&
              result.error !== undefined &&
              (result.error.includes('corrupted') || 
               result.error.includes('invalid') || 
               result.error.includes('not a valid'))
            );
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});

// ============================================================================
// Custom Generators
// ============================================================================

/**
 * Generates valid PDF files with versions 1.4-2.0 and sizes under 10MB
 */
function validPDFGenerator() {
  return fc.record({
    version: fc.constantFrom('1.4', '1.5', '1.6', '1.7', '2.0'),
    contentSize: fc.integer({ min: 100, max: 5000 }), // Content size in bytes
  }).map(({ version, contentSize }) => {
    const content = generateRandomText(contentSize);
    const pdfContent = createValidPDF(version, content);
    return {
      buffer: pdfContent,
      version,
      size: pdfContent.length,
    };
  });
}

/**
 * Generates valid DOCX files under 10MB
 */
function validDOCXGenerator() {
  return fc.record({
    contentSize: fc.integer({ min: 100, max: 5000 }), // Content size in bytes
  }).map(({ contentSize }) => {
    const content = generateRandomText(contentSize);
    const docxContent = createValidDOCX(content);
    return {
      buffer: docxContent,
      size: docxContent.length,
    };
  });
}

/**
 * Generates invalid files (wrong format, corrupted, or oversized)
 */
function invalidFileGenerator() {
  return fc.oneof(
    // Wrong file format
    fc.record({
      extension: fc.constantFrom('txt', 'jpg', 'png', 'doc', 'html', 'xml'),
      content: fc.string({ minLength: 10, maxLength: 1000 }),
    }).map(({ extension, content }) => ({
      buffer: Buffer.from(content),
      extension,
      reason: 'wrong_format',
    })),
    
    // Empty file
    fc.constantFrom('pdf', 'docx').map((extension) => ({
      buffer: Buffer.from(''),
      extension,
      reason: 'empty',
    })),
    
    // File with wrong extension but different content
    fc.record({
      extension: fc.constantFrom('pdf', 'docx'),
      content: fc.string({ minLength: 10, maxLength: 1000 }),
    }).map(({ extension, content }) => ({
      buffer: Buffer.from(content),
      extension,
      reason: 'wrong_signature',
    }))
  );
}

/**
 * Generates PDF files with unsupported versions (< 1.4 or > 2.0)
 */
function unsupportedPDFVersionGenerator() {
  return fc.constantFrom('1.0', '1.1', '1.2', '1.3', '2.1', '2.2', '3.0').map((version) => {
    const content = generateRandomText(500);
    const pdfContent = createValidPDF(version, content);
    return {
      buffer: pdfContent,
      version,
    };
  });
}

/**
 * Generates files exceeding 10MB size limit
 */
function oversizedFileGenerator() {
  return fc.constantFrom('pdf', 'docx').map((extension) => {
    // Create a file slightly over 10MB
    const size = 11 * 1024 * 1024; // 11MB
    const buffer = Buffer.alloc(size);
    
    if (extension === 'pdf') {
      // Add PDF header
      buffer.write('%PDF-1.7\n');
    } else {
      // Add ZIP header for DOCX
      buffer.writeUInt32LE(0x04034b50, 0);
    }
    
    return {
      buffer,
      extension,
      size,
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
    'no_version',
    'truncated'
  ).map((corruptionType) => {
    let buffer: Buffer;
    
    switch (corruptionType) {
      case 'no_eof':
        // PDF without %%EOF marker
        buffer = Buffer.from(
          '%PDF-1.7\n' +
          '1 0 obj\n' +
          '<< /Type /Catalog >>\n' +
          'endobj\n'
          // Missing %%EOF
        );
        break;
      
      case 'no_structure':
        // PDF with header and EOF but no structure
        buffer = Buffer.from(
          '%PDF-1.7\n' +
          'Some random content\n' +
          '%%EOF'
        );
        break;
      
      case 'no_version':
        // PDF without version information
        buffer = Buffer.from(
          '%PDF-\n' + // Missing version
          '1 0 obj\n' +
          '<< /Type /Catalog >>\n' +
          'endobj\n' +
          '%%EOF'
        );
        break;
      
      case 'truncated':
        // Truncated PDF
        buffer = Buffer.from('%PDF-1.7\n1 0 obj\n<<');
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
    'no_rels',
    'no_namespace',
    'incomplete_zip',
    'wrong_signature'
  ).map((corruptionType) => {
    let buffer: Buffer;
    
    switch (corruptionType) {
      case 'no_content_types':
        // Missing [Content_Types].xml
        buffer = createInvalidDOCX('no-content-types');
        break;
      
      case 'no_document':
        // Missing word/document.xml
        buffer = createInvalidDOCX('no-document');
        break;
      
      case 'no_rels':
        // Missing _rels/.rels
        buffer = createInvalidDOCX('no-rels');
        break;
      
      case 'no_namespace':
        // Missing Office Open XML namespace
        buffer = createInvalidDOCX('no-namespace');
        break;
      
      case 'incomplete_zip':
        // Missing EOCDR
        buffer = createInvalidDOCX('incomplete');
        break;
      
      case 'wrong_signature':
        // Wrong ZIP signature
        buffer = Buffer.from('Not a ZIP file');
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
 * Generates random text content
 */
function generateRandomText(size: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 \n';
  let result = '';
  for (let i = 0; i < size; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length ${content.length} >>
stream
${content}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000200 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
${300 + content.length}
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
  const documentData = Buffer.from(
    '<?xml version="1.0"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    `<w:body><w:p><w:r><w:t>${content}</w:t></w:r></w:p></w:body>` +
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
  
  // Start with ZIP signature
  parts.push(Buffer.from([0x50, 0x4B, 0x03, 0x04]));
  
  switch (type) {
    case 'no-content-types':
      // Missing [Content_Types].xml
      parts.push(createZipEntry('_rels/.rels', Buffer.from('<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>')));
      parts.push(createZipEntry('word/document.xml', Buffer.from('<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"></w:document>')));
      break;
    
    case 'no-document':
      // Missing word/document.xml
      parts.push(createZipEntry('[Content_Types].xml', Buffer.from('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>')));
      parts.push(createZipEntry('_rels/.rels', Buffer.from('<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>')));
      break;
    
    case 'no-rels':
      // Missing _rels/.rels
      parts.push(createZipEntry('[Content_Types].xml', Buffer.from('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>')));
      parts.push(createZipEntry('word/document.xml', Buffer.from('<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"></w:document>')));
      break;
    
    case 'no-namespace':
      // Missing Office Open XML namespace
      parts.push(createZipEntry('[Content_Types].xml', Buffer.from('<?xml version="1.0"?><Types></Types>')));
      parts.push(createZipEntry('_rels/.rels', Buffer.from('<?xml version="1.0"?><Relationships></Relationships>')));
      parts.push(createZipEntry('word/document.xml', Buffer.from('<?xml version="1.0"?><document></document>')));
      break;
    
    case 'incomplete':
      // Missing EOCDR
      parts.push(createZipEntry('[Content_Types].xml', Buffer.from('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>')));
      parts.push(createZipEntry('_rels/.rels', Buffer.from('<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>')));
      parts.push(createZipEntry('word/document.xml', Buffer.from('<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"></w:document>')));
      // Don't add EOCDR
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

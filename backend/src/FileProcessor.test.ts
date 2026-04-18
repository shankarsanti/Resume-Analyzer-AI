import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileProcessor } from './FileProcessor';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('FileProcessor', () => {
  let fileProcessor: FileProcessor;
  let tempDir: string;

  beforeEach(() => {
    fileProcessor = new FileProcessor();
    // Create a temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fileprocessor-test-'));
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('File Size Validation', () => {
    it('should reject files larger than 10MB', () => {
      const filePath = path.join(tempDir, 'large.pdf');
      // Create a file larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
      // Add PDF header
      largeBuffer.write('%PDF-1.7\n');
      fs.writeFileSync(filePath, largeBuffer);

      const result = fileProcessor.validate(filePath, 'large.pdf');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds 10MB limit');
      expect(result.error).toContain('11.00MB');
    });

    it('should accept files smaller than 10MB', () => {
      const filePath = path.join(tempDir, 'small.pdf');
      // Create a valid small PDF
      const pdfContent = createValidPDF('1.7');
      fs.writeFileSync(filePath, pdfContent);

      const result = fileProcessor.validate(filePath, 'small.pdf');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty files', () => {
      const filePath = path.join(tempDir, 'empty.pdf');
      fs.writeFileSync(filePath, '');

      const result = fileProcessor.validate(filePath, 'empty.pdf');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File is empty');
    });
  });

  describe('File Format Validation', () => {
    it('should reject unsupported file formats', () => {
      const filePath = path.join(tempDir, 'document.txt');
      fs.writeFileSync(filePath, 'This is a text file');

      const result = fileProcessor.validate(filePath, 'document.txt');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported file format');
      expect(result.error).toContain('txt');
    });

    it('should reject files with no extension', () => {
      const filePath = path.join(tempDir, 'document');
      fs.writeFileSync(filePath, 'Some content');

      const result = fileProcessor.validate(filePath, 'document');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported file format');
    });

    it('should handle non-existent files', () => {
      const filePath = path.join(tempDir, 'nonexistent.pdf');

      const result = fileProcessor.validate(filePath, 'nonexistent.pdf');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File not found');
    });
  });

  describe('PDF Validation', () => {
    it('should accept valid PDF version 1.4', () => {
      const filePath = path.join(tempDir, 'valid-1.4.pdf');
      const pdfContent = createValidPDF('1.4');
      fs.writeFileSync(filePath, pdfContent);

      const result = fileProcessor.validate(filePath, 'valid-1.4.pdf');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid PDF version 1.7', () => {
      const filePath = path.join(tempDir, 'valid-1.7.pdf');
      const pdfContent = createValidPDF('1.7');
      fs.writeFileSync(filePath, pdfContent);

      const result = fileProcessor.validate(filePath, 'valid-1.7.pdf');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid PDF version 2.0', () => {
      const filePath = path.join(tempDir, 'valid-2.0.pdf');
      const pdfContent = createValidPDF('2.0');
      fs.writeFileSync(filePath, pdfContent);

      const result = fileProcessor.validate(filePath, 'valid-2.0.pdf');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject PDF version 1.3 (too old)', () => {
      const filePath = path.join(tempDir, 'old.pdf');
      const pdfContent = createValidPDF('1.3');
      fs.writeFileSync(filePath, pdfContent);

      const result = fileProcessor.validate(filePath, 'old.pdf');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('version 1.3 is not supported');
      expect(result.error).toContain('1.4 through 2.0');
    });

    it('should reject PDF version 2.1 (too new)', () => {
      const filePath = path.join(tempDir, 'new.pdf');
      const pdfContent = createValidPDF('2.1');
      fs.writeFileSync(filePath, pdfContent);

      const result = fileProcessor.validate(filePath, 'new.pdf');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('version 2.1 is not supported');
      expect(result.error).toContain('1.4 through 2.0');
    });

    it('should reject files with PDF extension but invalid signature', () => {
      const filePath = path.join(tempDir, 'fake.pdf');
      fs.writeFileSync(filePath, 'This is not a PDF file');

      const result = fileProcessor.validate(filePath, 'fake.pdf');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not a valid PDF');
      expect(result.error).toContain('invalid file signature');
    });

    it('should reject corrupted PDF without EOF marker', () => {
      const filePath = path.join(tempDir, 'corrupted.pdf');
      // Create PDF without %%EOF marker
      const corruptedPDF = Buffer.from(
        '%PDF-1.7\n' +
        '1 0 obj\n' +
        '<< /Type /Catalog >>\n' +
        'endobj\n'
        // Missing %%EOF
      );
      fs.writeFileSync(filePath, corruptedPDF);

      const result = fileProcessor.validate(filePath, 'corrupted.pdf');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('corrupted or unreadable');
      expect(result.error).toContain('end-of-file marker');
    });

    it('should reject corrupted PDF without required structure', () => {
      const filePath = path.join(tempDir, 'corrupted2.pdf');
      // Create PDF with header and EOF but no structure
      const corruptedPDF = Buffer.from(
        '%PDF-1.7\n' +
        'Some random content\n' +
        '%%EOF'
      );
      fs.writeFileSync(filePath, corruptedPDF);

      const result = fileProcessor.validate(filePath, 'corrupted2.pdf');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('corrupted or unreadable');
      expect(result.error).toContain('missing required structure');
    });

    it('should reject PDF without version information', () => {
      const filePath = path.join(tempDir, 'no-version.pdf');
      const invalidPDF = Buffer.from(
        '%PDF-\n' + // Missing version
        '1 0 obj\n' +
        '<< /Type /Catalog >>\n' +
        'endobj\n' +
        '%%EOF'
      );
      fs.writeFileSync(filePath, invalidPDF);

      const result = fileProcessor.validate(filePath, 'no-version.pdf');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('corrupted or unreadable');
      expect(result.error).toContain('cannot determine version');
    });
  });

  describe('DOCX Validation', () => {
    it('should accept valid DOCX files', () => {
      const filePath = path.join(tempDir, 'valid.docx');
      const docxContent = createValidDOCX();
      fs.writeFileSync(filePath, docxContent);

      const result = fileProcessor.validate(filePath, 'valid.docx');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files with DOCX extension but invalid signature', () => {
      const filePath = path.join(tempDir, 'fake.docx');
      fs.writeFileSync(filePath, 'This is not a DOCX file');

      const result = fileProcessor.validate(filePath, 'fake.docx');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not a valid DOCX');
      expect(result.error).toContain('invalid file signature');
    });

    it('should reject DOCX without Content_Types.xml', () => {
      const filePath = path.join(tempDir, 'no-content-types.docx');
      const invalidDOCX = createInvalidDOCX('no-content-types');
      fs.writeFileSync(filePath, invalidDOCX);

      const result = fileProcessor.validate(filePath, 'no-content-types.docx');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('corrupted or unreadable');
      expect(result.error).toContain('Content_Types.xml');
    });

    it('should reject DOCX without word/document.xml', () => {
      const filePath = path.join(tempDir, 'no-document.docx');
      const invalidDOCX = createInvalidDOCX('no-document');
      fs.writeFileSync(filePath, invalidDOCX);

      const result = fileProcessor.validate(filePath, 'no-document.docx');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('corrupted or unreadable');
      expect(result.error).toContain('word/document.xml');
    });

    it('should reject DOCX without relationships', () => {
      const filePath = path.join(tempDir, 'no-rels.docx');
      const invalidDOCX = createInvalidDOCX('no-rels');
      fs.writeFileSync(filePath, invalidDOCX);

      const result = fileProcessor.validate(filePath, 'no-rels.docx');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('corrupted or unreadable');
      expect(result.error).toContain('relationships');
    });

    it('should reject DOCX without Office Open XML namespace', () => {
      const filePath = path.join(tempDir, 'no-namespace.docx');
      const invalidDOCX = createInvalidDOCX('no-namespace');
      fs.writeFileSync(filePath, invalidDOCX);

      const result = fileProcessor.validate(filePath, 'no-namespace.docx');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not a valid Office Open XML document');
    });

    it('should reject incomplete DOCX (missing EOCDR)', () => {
      const filePath = path.join(tempDir, 'incomplete.docx');
      const incompleteDOCX = createInvalidDOCX('incomplete');
      fs.writeFileSync(filePath, incompleteDOCX);

      const result = fileProcessor.validate(filePath, 'incomplete.docx');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('corrupted or unreadable');
      expect(result.error).toContain('incomplete ZIP archive');
    });
  });

  describe('Edge Cases', () => {
    it('should handle case-insensitive file extensions', () => {
      const filePath = path.join(tempDir, 'UPPERCASE.PDF');
      const pdfContent = createValidPDF('1.7');
      fs.writeFileSync(filePath, pdfContent);

      const result = fileProcessor.validate(filePath, 'UPPERCASE.PDF');

      expect(result.isValid).toBe(true);
    });

    it('should handle mixed case file extensions', () => {
      const filePath = path.join(tempDir, 'MixedCase.Docx');
      const docxContent = createValidDOCX();
      fs.writeFileSync(filePath, docxContent);

      const result = fileProcessor.validate(filePath, 'MixedCase.Docx');

      expect(result.isValid).toBe(true);
    });
  });
});

// Helper function to create a valid PDF with specified version
function createValidPDF(version: string): Buffer {
  const pdfContent = `%PDF-${version}
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
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
190
%%EOF`;
  return Buffer.from(pdfContent);
}

// Helper function to create a valid DOCX file
function createValidDOCX(): Buffer {
  // Create a minimal valid DOCX structure
  const parts: Buffer[] = [];
  
  // ZIP local file header for [Content_Types].xml
  const contentTypesData = Buffer.from(
    '<?xml version="1.0"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '</Types>'
  );
  
  parts.push(createZipEntry('[Content_Types].xml', contentTypesData));
  
  // ZIP local file header for _rels/.rels
  const relsData = Buffer.from(
    '<?xml version="1.0"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>'
  );
  
  parts.push(createZipEntry('_rels/.rels', relsData));
  
  // ZIP local file header for word/document.xml
  const documentData = Buffer.from(
    '<?xml version="1.0"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:body><w:p><w:r><w:t>Test</w:t></w:r></w:p></w:body>' +
    '</w:document>'
  );
  
  parts.push(createZipEntry('word/document.xml', documentData));
  
  // Add ZIP end of central directory
  const eocdr = Buffer.from([
    0x50, 0x4B, 0x05, 0x06, // EOCDR signature
    0x00, 0x00, 0x00, 0x00, // Disk numbers
    0x00, 0x00, 0x00, 0x00, // Central directory entries
    0x00, 0x00, 0x00, 0x00, // Central directory size
    0x00, 0x00, 0x00, 0x00, // Central directory offset
    0x00, 0x00              // Comment length
  ]);
  
  parts.push(eocdr);
  
  return Buffer.concat(parts);
}

// Helper function to create a ZIP entry
function createZipEntry(filename: string, data: Buffer): Buffer {
  const filenameBuffer = Buffer.from(filename);
  const header = Buffer.alloc(30 + filenameBuffer.length);
  
  // Local file header signature
  header.writeUInt32LE(0x04034b50, 0);
  // Version needed to extract
  header.writeUInt16LE(20, 4);
  // General purpose bit flag
  header.writeUInt16LE(0, 6);
  // Compression method (0 = no compression)
  header.writeUInt16LE(0, 8);
  // File modification time
  header.writeUInt16LE(0, 10);
  // File modification date
  header.writeUInt16LE(0, 12);
  // CRC-32
  header.writeUInt32LE(0, 14);
  // Compressed size
  header.writeUInt32LE(data.length, 18);
  // Uncompressed size
  header.writeUInt32LE(data.length, 22);
  // Filename length
  header.writeUInt16LE(filenameBuffer.length, 26);
  // Extra field length
  header.writeUInt16LE(0, 28);
  // Filename
  filenameBuffer.copy(header, 30);
  
  return Buffer.concat([header, data]);
}

// Helper function to create invalid DOCX files for testing
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
      // Missing EOCDR (end of central directory record)
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

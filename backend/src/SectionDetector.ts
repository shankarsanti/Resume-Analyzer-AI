import { SectionDetectionResult, ResumeSection } from '@resume-analyzer/shared';

/**
 * SectionDetector identifies resume sections from extracted text
 * Supports standard and non-standard section terminology with fuzzy matching
 */
export class SectionDetector {
  // Standard section patterns with variations
  private static readonly SECTION_PATTERNS = {
    skills: [
      /^(skills?|technical skills?|core competencies|proficiencies|technologies)$/i,
      /^(key skills?|professional skills?|technical proficiencies)$/i
    ],
    experience: [
      /^(experience|work experience|professional experience|employment history)$/i,
      /^(work history|career history|professional background|employment)$/i
    ],
    education: [
      /^(education|academic background|qualifications|academic history)$/i,
      /^(educational background|degrees?|academic qualifications)$/i
    ],
    projects: [
      /^(projects?|portfolio|personal projects?|professional projects?)$/i,
      /^(key projects?|notable projects?|project experience)$/i
    ],
    contact: [
      /^(contact|contact information|contact details|personal information)$/i,
      /^(contact info|personal details|reach me)$/i
    ],
    summary: [
      /^(summary|professional summary|profile|career summary)$/i,
      /^(objective|career objective|professional profile|about me)$/i,
      /^(executive summary|professional overview)$/i
    ],
    certifications: [
      /^(certifications?|certificates?|licenses?|credentials?)$/i,
      /^(professional certifications?|accreditations?)$/i
    ]
  };

  /**
   * Detects resume sections from extracted text
   * @param text - Extracted text from resume
   * @returns SectionDetectionResult with identified sections or error
   */
  detectSections(text: string): SectionDetectionResult {
    if (!text || text.trim().length === 0) {
      return {
        sections: [],
        error: 'No text provided for section detection'
      };
    }

    const sections: ResumeSection[] = [];
    const lines = text.split('\n');
    
    // Track detected section positions to extract content
    const sectionPositions: Array<{
      type: ResumeSection['type'];
      startLine: number;
      confidence: number;
    }> = [];

    // First pass: identify section headers
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines or very long lines (likely not headers)
      if (!trimmedLine || trimmedLine.length > 100) {
        return;
      }

      // Additional heuristic: headers are typically short and don't contain common sentence patterns
      // Skip lines that look like content (contain multiple sentences, have lowercase start after first word, etc.)
      const wordCount = trimmedLine.split(/\s+/).length;
      if (wordCount > 10) {
        // Lines with more than 10 words are likely content, not headers
        return;
      }

      // Check each section type
      for (const [sectionType, patterns] of Object.entries(SectionDetector.SECTION_PATTERNS)) {
        for (const pattern of patterns) {
          if (pattern.test(trimmedLine)) {
            // Calculate confidence based on match quality
            const confidence = this.calculateConfidence(trimmedLine, pattern);
            
            sectionPositions.push({
              type: sectionType as ResumeSection['type'],
              startLine: index,
              confidence
            });
            
            // Break after first match for this line
            return;
          }
        }
      }
    });

    // If no sections detected, return error
    if (sectionPositions.length === 0) {
      return {
        sections: [],
        error: 'No recognizable resume sections found. Please ensure your resume has clear section headers (e.g., Skills, Experience, Education).'
      };
    }

    // Second pass: extract content for each section
    sectionPositions.forEach((position, index) => {
      const startLine = position.startLine + 1; // Start after the header
      const endLine = index < sectionPositions.length - 1 
        ? sectionPositions[index + 1].startLine 
        : lines.length;

      // Extract content between this section and the next
      const contentLines = lines.slice(startLine, endLine);
      const content = contentLines.join('\n').trim();

      // Only add section if it has content
      if (content.length > 0) {
        sections.push({
          type: position.type,
          content,
          confidence: position.confidence
        });
      }
    });

    // Remove duplicate sections, keeping the one with higher confidence
    const uniqueSections = this.removeDuplicateSections(sections);

    // Final validation: ensure we have at least one section with content
    if (uniqueSections.length === 0) {
      return {
        sections: [],
        error: 'No recognizable resume sections found with content. Please ensure your resume has clear section headers and content.'
      };
    }

    return {
      sections: uniqueSections
    };
  }

  /**
   * Calculates confidence score for a section match
   * Higher confidence for exact matches, standalone headers, and common patterns
   */
  private calculateConfidence(line: string, pattern: RegExp): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence if line is short (likely a header)
    if (line.length < 30) {
      confidence += 0.1;
    }

    // Increase confidence if line is all caps or title case
    if (line === line.toUpperCase() || this.isTitleCase(line)) {
      confidence += 0.1;
    }

    // Increase confidence if line contains only the section keyword (no extra text)
    const match = pattern.exec(line);
    if (match && match[0].length / line.length > 0.5) {
      confidence += 0.1;
    }

    // Cap confidence at 1.0
    return Math.min(confidence, 1.0);
  }

  /**
   * Checks if a string is in title case
   */
  private isTitleCase(str: string): boolean {
    const words = str.split(/\s+/);
    return words.every(word => {
      if (word.length === 0) return true;
      return word[0] === word[0].toUpperCase();
    });
  }

  /**
   * Removes duplicate sections, keeping the one with higher confidence
   */
  private removeDuplicateSections(sections: ResumeSection[]): ResumeSection[] {
    const sectionMap = new Map<string, ResumeSection>();

    sections.forEach(section => {
      const existing = sectionMap.get(section.type);
      
      if (!existing || section.confidence > existing.confidence) {
        sectionMap.set(section.type, section);
      }
    });

    return Array.from(sectionMap.values());
  }
}

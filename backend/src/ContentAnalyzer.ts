import { StructuredData, ResumeSection, ExperienceEntry, EducationEntry, ProjectEntry, ContactInfo } from '@resume-analyzer/shared';

/**
 * ContentAnalyzer extracts structured data from detected resume sections
 * Handles various formatting styles (comma-separated, bulleted, paragraph)
 */
export class ContentAnalyzer {
  /**
   * Analyzes resume sections and extracts structured data
   * @param sections - Detected resume sections from SectionDetector
   * @returns StructuredData with extracted information
   */
  analyze(sections: ResumeSection[]): StructuredData {
    const structuredData: StructuredData = {
      skills: [],
      experience: [],
      education: [],
      projects: [],
      contact: {}
    };

    // Process each section based on its type
    sections.forEach(section => {
      switch (section.type) {
        case 'skills':
          structuredData.skills = this.extractSkills(section.content);
          break;
        case 'experience':
          structuredData.experience = this.extractExperience(section.content);
          break;
        case 'education':
          structuredData.education = this.extractEducation(section.content);
          break;
        case 'projects':
          structuredData.projects = this.extractProjects(section.content);
          break;
        case 'contact':
          structuredData.contact = this.extractContact(section.content);
          break;
        // summary and certifications sections don't have specific extraction yet
        // but could be added in the future
      }
    });

    return structuredData;
  }

  /**
   * Extracts skills from skills section content
   * Handles comma-separated, bulleted, and paragraph formats
   */
  private extractSkills(content: string): string[] {
    const skills: string[] = [];
    const lines = content.split('\n');

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Remove common bullet point markers
      const cleanedLine = trimmedLine.replace(/^[•\-*+◦▪▫→⇒]\s*/, '');

      // Check if line contains comma-separated skills
      if (cleanedLine.includes(',')) {
        const commaSeparated = cleanedLine.split(',').map(s => s.trim()).filter(s => s.length > 0);
        skills.push(...commaSeparated);
      }
      // Check if line contains semicolon-separated skills
      else if (cleanedLine.includes(';')) {
        const semicolonSeparated = cleanedLine.split(';').map(s => s.trim()).filter(s => s.length > 0);
        skills.push(...semicolonSeparated);
      }
      // Check if line contains pipe-separated skills
      else if (cleanedLine.includes('|')) {
        const pipeSeparated = cleanedLine.split('|').map(s => s.trim()).filter(s => s.length > 0);
        skills.push(...pipeSeparated);
      }
      // Single skill per line (bulleted or paragraph format)
      else if (cleanedLine.length > 0 && cleanedLine.length < 100) {
        // Only add if it looks like a skill (not too long, not a sentence)
        // Heuristic: skills are typically short phrases
        skills.push(cleanedLine);
      }
    });

    // Remove duplicates and clean up
    const uniqueSkills = Array.from(new Set(skills.map(s => s.trim())))
      .filter(s => s.length > 0 && s.length < 100);

    return uniqueSkills;
  }

  /**
   * Extracts experience entries from experience section content
   * Identifies job titles, company names, dates, and descriptions
   */
  private extractExperience(content: string): ExperienceEntry[] {
    const experiences: ExperienceEntry[] = [];
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let currentEntry: Partial<ExperienceEntry> | null = null;
    let descriptionLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if line contains a date pattern (likely start of new entry or date line)
      const dateMatch = this.extractDatePattern(line);

      // Check if line has "at" or similar separator (job title at company format)
      const titleCompanyMatch = line.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);

      if (titleCompanyMatch && !dateMatch) {
        // Save previous entry if exists
        if (currentEntry && currentEntry.jobTitle && currentEntry.company) {
          experiences.push({
            jobTitle: currentEntry.jobTitle,
            company: currentEntry.company,
            dates: currentEntry.dates || '',
            description: descriptionLines.join(' ').trim()
          });
        }

        // Start new entry with job title and company
        currentEntry = {
          jobTitle: titleCompanyMatch[1].trim(),
          company: titleCompanyMatch[2].trim()
        };
        descriptionLines = [];
      } else if (dateMatch) {
        // This line contains a date
        if (currentEntry) {
          // Add date to current entry
          currentEntry.dates = dateMatch;
        } else {
          // Start new entry with just the date
          currentEntry = { dates: dateMatch };
          descriptionLines = [];
          
          // Try to extract job title and company from the same line
          const lineWithoutDate = line.replace(dateMatch, '').trim();
          const titleCompanyInLine = lineWithoutDate.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i);
          if (titleCompanyInLine) {
            currentEntry.jobTitle = titleCompanyInLine[1].trim();
            currentEntry.company = titleCompanyInLine[2].trim();
          }
        }
      } else if (currentEntry) {
        // If we have a current entry but no job title yet, this might be it
        if (!currentEntry.jobTitle) {
          currentEntry.jobTitle = line;
        }
        // If we have job title but no company, this might be it
        else if (!currentEntry.company) {
          // Check if line looks like a company name (not a description)
          if (line.length < 100 && !line.match(/^[•\-*+]/)) {
            currentEntry.company = line;
          } else {
            // It's a description line
            descriptionLines.push(line);
          }
        }
        // Otherwise, it's part of the description
        else {
          descriptionLines.push(line);
        }
      } else {
        // No current entry - might be a job title starting a new entry
        // Look ahead to see if next line has a date or company
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          const nextDateMatch = this.extractDatePattern(nextLine);
          
          if (nextDateMatch || this.looksLikeCompanyName(nextLine)) {
            currentEntry = { jobTitle: line };
            descriptionLines = [];
          }
        }
      }
    }

    // Save last entry
    if (currentEntry && currentEntry.jobTitle && currentEntry.company) {
      experiences.push({
        jobTitle: currentEntry.jobTitle,
        company: currentEntry.company,
        dates: currentEntry.dates || '',
        description: descriptionLines.join(' ').trim()
      });
    }

    return experiences;
  }

  /**
   * Extracts education entries from education section content
   * Identifies degree types, institutions, and graduation dates
   */
  private extractEducation(content: string): EducationEntry[] {
    const educationEntries: EducationEntry[] = [];
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let currentEntry: Partial<EducationEntry> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if line contains a date pattern (graduation date)
      const dateMatch = this.extractDatePattern(line);

      if (dateMatch) {
        // If we have a current entry, set its graduation date
        if (currentEntry) {
          currentEntry.graduationDate = dateMatch;
          
          // Save entry if we have all required fields
          if (currentEntry.degree && currentEntry.institution) {
            educationEntries.push({
              degree: currentEntry.degree,
              institution: currentEntry.institution,
              graduationDate: currentEntry.graduationDate
            });
            currentEntry = null;
          }
        } else {
          // Start new entry with graduation date
          currentEntry = { graduationDate: dateMatch };
          
          // Try to extract degree and institution from the same line
          const lineWithoutDate = line.replace(dateMatch, '').trim();
          const parts = this.splitDegreeAndInstitution(lineWithoutDate);
          if (parts) {
            currentEntry.degree = parts.degree;
            currentEntry.institution = parts.institution;
          }
        }
      } else if (currentEntry) {
        // If we have a current entry, try to fill in missing fields
        if (!currentEntry.degree) {
          currentEntry.degree = line;
        } else if (!currentEntry.institution) {
          currentEntry.institution = line;
        }
      } else {
        // Start new entry - this line might be degree or institution
        currentEntry = {};
        
        // Try to split into degree and institution
        const parts = this.splitDegreeAndInstitution(line);
        if (parts) {
          currentEntry.degree = parts.degree;
          currentEntry.institution = parts.institution;
        } else {
          // Assume it's a degree
          currentEntry.degree = line;
        }
      }
    }

    // Save last entry if complete
    if (currentEntry && currentEntry.degree && currentEntry.institution) {
      educationEntries.push({
        degree: currentEntry.degree,
        institution: currentEntry.institution,
        graduationDate: currentEntry.graduationDate || ''
      });
    }

    return educationEntries;
  }

  /**
   * Extracts project entries from projects section content
   * Identifies project names, descriptions, technologies, and dates
   */
  private extractProjects(content: string): ProjectEntry[] {
    const projects: ProjectEntry[] = [];
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let currentProject: Partial<ProjectEntry> | null = null;
    let descriptionLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if line contains technologies (keywords: "Technologies:", "Tech Stack:", etc.)
      const techMatch = line.match(/^(?:technologies?|tech stack|tech|tools?|built with):\s*(.+)$/i);
      
      if (techMatch && currentProject) {
        const techString = techMatch[1];
        const technologies = this.extractTechnologies(techString);
        currentProject.technologies = technologies;
        continue;
      }

      // Check if line looks like a project name
      const dateMatch = this.extractDatePattern(line);
      const looksLikeProjectName = line.length < 100 && !line.match(/^[•\-*+]/) && !techMatch;
      
      // Heuristic: A line is likely a new project name if:
      // 1. It's the first line, OR
      // 2. It has a date pattern, OR
      // 3. Previous line was a "Tech:" line (indicating end of previous project), OR
      // 4. We have accumulated description and this looks like a short title
      const prevLineWasTech = i > 0 && lines[i - 1].match(/^(?:technologies?|tech stack|tech|tools?|built with):/i);
      const hasAccumulatedDescription = descriptionLines.length > 0;
      const isShortTitle = line.length < 50;
      
      const isNewProject = (i === 0) || 
                          dateMatch ||
                          prevLineWasTech ||
                          (hasAccumulatedDescription && isShortTitle && looksLikeProjectName);

      if (isNewProject && looksLikeProjectName) {
        // Save previous project if exists
        if (currentProject && currentProject.name) {
          projects.push({
            name: currentProject.name,
            description: descriptionLines.join(' ').trim(),
            technologies: currentProject.technologies || [],
            dates: currentProject.dates
          });
        }

        // Start new project
        const projectName = dateMatch ? line.replace(dateMatch, '').trim() : line;
        currentProject = {
          name: projectName,
          dates: dateMatch || undefined,
          technologies: []
        };
        descriptionLines = [];
      } else if (currentProject) {
        // It's part of the description
        descriptionLines.push(line);
      }
    }

    // Save last project
    if (currentProject && currentProject.name) {
      projects.push({
        name: currentProject.name,
        description: descriptionLines.join(' ').trim(),
        technologies: currentProject.technologies || [],
        dates: currentProject.dates
      });
    }

    return projects;
  }

  /**
   * Extracts contact information (email and phone) from contact section
   * Handles various phone number formats
   */
  private extractContact(content: string): ContactInfo {
    const contact: ContactInfo = {};

    // Extract email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emailMatches = content.match(emailRegex);
    if (emailMatches && emailMatches.length > 0) {
      contact.email = emailMatches[0]; // Take first email found
    }

    // Extract phone numbers (various formats)
    // Matches: (123) 456-7890, 123-456-7890, 123.456.7890, +1 123 456 7890, etc.
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    const phoneMatches = content.match(phoneRegex);
    if (phoneMatches && phoneMatches.length > 0) {
      contact.phone = phoneMatches[0].trim(); // Take first phone found
    }

    return contact;
  }

  /**
   * Extracts date patterns from text
   * Matches various date formats: "Jan 2020 - Present", "2019-2021", "May 2018", etc.
   */
  private extractDatePattern(text: string): string | null {
    // Match various date patterns
    const patterns = [
      // Month Year - Month Year or Present
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\s*[-–—]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|Present|Current)\b/i,
      // Year - Year
      /\b\d{4}\s*[-–—]\s*(?:\d{4}|Present|Current)\b/i,
      // Month Year (single date)
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b/i,
      // Year only
      /\b\d{4}\b/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  /**
   * Checks if a line looks like a company name
   */
  private looksLikeCompanyName(line: string): boolean {
    // Company names are typically short and don't start with bullet points
    return line.length < 100 && !line.match(/^[•\-*+]/);
  }

  /**
   * Splits a line into degree and institution
   * Handles formats like "Bachelor of Science in Computer Science, University Name"
   */
  private splitDegreeAndInstitution(line: string): { degree: string; institution: string } | null {
    // Common separators: comma, pipe, "at", "from"
    const separators = [',', '|', ' at ', ' from ', ' - '];
    
    for (const separator of separators) {
      if (line.includes(separator)) {
        const parts = line.split(separator).map(p => p.trim());
        if (parts.length >= 2) {
          return {
            degree: parts[0],
            institution: parts.slice(1).join(', ')
          };
        }
      }
    }

    return null;
  }

  /**
   * Extracts technologies from a technology string
   * Handles comma-separated, pipe-separated formats
   */
  private extractTechnologies(techString: string): string[] {
    const technologies: string[] = [];

    // Split by common separators
    const separators = [',', '|', ';'];
    let parts = [techString];

    for (const separator of separators) {
      if (techString.includes(separator)) {
        parts = techString.split(separator).map(p => p.trim());
        break;
      }
    }

    // Clean up and add technologies
    parts.forEach(part => {
      if (part.length > 0 && part.length < 50) {
        technologies.push(part);
      }
    });

    return technologies;
  }
}

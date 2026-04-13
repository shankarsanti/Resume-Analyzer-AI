// Shared TypeScript types for Resume Analyzer

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ExtractionResult {
  text: string;
  error?: string;
}

export interface ResumeSection {
  type: 'skills' | 'experience' | 'education' | 'projects' | 'contact' | 'summary' | 'certifications';
  content: string;
  confidence: number;
}

export interface SectionDetectionResult {
  sections: ResumeSection[];
  error?: string;
}

export interface ExperienceEntry {
  jobTitle: string;
  company: string;
  dates: string;
  description: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  graduationDate: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
  dates?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
}

export interface StructuredData {
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  contact: ContactInfo;
}

export interface Keyword {
  text: string;
  category: 'technical' | 'soft_skill' | 'certification' | 'tool' | 'industry';
  frequency?: number;
}

export interface KeywordAnalysis {
  identifiedKeywords: Keyword[];
  missingKeywords: Keyword[];
}

export interface ScoreBreakdown {
  formatting: number;
  sections: number;
  keywords: number;
  content: number;
}

export interface ATSScore {
  score: number;
  breakdown: ScoreBreakdown;
}

export interface JobMatchResult {
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
}

export interface SectionAnalysis {
  sectionType: string;
  present: boolean;
  icon?: string; // Lucide icon name
}

export interface AnalysisResults {
  score: number;
  breakdown: ScoreBreakdown;
  status: 'excellent' | 'good' | 'needs_improvement';
  suggestions: string[];
  keywords: KeywordAnalysis;
  sectionsAnalysis: SectionAnalysis[];
  jobMatch?: JobMatchResult;
  error?: string;
  errorStage?: string;
}

export interface AnalyzeRequest {
  file: File | Buffer;
  jobDescription?: string;
}

export interface ErrorResponse {
  code: string;
  stage: string;
  message: string;
  details?: string;
}

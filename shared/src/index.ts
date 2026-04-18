// Shared types for Resume Analyzer

export interface ContactInfo {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  location?: string;
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
  link?: string;
  dates?: string;
}

export interface StructuredData {
  contact: ContactInfo;
  summary?: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  projects?: ProjectEntry[];
  certifications?: string[];
}

export interface Keyword {
  text: string;
  category: 'technical' | 'soft_skill' | 'tool' | 'certification' | 'industry' | 'domain';
  frequency?: number;
  importance?: 'high' | 'medium' | 'low';
  context?: string[];
}

export interface KeywordAnalysis {
  identifiedKeywords: Keyword[];
  missingKeywords: Keyword[];
  // Legacy properties for backward compatibility
  keywords?: Keyword[];
  totalKeywords?: number;
  technicalKeywords?: number;
  softSkillKeywords?: number;
  domainKeywords?: number;
  suggestions?: string[];
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
  recommendations?: string[];
  strengths?: string[];
  weaknesses?: string[];
}

export interface JobMatchResult {
  matchScore: number;
  matchPercentage?: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  relevantExperience: ExperienceEntry[];
}

export interface ResumeSection {
  type: 'contact' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'unknown';
  content: string;
  confidence: number;
}

export enum ResumeSectionType {
  CONTACT = 'contact',
  SUMMARY = 'summary',
  EXPERIENCE = 'experience',
  EDUCATION = 'education',
  SKILLS = 'skills',
  PROJECTS = 'projects',
  CERTIFICATIONS = 'certifications',
  UNKNOWN = 'unknown'
}

export interface SectionDetectionResult {
  sections: ResumeSection[];
  error?: string;
}

export interface SectionAnalysis {
  section: string;
  present: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'missing';
  suggestions: string[];
  content?: string;
}

export interface AnalysisResults {
  score: number;
  breakdown: ScoreBreakdown;
  status: 'excellent' | 'good' | 'needs_improvement';
  suggestions: string[];
  keywords: KeywordAnalysis;
  sectionsAnalysis: Array<{ sectionType: string; present: boolean }>;
  jobMatch?: JobMatchResult;
  error?: string;
  errorStage?: string;
  // Legacy properties for backward compatibility
  atsScore?: ATSScore;
  keywordAnalysis?: KeywordAnalysis;
  structuredData?: StructuredData;
  sections?: SectionAnalysis[];
  overallRecommendations?: string[];
}

export interface ExtractionResult {
  text: string;
  error?: string;
  metadata?: {
    pageCount?: number;
    author?: string;
    title?: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  errors?: string[];
  warnings?: string[];
}

export interface ErrorResponse {
  error?: string;
  details?: string;
  code?: string;
  stage?: string;
  message?: string;
}

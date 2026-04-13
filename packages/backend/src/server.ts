import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import { FileProcessor } from './FileProcessor';
import { TextExtractor } from './TextExtractor';
import { SectionDetector } from './SectionDetector';
import { ContentAnalyzer } from './ContentAnalyzer';
import { ATSScorer } from './ATSScorer';
import { KeywordAnalyzer } from './KeywordAnalyzer';
import { JobMatcher } from './JobMatcher';
import type { 
  AnalysisResults, 
  ErrorResponse, 
  ScoreBreakdown, 
  KeywordAnalysis, 
  StructuredData, 
  JobMatchResult,
  ResumeSection,
  Keyword,
  ExperienceEntry
} from '@resume-analyzer/shared';

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS for frontend communication
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
    }
  }
});

// POST /api/analyze endpoint
app.post('/api/analyze', upload.single('file'), async (req: Request, res: Response) => {
  const startTime = Date.now();
  const TIMEOUT_MS = 30000; // 30 seconds
  
  try {
    // Check if file was uploaded
    if (!req.file) {
      const errorResponse: ErrorResponse = {
        code: 'VALIDATION_ERROR',
        stage: 'upload',
        message: 'No file uploaded',
        details: 'Please upload a PDF or DOCX file'
      };
      return res.status(400).json(errorResponse);
    }

    const file = req.file;
    const jobDescription = req.body.jobDescription as string | undefined;

    // Stage 1: File validation
    const fileProcessor = new FileProcessor();
    const validationResult = fileProcessor.validate(file.buffer, file.originalname);
    
    if (!validationResult.isValid) {
      const errorResponse: ErrorResponse = {
        code: 'VALIDATION_ERROR',
        stage: 'validation',
        message: validationResult.error || 'File validation failed',
        details: 'Please ensure your file is a valid PDF or DOCX and under 10MB'
      };
      return res.status(400).json(errorResponse);
    }

    // Check timeout
    if (Date.now() - startTime > TIMEOUT_MS) {
      const errorResponse: ErrorResponse = {
        code: 'TIMEOUT_ERROR',
        stage: 'validation',
        message: 'Processing timeout exceeded',
        details: 'Please try with a smaller file or a resume under 5 pages'
      };
      return res.status(504).json(errorResponse);
    }

    // Stage 2: Text extraction
    const textExtractor = new TextExtractor();
    const extractionResult = await textExtractor.extract(file.buffer, file.originalname);
    
    if (extractionResult.error || !extractionResult.text) {
      const errorResponse: ErrorResponse = {
        code: 'PROCESSING_ERROR',
        stage: 'extraction',
        message: extractionResult.error || 'Text extraction failed',
        details: 'Unable to extract text from the file. Please ensure it contains readable text.'
      };
      return res.status(422).json(errorResponse);
    }

    // Check timeout
    if (Date.now() - startTime > TIMEOUT_MS) {
      const errorResponse: ErrorResponse = {
        code: 'TIMEOUT_ERROR',
        stage: 'extraction',
        message: 'Processing timeout exceeded',
        details: 'Please try with a smaller file or a resume under 5 pages'
      };
      return res.status(504).json(errorResponse);
    }

    // Stage 3: Section detection
    const sectionDetector = new SectionDetector();
    const sectionResult = sectionDetector.detectSections(extractionResult.text);
    
    if (sectionResult.error || sectionResult.sections.length === 0) {
      const errorResponse: ErrorResponse = {
        code: 'PROCESSING_ERROR',
        stage: 'section_detection',
        message: sectionResult.error || 'No recognizable sections found',
        details: 'Please ensure your resume has standard sections like Skills, Experience, and Education'
      };
      return res.status(422).json(errorResponse);
    }

    // Check timeout
    if (Date.now() - startTime > TIMEOUT_MS) {
      const errorResponse: ErrorResponse = {
        code: 'TIMEOUT_ERROR',
        stage: 'section_detection',
        message: 'Processing timeout exceeded',
        details: 'Please try with a smaller file or a resume under 5 pages'
      };
      return res.status(504).json(errorResponse);
    }

    // Stage 4: Content analysis
    const contentAnalyzer = new ContentAnalyzer();
    const structuredData = contentAnalyzer.analyze(sectionResult.sections);

    // Check timeout
    if (Date.now() - startTime > TIMEOUT_MS) {
      const errorResponse: ErrorResponse = {
        code: 'TIMEOUT_ERROR',
        stage: 'content_analysis',
        message: 'Processing timeout exceeded',
        details: 'Please try with a smaller file or a resume under 5 pages'
      };
      return res.status(504).json(errorResponse);
    }

    // Stage 5: Parallel analysis (scoring, keywords, job matching)
    const atsScorer = new ATSScorer();
    const keywordAnalyzer = new KeywordAnalyzer();
    const jobMatcher = new JobMatcher();

    const atsScore = atsScorer.calculateScore(structuredData, extractionResult.text);
    const keywordAnalysis = keywordAnalyzer.analyze(structuredData, jobDescription);
    const jobMatchResult = jobDescription 
      ? jobMatcher.match(structuredData, jobDescription)
      : undefined;

    // Check timeout
    if (Date.now() - startTime > TIMEOUT_MS) {
      const errorResponse: ErrorResponse = {
        code: 'TIMEOUT_ERROR',
        stage: 'analysis',
        message: 'Processing timeout exceeded',
        details: 'Please try with a smaller file or a resume under 5 pages'
      };
      return res.status(504).json(errorResponse);
    }

    // Stage 6: Results generation
    const results: AnalysisResults = generateResults(
      atsScore.score,
      atsScore.breakdown,
      keywordAnalysis,
      sectionResult.sections,
      structuredData,
      jobMatchResult
    );

    // Return successful response
    return res.status(200).json(results);

  } catch (error) {
    console.error('Unexpected error during analysis:', error);
    
    const errorResponse: ErrorResponse = {
      code: 'SERVER_ERROR',
      stage: 'unknown',
      message: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Please try again later'
    };
    
    return res.status(500).json(errorResponse);
  }
});

// Helper function to generate results
function generateResults(
  score: number,
  breakdown: ScoreBreakdown,
  keywordAnalysis: KeywordAnalysis,
  sections: ResumeSection[],
  structuredData: StructuredData,
  jobMatchResult?: JobMatchResult
): AnalysisResults {
  // Determine status based on score
  let status: 'excellent' | 'good' | 'needs_improvement';
  if (score >= 71) {
    status = 'excellent';
  } else if (score >= 41) {
    status = 'good';
  } else {
    status = 'needs_improvement';
  }

  // Generate suggestions based on weaknesses
  const suggestions = generateSuggestions(score, breakdown, keywordAnalysis, structuredData);

  // Create sections analysis
  const sectionsAnalysis = [
    { sectionType: 'experience', present: sections.some(s => s.type === 'experience') },
    { sectionType: 'skills', present: sections.some(s => s.type === 'skills') },
    { sectionType: 'education', present: sections.some(s => s.type === 'education') },
    { sectionType: 'projects', present: sections.some(s => s.type === 'projects') }
  ];

  return {
    score,
    breakdown,
    status,
    suggestions,
    keywords: keywordAnalysis,
    sectionsAnalysis,
    jobMatch: jobMatchResult
  };
}

// Helper function to generate suggestions
function generateSuggestions(
  score: number,
  breakdown: ScoreBreakdown,
  keywordAnalysis: KeywordAnalysis,
  structuredData: StructuredData
): string[] {
  const suggestions: string[] = [];

  // Prioritize structural/formatting improvements when score < 70
  if (score < 70) {
    if (breakdown.formatting < 20) {
      suggestions.push('Simplify your resume formatting for better ATS compatibility');
    }
    if (breakdown.sections < 20) {
      suggestions.push('Add missing standard sections (Skills, Experience, Education, Projects)');
    }
  }

  // Suggest incorporating missing keywords
  if (keywordAnalysis.missingKeywords && keywordAnalysis.missingKeywords.length > 0) {
    const topMissingKeywords = keywordAnalysis.missingKeywords.slice(0, 3).map((k: Keyword) => k.text).join(', ');
    suggestions.push(`Incorporate relevant keywords: ${topMissingKeywords}`);
  }

  // Suggest adding metrics/numbers when experience lacks quantifiable achievements
  if (structuredData.experience && structuredData.experience.length > 0) {
    const hasMetrics = structuredData.experience.some((exp: ExperienceEntry) => 
      /\d+%|\d+\+|\$\d+/.test(exp.description)
    );
    if (!hasMetrics) {
      suggestions.push('Add quantifiable achievements with numbers and metrics to your experience');
    }
  }

  // Additional suggestions based on content quality
  if (breakdown.content < 20) {
    suggestions.push('Use more action verbs and specific accomplishments in your descriptions');
  }

  if (breakdown.keywords < 20) {
    suggestions.push('Include more industry-relevant keywords and technical skills');
  }

  // Limit to top 5 suggestions
  return suggestions.slice(0, 5);
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const errorResponse: ErrorResponse = {
        code: 'VALIDATION_ERROR',
        stage: 'upload',
        message: 'File size exceeds limit',
        details: 'Maximum file size is 10MB'
      };
      return res.status(400).json(errorResponse);
    }
  }

  // Handle file filter errors
  if (err.message.includes('Invalid file type')) {
    const errorResponse: ErrorResponse = {
      code: 'VALIDATION_ERROR',
      stage: 'upload',
      message: err.message,
      details: 'Please upload a PDF or DOCX file'
    };
    return res.status(400).json(errorResponse);
  }

  // Generic error response
  const errorResponse: ErrorResponse = {
    code: 'SERVER_ERROR',
    stage: 'unknown',
    message: 'An unexpected error occurred',
    details: err.message
  };
  
  res.status(500).json(errorResponse);
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Resume Analyzer API server running on port ${PORT}`);
  });
}

export default app;

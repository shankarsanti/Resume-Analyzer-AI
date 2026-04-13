import { AnalysisResults } from '@resume-analyzer/shared';
import { FileProcessor } from './FileProcessor';
import { TextExtractor } from './TextExtractor';
import { SectionDetector } from './SectionDetector';
import { ContentAnalyzer } from './ContentAnalyzer';
import { ATSScorer } from './ATSScorer';
import { KeywordAnalyzer } from './KeywordAnalyzer';
import { JobMatcher } from './JobMatcher';
import { ResultsGenerator } from './ResultsGenerator';

/**
 * ResumeAnalyzer orchestrates the complete resume analysis pipeline
 * Executes stages sequentially with error handling and timeout management
 * 
 * Pipeline stages:
 * 1. File validation
 * 2. Text extraction
 * 3. Section detection
 * 4. Content analysis
 * 5. Parallel: ATS scoring + keyword analysis + job matching
 * 6. Results generation
 */
export class ResumeAnalyzer {
  private readonly fileProcessor: FileProcessor;
  private readonly textExtractor: TextExtractor;
  private readonly sectionDetector: SectionDetector;
  private readonly contentAnalyzer: ContentAnalyzer;
  private readonly atsScorer: ATSScorer;
  private readonly keywordAnalyzer: KeywordAnalyzer;
  private readonly jobMatcher: JobMatcher;
  private readonly resultsGenerator: ResultsGenerator;

  // Timeout: 30 seconds for resumes under 5 pages
  private readonly TIMEOUT_MS = 30000;

  constructor() {
    this.fileProcessor = new FileProcessor();
    this.textExtractor = new TextExtractor();
    this.sectionDetector = new SectionDetector();
    this.contentAnalyzer = new ContentAnalyzer();
    this.atsScorer = new ATSScorer();
    this.keywordAnalyzer = new KeywordAnalyzer();
    this.jobMatcher = new JobMatcher();
    this.resultsGenerator = new ResultsGenerator();
  }

  /**
   * Analyzes a resume file through the complete pipeline
   * 
   * @param filePath - Path to the uploaded resume file
   * @param originalName - Original filename (for extension detection)
   * @param jobDescription - Optional job description for matching
   * @returns Promise<AnalysisResults> with complete analysis or error
   */
  async analyze(
    filePath: string,
    originalName: string,
    jobDescription?: string
  ): Promise<AnalysisResults> {
    // Wrap the entire pipeline in a timeout
    return this.withTimeout(
      this.executePipeline(filePath, originalName, jobDescription),
      this.TIMEOUT_MS
    );
  }

  /**
   * Executes the complete analysis pipeline sequentially
   * Halts immediately on any stage failure
   */
  private async executePipeline(
    filePath: string,
    originalName: string,
    jobDescription?: string
  ): Promise<AnalysisResults> {
    try {
      // Stage 1: File Validation
      const validationResult = this.fileProcessor.validate(filePath, originalName);
      if (!validationResult.isValid) {
        return this.resultsGenerator.generateError(
          'file_validation',
          validationResult.error || 'File validation failed'
        );
      }

      // Determine file type from extension
      const fileType = originalName.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx';

      // Stage 2: Text Extraction
      const extractionResult = await this.textExtractor.extract(filePath, fileType);
      if (extractionResult.error) {
        return this.resultsGenerator.generateError(
          'text_extraction',
          extractionResult.error
        );
      }

      const extractedText = extractionResult.text;
      if (!extractedText || extractedText.trim().length === 0) {
        return this.resultsGenerator.generateError(
          'text_extraction',
          'No text found in resume file'
        );
      }

      // Stage 3: Section Detection
      const sectionResult = this.sectionDetector.detectSections(extractedText);
      if (sectionResult.error) {
        return this.resultsGenerator.generateError(
          'section_detection',
          sectionResult.error
        );
      }

      if (!sectionResult.sections || sectionResult.sections.length === 0) {
        return this.resultsGenerator.generateError(
          'section_detection',
          'No recognizable resume sections found'
        );
      }

      // Stage 4: Content Analysis
      const structuredData = this.contentAnalyzer.analyze(sectionResult.sections);

      // Stage 5: Parallel Analysis (scoring, keywords, matching)
      // These can run in parallel as they don't depend on each other
      const [atsScore, keywordAnalysis, jobMatch] = await Promise.all([
        // ATS Scoring
        Promise.resolve(this.atsScorer.calculateScore(structuredData, extractedText)),
        
        // Keyword Analysis
        Promise.resolve(this.keywordAnalyzer.analyze(structuredData, jobDescription)),
        
        // Job Matching (only if job description provided)
        jobDescription
          ? Promise.resolve(this.jobMatcher.match(structuredData, jobDescription))
          : Promise.resolve(undefined)
      ]);

      // Stage 6: Results Generation
      const results = this.resultsGenerator.generate(
        atsScore,
        keywordAnalysis,
        structuredData,
        sectionResult.sections,
        jobMatch
      );

      return results;
    } catch (error) {
      // Catch any unexpected errors
      return this.resultsGenerator.generateError(
        'unknown',
        `Unexpected error during analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Wraps a promise with a timeout
   * Returns timeout error if processing exceeds the time limit
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(new Error('TIMEOUT'));
        }, timeoutMs);
      })
    ]).catch((error) => {
      if (error.message === 'TIMEOUT') {
        return this.resultsGenerator.generateError(
          'timeout',
          'Processing exceeded 30-second time limit. Please try with a smaller resume file (under 5 pages recommended).'
        ) as T;
      }
      throw error;
    });
  }
}

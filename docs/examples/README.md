# Code Examples

This directory contains example code demonstrating how to use various components of the Resume Analyzer backend.

## Available Examples

### job-matcher-example.ts
Demonstrates how to use the `JobMatcher` component to:
- Compare resume data against job descriptions
- Calculate match percentages
- Identify matching and missing skills
- Generate recommendations for improvement

### keyword-analyzer-example.ts
Shows how to use the `KeywordAnalyzer` to:
- Extract and categorize keywords from resumes
- Perform gap analysis against job descriptions
- Rank keywords by importance and frequency
- Categorize keywords (technical, soft skills, certifications, etc.)

### results-generator-example.ts
Illustrates the complete analysis pipeline:
- Section detection and content extraction
- ATS score calculation
- Keyword analysis
- Job matching
- Results compilation with actionable suggestions
- Error handling

## Running Examples

To run any example:

```bash
cd packages/backend
npx tsx src/examples/<example-file>.ts
```

Note: These files have been moved to `docs/examples/` for organization. To run them, either:
1. Copy them back to `packages/backend/src/` temporarily, or
2. Update the import paths to reference the actual source files

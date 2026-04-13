# Resume Analyzer

An AI-powered web application that helps job seekers optimize their resumes for Applicant Tracking Systems (ATS).

## Project Structure

This is a monorepo with a clean, organized structure:

```
resume-analyzer/
├── packages/
│   ├── frontend/          # React + Vite + TypeScript frontend
│   ├── backend/           # Node.js + Express + TypeScript API
│   └── shared/            # Shared TypeScript types
└── docs/                  # Project documentation
    ├── README.md          # Documentation index
    └── examples/          # Code examples
        └── README.md
```

### Packages

- **packages/frontend**: React + Vite + TypeScript frontend application
- **packages/backend**: Node.js + Express + TypeScript backend API
- **packages/shared**: Shared TypeScript types and interfaces

### Documentation

See [docs/README.md](./docs/README.md) for code examples and usage guides.

## Technology Stack

### Frontend
- React 18+ with Vite
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Recharts (data visualization)
- Framer Motion (animations)
- React Dropzone (file upload)
- React Router (routing)

### Backend
- Node.js with Express
- TypeScript
- pdf-parse (PDF text extraction)
- mammoth (DOCX text extraction)
- multer (file upload handling)

### Testing
- Vitest (unit testing)
- fast-check (property-based testing)

### Code Quality
- ESLint
- Prettier

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install all dependencies
npm install
```

### Development

```bash
# Run frontend development server (port 3000)
npm run dev:frontend

# Run backend development server (port 5000)
npm run dev:backend
```

### Building

```bash
# Build frontend
npm run build:frontend

# Build backend
npm run build:backend
```

### Testing

```bash
# Run all tests
npm test
```

### Code Quality

```bash
# Lint all packages
npm run lint

# Format all code
npm run format
```

## Features

- PDF and DOCX resume upload with drag-and-drop support
- Text extraction and intelligent section detection
- ATS compatibility scoring (0-100 scale)
- Keyword analysis with categorization
- Job description matching and gap analysis
- Actionable improvement suggestions
- Modern, responsive UI with animations

## License

MIT

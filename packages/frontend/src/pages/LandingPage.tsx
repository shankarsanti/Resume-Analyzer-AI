import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Animation variants for Hero Section
  const heroVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  // Detect reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Animation variants for Features Section
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Animation variants for How It Works Section
  const stepVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Hero Section */}
        <motion.div
          className="text-center py-12 sm:py-16 lg:py-20"
          initial={prefersReducedMotion ? "visible" : "hidden"}
          animate="visible"
          variants={heroVariants}
        >
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="text-blue-600" aria-hidden="true">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            AI Resume Analyzer
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Improve your resume instantly with AI-powered analysis
          </p>
          <motion.button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] motion-reduce:transition-none motion-reduce:hover:scale-100"
            variants={prefersReducedMotion ? {} : buttonVariants}
            whileHover={prefersReducedMotion ? {} : "hover"}
            whileTap={prefersReducedMotion ? {} : "tap"}
            aria-label="Upload your resume to get started"
          >
            <Upload className="w-5 h-5" aria-hidden="true" />
            Upload Resume
          </motion.button>
        </motion.div>

        {/* Features Section */}
        <motion.section
          className="py-12 sm:py-16"
          initial={prefersReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={prefersReducedMotion ? {} : containerVariants}
          aria-labelledby="features-heading"
        >
          <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <motion.div
              className="bg-white rounded-xl p-6 sm:p-8 shadow-md border border-gray-200 hover:shadow-xl transition-shadow motion-reduce:transition-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
              variants={prefersReducedMotion ? {} : cardVariants}
            >
              <div className="text-blue-600 mb-3 sm:mb-4" aria-hidden="true">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" strokeWidth={2} />
                  <circle cx="12" cy="12" r="6" strokeWidth={2} />
                  <circle cx="12" cy="12" r="2" strokeWidth={2} />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">
                Resume Score
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Get an instant ATS compatibility score from 0-100 with detailed
                breakdown of formatting, keywords, and content quality.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl p-6 sm:p-8 shadow-md border border-gray-200 hover:shadow-xl transition-shadow motion-reduce:transition-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
              variants={prefersReducedMotion ? {} : cardVariants}
            >
              <div className="text-green-600 mb-3 sm:mb-4" aria-hidden="true">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">
                AI Suggestions
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Receive actionable recommendations to improve your resume, from
                keyword optimization to content enhancement.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl p-6 sm:p-8 shadow-md border border-gray-200 hover:shadow-xl transition-shadow motion-reduce:transition-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
              variants={prefersReducedMotion ? {} : cardVariants}
            >
              <div className="text-purple-600 mb-3 sm:mb-4" aria-hidden="true">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">
                Job Matching
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Compare your resume against specific job descriptions to
                identify gaps and tailor your application.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <section className="bg-gray-50 py-12 sm:py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" aria-labelledby="how-it-works-heading">
          <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto relative">
            <motion.div
              className="bg-white rounded-xl p-6 sm:p-8 text-center"
              initial={prefersReducedMotion ? "visible" : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={0}
              variants={prefersReducedMotion ? {} : stepVariants}
            >
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3 sm:mb-4" aria-hidden="true">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">
                Upload Resume
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Upload your PDF or DOCX resume. We support files up to 10MB.
              </p>
            </motion.div>

            {/* Arrow connector 1 (desktop only) */}
            <div className="hidden md:flex items-center justify-center absolute left-1/3 top-20 -translate-x-1/2" aria-hidden="true">
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </div>

            <motion.div
              className="bg-white rounded-xl p-6 sm:p-8 text-center"
              initial={prefersReducedMotion ? "visible" : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={1}
              variants={prefersReducedMotion ? {} : stepVariants}
            >
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3 sm:mb-4" aria-hidden="true">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">
                Analyze
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Our AI analyzes your resume for ATS compatibility, keywords, and
                content quality.
              </p>
            </motion.div>

            {/* Arrow connector 2 (desktop only) */}
            <div className="hidden md:flex items-center justify-center absolute left-2/3 top-20 -translate-x-1/2" aria-hidden="true">
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </div>

            <motion.div
              className="bg-white rounded-xl p-6 sm:p-8 text-center"
              initial={prefersReducedMotion ? "visible" : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={2}
              variants={prefersReducedMotion ? {} : stepVariants}
            >
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3 sm:mb-4" aria-hidden="true">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">
                Get Results
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Review your score, identified keywords, and actionable
                suggestions for improvement.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;

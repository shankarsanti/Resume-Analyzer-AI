import React, { useState, useEffect } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface ResumeScoreSectionProps {
  score: number;
}

const ResumeScoreSection: React.FC<ResumeScoreSectionProps> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  // Detect reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Determine color and status based on score
  const getScoreConfig = (value: number) => {
    if (value >= 71) {
      return {
        color: '#22c55e',
        backgroundColor: '#dcfce7',
        textColor: 'text-green-600',
        status: 'Excellent Score!',
      };
    } else if (value >= 41) {
      return {
        color: '#eab308',
        backgroundColor: '#fef3c7',
        textColor: 'text-yellow-600',
        status: 'Good Progress',
      };
    } else {
      return {
        color: '#ef4444',
        backgroundColor: '#fee2e2',
        textColor: 'text-red-600',
        status: 'Needs Improvement',
      };
    }
  };

  const config = getScoreConfig(score);

  // Count-up animation effect
  useEffect(() => {
    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      setDisplayScore(score);
      return;
    }

    const duration = 1000; // 1 second
    const steps = 60; // 60 frames for smooth animation
    const increment = score / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [score, prefersReducedMotion]);

  // Prepare data for Recharts
  const chartData = [
    {
      name: 'Score',
      value: displayScore,
      fill: config.color,
    },
  ];

  // Responsive size based on screen width
  const [chartSize, setChartSize] = React.useState(200);

  React.useEffect(() => {
    const updateSize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width < 640) {
          setChartSize(140); // Mobile
        } else if (width < 768) {
          setChartSize(160); // Small tablet
        } else {
          setChartSize(200); // Desktop
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <section
      className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-md border border-gray-200 text-center"
      aria-labelledby="resume-score-heading"
    >
      <h2 id="resume-score-heading" className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">Resume Score</h2>

      {/* Circular Progress Indicator */}
      <div className="flex justify-center items-center mb-3 sm:mb-4">
        <div className="relative" role="img" aria-label={`Resume score: ${displayScore} out of 100`}>
          <RadialBarChart
            width={chartSize}
            height={chartSize}
            cx={chartSize / 2}
            cy={chartSize / 2}
            innerRadius={chartSize * 0.35}
            outerRadius={chartSize * 0.45}
            barSize={chartSize * 0.1}
            data={chartData}
            startAngle={90}
            endAngle={-270}
            aria-hidden="true"
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: config.backgroundColor }}
              dataKey="value"
              cornerRadius={chartSize * 0.05}
              fill={config.color}
            />
          </RadialBarChart>

          {/* Score Display in Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl sm:text-4xl font-bold text-gray-900">
              {displayScore}
            </div>
            <div className="text-lg sm:text-xl text-gray-500">/100</div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <p className={`text-base sm:text-lg font-medium mt-3 sm:mt-4 ${config.textColor}`} role="status" aria-live="polite">
        {config.status}
      </p>
    </section>
  );
};

export default ResumeScoreSection;

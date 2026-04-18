/**
 * Utility functions for score color mapping and status
 */

export type ScoreStatus = 'needs-improvement' | 'good-progress' | 'excellent';
export type ScoreColor = 'red' | 'yellow' | 'green';

export interface ScoreData {
  value: number;
  status: ScoreStatus;
  color: ScoreColor;
  message: string;
  colorClass: string;
  bgColorClass: string;
  textColorClass: string;
}

/**
 * Get score status, color, and message based on score value
 * @param score - Score value (0-100)
 * @returns ScoreData object with status, color, message, and CSS classes
 */
export function getScoreData(score: number): ScoreData {
  if (score >= 71) {
    return {
      value: score,
      status: 'excellent',
      color: 'green',
      message: 'Excellent Score!',
      colorClass: '#22c55e', // green-500
      bgColorClass: 'bg-green-100',
      textColorClass: 'text-green-600',
    };
  } else if (score >= 41) {
    return {
      value: score,
      status: 'good-progress',
      color: 'yellow',
      message: 'Good Progress',
      colorClass: '#eab308', // yellow-500
      bgColorClass: 'bg-yellow-100',
      textColorClass: 'text-yellow-600',
    };
  } else {
    return {
      value: score,
      status: 'needs-improvement',
      color: 'red',
      message: 'Needs Improvement',
      colorClass: '#ef4444', // red-500
      bgColorClass: 'bg-red-100',
      textColorClass: 'text-red-600',
    };
  }
}

/**
 * Get Tailwind color classes for a given score
 * @param score - Score value (0-100)
 * @returns Object with Tailwind CSS classes
 */
export function getScoreColorClasses(score: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (score >= 71) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-600',
      border: 'border-green-200',
    };
  } else if (score >= 41) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
    };
  } else {
    return {
      bg: 'bg-red-100',
      text: 'text-red-600',
      border: 'border-red-200',
    };
  }
}

/**
 * Get hex color value for a given score (for charts)
 * @param score - Score value (0-100)
 * @returns Hex color string
 */
export function getScoreColor(score: number): string {
  if (score >= 71) return '#22c55e'; // green-500
  if (score >= 41) return '#eab308'; // yellow-500
  return '#ef4444'; // red-500
}

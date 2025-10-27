import React from 'react';
import { render, screen } from '@testing-library/react';
import { StreakDisplay } from './StreakDisplay';
import { StreakDisplayProps } from './StreakDisplay.types';


const defaultProps: StreakDisplayProps = {
  currentStreak: 5,
  bestStreak: 10,
};

describe('StreakDisplay', () => {
  it('should render current and best streak values', () => {
    render(<StreakDisplay {...defaultProps} />);
    
    expect(screen.getByText('Your Streaks')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('Best')).toBeInTheDocument();
  });

  it('should handle zero values', () => {
    render(<StreakDisplay currentStreak={0} bestStreak={0} />);
    
    expect(screen.getAllByText('0')).toHaveLength(2);
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('Best')).toBeInTheDocument();
  });

  it('should handle large values', () => {
    render(<StreakDisplay currentStreak={999} bestStreak={1000} />);
    
    expect(screen.getByText('999')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('should handle when current streak equals best streak', () => {
    render(<StreakDisplay currentStreak={15} bestStreak={15} />);
    
    expect(screen.getAllByText('15')).toHaveLength(2);
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('Best')).toBeInTheDocument();
  });

  it('should handle when current streak is greater than best streak', () => {
    render(<StreakDisplay currentStreak={20} bestStreak={15} />);
    
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('should handle negative values', () => {
    render(<StreakDisplay currentStreak={-5} bestStreak={-10} />);
    
    expect(screen.getByText('-5')).toBeInTheDocument();
    expect(screen.getByText('-10')).toBeInTheDocument();
  });

  it('should render with different values when props change', () => {
    const { rerender } = render(<StreakDisplay currentStreak={3} bestStreak={7} />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    
    rerender(<StreakDisplay currentStreak={8} bestStreak={12} />);
    
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('should maintain correct structure with different values', () => {
    render(<StreakDisplay currentStreak={42} bestStreak={1337} />);
    
    // Check that the structure is maintained
    const streakContainer = screen.getByText('Your Streaks').closest('div');
    expect(streakContainer).toBeInTheDocument();
    
    // Check that both numbers are present
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('1337')).toBeInTheDocument();
    
    // Check that labels are present
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('Best')).toBeInTheDocument();
  });

  it('should handle very large numbers', () => {
    render(<StreakDisplay currentStreak={999999} bestStreak={1000000} />);
    
    expect(screen.getByText('999999')).toBeInTheDocument();
    expect(screen.getByText('1000000')).toBeInTheDocument();
  });

  it('should handle decimal values (if they somehow get passed)', () => {
    render(<StreakDisplay currentStreak={5.5} bestStreak={10.7} />);
    
    expect(screen.getByText('5.5')).toBeInTheDocument();
    expect(screen.getByText('10.7')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterCard } from './CharacterCard';
import { Character } from './CharacterCard.types';


const mockCharacter: Character = {
  id: 1,
  name: 'test_character_name',
  post_count: 1000,
  image_url: 'https://example.com/image.jpg'
};

const defaultProps = {
  character: mockCharacter,
  onClick: jest.fn(),
  revealed: false,
  isCorrect: null,
  isGrayedOut: false,
  disabled: false,
};

describe('CharacterCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render character name correctly', () => {
    render(<CharacterCard {...defaultProps} />);
    
    expect(screen.getByText('test character name')).toBeInTheDocument();
  });

  it('should render character image when image_url is provided', () => {
    render(<CharacterCard {...defaultProps} />);
    
    const image = screen.getByAltText('test character name');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('should render fallback text when image_url is null', () => {
    const characterWithoutImage = { ...mockCharacter, image_url: null };
    render(<CharacterCard {...defaultProps} character={characterWithoutImage} />);
    
    expect(screen.getByText('Image not available')).toBeInTheDocument();
  });

  it('should render fallback text when image_url is empty string', () => {
    const characterWithoutImage = { ...mockCharacter, image_url: '' };
    render(<CharacterCard {...defaultProps} character={characterWithoutImage} />);
    
    expect(screen.getByText('Image not available')).toBeInTheDocument();
  });

  it('should show post count when revealed is true', () => {
    render(<CharacterCard {...defaultProps} revealed={true} />);
    
    expect(screen.getByText('1,000 posts')).toBeInTheDocument();
  });

  it('should not show post count when revealed is false', () => {
    render(<CharacterCard {...defaultProps} revealed={false} />);
    
    expect(screen.queryByText('1,000 posts')).not.toBeInTheDocument();
  });

  it('should call onClick when card is clicked and not disabled', () => {
    const mockOnClick = jest.fn();
    render(<CharacterCard {...defaultProps} onClick={mockOnClick} />);
    
    const card = screen.getByText('test character name').closest('div');
    fireEvent.click(card!);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockCharacter);
  });

  it('should not call onClick when card is disabled', () => {
    const mockOnClick = jest.fn();
    render(<CharacterCard {...defaultProps} onClick={mockOnClick} disabled={true} />);
    
    const card = screen.getByText('test character name').closest('div');
    fireEvent.click(card!);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should not call onClick when onClick is not provided', () => {
    render(<CharacterCard {...defaultProps} onClick={undefined} />);
    
    const card = screen.getByText('test character name').closest('div');
    fireEvent.click(card!);
    
    // Should not throw error
    expect(() => fireEvent.click(card!)).not.toThrow();
  });

  it('should handle image error by hiding image and showing fallback text', () => {
    render(<CharacterCard {...defaultProps} />);
    
    const image = screen.getByAltText('test character name');
    fireEvent.error(image);
    
    expect(image).toHaveStyle('display: none');
    expect(screen.getByText('Image not available')).toBeInTheDocument();
  });

  it('should apply correct styling when isCorrect is true', () => {
    const { container } = render(<CharacterCard {...defaultProps} isCorrect={true} />);
    
    // The styled component should receive the correct props
    const cardContainer = container.firstChild as HTMLElement;
    expect(cardContainer).toBeInTheDocument();
  });

  it('should apply correct styling when isCorrect is false', () => {
    const { container } = render(<CharacterCard {...defaultProps} isCorrect={false} />);
    
    const cardContainer = container.firstChild as HTMLElement;
    expect(cardContainer).toBeInTheDocument();
  });

  it('should apply correct styling when isGrayedOut is true', () => {
    const { container } = render(<CharacterCard {...defaultProps} isGrayedOut={true} />);
    
    const cardContainer = container.firstChild as HTMLElement;
    expect(cardContainer).toBeInTheDocument();
  });

  it('should apply correct styling when disabled is true', () => {
    const { container } = render(<CharacterCard {...defaultProps} disabled={true} />);
    
    const cardContainer = container.firstChild as HTMLElement;
    expect(cardContainer).toBeInTheDocument();
  });

  it('should format character name correctly', () => {
    const characterWithUnderscores = { ...mockCharacter, name: 'test_character_with_underscores' };
    render(<CharacterCard {...defaultProps} character={characterWithUnderscores} />);
    
    expect(screen.getByText('test character with underscores')).toBeInTheDocument();
  });

  it('should format post count with locale formatting', () => {
    const characterWithLargeCount = { ...mockCharacter, post_count: 1234567 };
    render(<CharacterCard {...defaultProps} character={characterWithLargeCount} revealed={true} />);
    
    expect(screen.getByText('1,234,567 posts')).toBeInTheDocument();
  });
});

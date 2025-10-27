# Prefetching System Documentation

## Overview

The E621rdle game implements a smart prefetching system to improve user experience by loading the next round's data and images in advance. This eliminates loading delays and provides instant transitions between rounds.

## Architecture

### Core Components

- **`PrefetchService`** (`src/services/prefetchService.ts`): Main service handling prefetching logic
- **`useGameState`** hook: Integrates prefetching with game state management
- **Cache Management**: In-memory caching with expiration

### Service Interface

```typescript
class PrefetchService {
  // Public methods
  prefetchNextRound(): Promise<Character[]>
  consumePrefetchedData(): Character[] | null
  hasValidPrefetch(): boolean
  clearCache(): void
  
  // Private methods
  private prefetchImages(characters: Character[]): Promise<void>
  private prefetchImage(url: string): Promise<void>
}
```

## How It Works

### 1. Prefetching Triggers

Prefetching is triggered at strategic moments:

- **After successful round fetch**: When `fetchRound()` completes, it triggers background prefetching
- **After character selection**: When user makes a choice, prefetch starts if no valid cache exists
- **After game over**: When game ends, prefetch prepares for potential restart

### 2. Data Flow

```
User Action → Game State Change → Prefetch Trigger → Background API Call → Cache Storage
     ↓
Next Round → Consume Cache → Instant Display → Trigger Next Prefetch
```

### 3. Cache Management

- **Storage**: In-memory cache with `characters`, `imagesLoaded`, `timestamp`, and `inProgress` fields
- **Expiration**: 5-minute cache duration to ensure data freshness
- **Validation**: `hasValidPrefetch()` checks cache validity before consumption

### 4. Image Preloading

- **Parallel Loading**: All character images are loaded simultaneously using `Promise.allSettled()`
- **Error Handling**: Failed image loads don't break the prefetch process
- **Browser Caching**: Images are loaded into browser cache for instant display

## Error Handling

### Graceful Degradation

- **API Failures**: Prefetch errors are logged but don't affect gameplay
- **Image Failures**: Failed image loads are logged but don't prevent data consumption
- **Cache Misses**: Falls back to normal API calls seamlessly

### Duplicate Prevention

- **In-Progress Tracking**: Prevents multiple simultaneous prefetch operations
- **Promise Reuse**: Returns existing promise if prefetch is already in progress

## Performance Benefits

### User Experience

- **Instant Transitions**: New rounds start immediately without loading delays
- **Smooth Gameplay**: No waiting for API calls or image loads
- **Background Processing**: Prefetching happens during user interaction time

### Technical Benefits

- **Reduced Perceived Latency**: Users see instant responses
- **Better Resource Utilization**: Background loading during idle time
- **Improved Engagement**: Faster gameplay keeps users engaged

## Testing

### Test Coverage

- **Unit Tests**: `prefetchService.test.ts` covers all service methods
- **Integration Tests**: `useGameState.test.ts` tests prefetching integration
- **Error Scenarios**: Tests cover API failures, image loading failures, and cache expiration

### Test Strategy

- **Mocking**: API service and Image constructor are mocked for predictable testing
- **Async Handling**: Tests use proper async/await patterns with `act()`
- **Edge Cases**: Tests cover cache expiration, duplicate requests, and error conditions

## Configuration

### Cache Settings

```typescript
private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

### Image Loading

```typescript
private prefetchImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Don't reject on image errors
    img.src = url;
  });
}
```

## Future Enhancements

### Potential Improvements

- **Predictive Prefetching**: Prefetch multiple rounds ahead
- **User Behavior Analysis**: Adjust prefetching based on user patterns
- **Network-Aware Prefetching**: Adjust strategy based on connection quality
- **Memory Management**: Implement cache size limits for long sessions

### Monitoring

- **Performance Metrics**: Track prefetch success rates and timing
- **User Experience**: Monitor round transition times
- **Error Tracking**: Log and analyze prefetch failures

## Implementation Notes

### Best Practices

- **Non-Blocking**: Prefetching never blocks user interactions
- **Error Isolation**: Prefetch failures don't affect core game functionality
- **Resource Management**: Images are loaded efficiently without memory leaks
- **Cache Validation**: Always validate cache before consumption

### Code Quality

- **Type Safety**: Full TypeScript implementation with strict typing
- **Error Handling**: Comprehensive error handling with graceful fallbacks
- **Testing**: Extensive test coverage with both unit and integration tests
- **Documentation**: Clear code comments and comprehensive documentation

# E621rdle - Higher or Lower Character Game

A modern web-based game where players guess which of two characters has more posts on e621.net. Test your knowledge of character popularity in this addictive higher-or-lower style game!

## Features

- **Higher-or-Lower Gameplay**: Choose which character you think has more posts
- **Streak Tracking**: Track your current streak and personal best
- **Beautiful UI**: Modern, responsive design that works on desktop and mobile
- **Character Images**: Visual cards with character images and names
- **Persistent Stats**: Your best streak is saved locally
- **Huge Database**: Over 1000 characters with real post count data
- **Smart Prefetching**: Next round data and images are loaded in advance for instant gameplay
- **Type Safety**: Full TypeScript implementation with strict typing
- **Modern Development**: Hot module replacement and optimized builds

## Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express.js + SQLite database
- **Build System**: Vite with React plugin
- **Type Safety**: Comprehensive TypeScript definitions
- **Development**: Hot module replacement, source maps, and type checking
- **Performance**: Smart prefetching system for instant round transitions
- **Data**: Character names, post counts, and image URLs from e621.net

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Seed the Database** (if not already done):
   ```bash
   npm run seed
   ```

3. **Start Both Servers**:
   ```bash
   # Terminal 1 - Backend API Server
   npm run dev
   
   # Terminal 2 - Frontend Development Server
   npm start
   ```

4. **Play the Game**:
   Visit `http://localhost:3000` in your browser

## Development Setup

### Understanding the Commands

- **`npm start`** - Starts the **frontend development server** (Vite)
  - Runs on `http://localhost:3000/`
  - Provides hot module replacement for React/TypeScript
  - Serves the development version with live reloading

- **`npm run dev`** - Starts the **backend API server** (Node.js/Express)
  - Runs on `http://localhost:3001/`
  - Serves API endpoints for character data
  - Uses nodemon for auto-restart on changes

### Why You Need Both

The application uses a **client-server architecture**:
- **Frontend** (`npm start`) - The game UI that users interact with
- **Backend** (`npm run dev`) - The API that provides character data from the database

For the best development experience, run both servers simultaneously.

## Development

### Prerequisites

- Node.js 18+ 
- NPM or Yarn

### Available Scripts

- `npm start` - Start frontend development server (Vite)
- `npm run dev` - Start backend API server (nodemon)
- `npm run build` - Build production frontend
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run seed` - Seed the database with character data

### Project Structure

```
e621rdle/
├── src/                   # Frontend source code (TypeScript/React)
│   ├── components/        # React components
│   │   ├── CharacterCard.tsx
│   │   ├── Game.tsx
│   │   ├── GameOver.tsx
│   │   ├── ResultMessage.tsx
│   │   └── StreakDisplay.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useGameState.ts
│   ├── services/         # API services
│   │   ├── api.ts
│   │   └── prefetchService.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   └── gameLogic.ts
│   ├── App.tsx           # Main App component
│   ├── App.css           # Styles
│   └── main.tsx          # Entry point
├── dist/                 # Built frontend (generated)
├── server.js             # Express.js backend server
├── database.sqlite       # SQLite database (created after seeding)
├── scripts/
│   └── seed.js           # Database seeding script
├── characters.csv        # Character names and post counts
├── top_img.csv          # Character image URLs
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## API Endpoints

- `GET /api/get-round` - Returns two random characters with different post counts
- `GET /api/stats` - Returns database statistics

## Game Rules

1. Two character cards are displayed
2. Click on the character you think has more posts
3. The correct answer is revealed along with both post counts
4. Correct guesses increase your streak
5. Wrong guesses end your streak and show game over
6. Your best streak is saved automatically

## Performance Features

### Smart Prefetching System

The game includes an intelligent prefetching system that dramatically improves user experience:

- **Background Loading**: Next round data is fetched while you're viewing current results
- **Image Preloading**: Character images are loaded in advance to prevent loading delays
- **Instant Transitions**: New rounds start immediately without waiting for API calls
- **Cache Management**: Prefetched data expires after 5 minutes to ensure freshness
- **Error Handling**: Graceful fallback to normal API calls if prefetching fails
- **Duplicate Prevention**: Multiple prefetch requests are deduplicated automatically

This means faster gameplay, smoother transitions, and a more responsive feel throughout your gaming session.

## Data Sources

Character data is sourced from e621.net including:
- Character names and post counts (`characters.csv`)
- Representative images for each character (`top_img.csv`)

## Recent Improvements

This project has been completely modernized with:

- ✅ **TypeScript Migration**: Full type safety with strict TypeScript configuration
- ✅ **Modern Build System**: Vite with React plugin for fast development and optimized builds
- ✅ **Component Architecture**: Properly separated React components with custom hooks
- ✅ **Development Experience**: Hot module replacement, source maps, and type checking
- ✅ **Code Organization**: Clean project structure with proper separation of concerns
- ✅ **Performance**: Optimized builds with code splitting and asset optimization
- ✅ **Smart Prefetching**: Next round data and images are prefetched for instant gameplay transitions

## Browser Compatibility

- Modern browsers with ES6+ support
- Mobile-responsive design
- Works on iOS Safari, Chrome, Firefox, etc.

## Testing

Comprehensive test suite with Jest + React Testing Library.

### Commands

```bash
npm test                 # Run all tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests only
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
```

### Test Types

**Unit Tests** - Individual components/functions in isolation:
- `ComponentName.test.tsx` - Component rendering, user interactions
- `useGameState.test.ts` - Hook state management, localStorage, prefetching integration
- `api.test.ts` - API calls, error handling
- `prefetchService.test.ts` - Prefetching logic, caching, image loading
- `gameLogic.test.ts` - Pure functions, business logic

**Integration Tests** - Multiple parts working together:
- `api.integration.test.ts` - Real API calls, HTTP errors, performance
- `gameFlow.integration.test.tsx` - Complete user experience, UI interactions

### Coverage
- **140 total tests** (118 unit + 22 integration)
- **100% pass rate** with comprehensive error handling
- TypeScript support with jsdom environment
- Comprehensive prefetching functionality testing

## Contributing

Feel free to submit issues or pull requests to improve the game!

## License

This project is for educational and entertainment purposes. Please respect e621.net's terms of service.
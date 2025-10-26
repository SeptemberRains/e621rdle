# E621rdle - Higher or Lower Character Game

A web-based game where players guess which of two characters has more posts on e621.net. Test your knowledge of character popularity in this addictive higher-or-lower style game!

## Features

- **Higher-or-Lower Gameplay**: Choose which character you think has more posts
- **Streak Tracking**: Track your current streak and personal best
- **Beautiful UI**: Modern, responsive design that works on desktop and mobile
- **Character Images**: Visual cards with character images and names
- **Persistent Stats**: Your best streak is saved locally
- **Huge Database**: Over 1000 characters with real post count data

## Technical Stack

- **Backend**: Node.js with Express.js and SQLite database
- **Frontend**: React.js (via CDN) with modern CSS
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

3. **Start the Server**:
   ```bash
   npm start
   ```

4. **Play the Game**:
   Visit `http://localhost:3001` in your browser

## Development

### Prerequisites

- Node.js 14+ 
- NPM or Yarn

### Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Seed the database: `npm run seed`
4. Start development server: `npm run dev` (uses nodemon for auto-restart)

### Project Structure

```
e621rdle/
├── server.js              # Express.js backend server
├── database.sqlite        # SQLite database (created after seeding)
├── public/                # Frontend files served statically
│   ├── index.html        # Main HTML page
│   ├── app.js            # React application
│   └── styles.css        # CSS styling
├── scripts/
│   └── seed.js           # Database seeding script
├── characters.csv        # Character names and post counts
├── top_img.csv          # Character image URLs
└── package.json         # Node.js dependencies and scripts
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

## Data Sources

Character data is sourced from e621.net including:
- Character names and post counts (`characters.csv`)
- Representative images for each character (`top_img.csv`)

## Browser Compatibility

- Modern browsers with ES6+ support
- Mobile-responsive design
- Works on iOS Safari, Chrome, Firefox, etc.

## Contributing

Feel free to submit issues or pull requests to improve the game!

## License

This project is for educational and entertainment purposes. Please respect e621.net's terms of service.
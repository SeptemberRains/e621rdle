Here is your **updated design document** for the MVP, now using a relational database (such as PostgreSQL or MySQL) to store character data. The schema is included as a SQL table definition.

***

## Design Document: Higher-or-Lower Game MVP With Relational Database

### Purpose

A web application where users guess which of two characters has more posts. Each round, two random characters with images are displayed; the player picks the one they think is more popular.

***

### 1. Data Model & Database Schema

**Relational Database:**  
Store all character/tag data centrally in a SQL table.

**Character Table:**

```sql
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    post_count INTEGER NOT NULL,
    image_url TEXT
);
```

- **id:** Unique identifier (auto-incremented).
- **name:** Character name.
- **post_count:** Number of posts for the character (must be an integer).
- **image_url:** URL of the image representing the character.

**Indexing:**  
Optionally, add an index to post_count if sorting or filtering is needed.

***

### 2. Backend/API Design

**Stack:** Node.js with Express (or Python Flask/FastAPI, etc.)

**Endpoints:**

- `/api/get-round`  
  - Returns data for two random, distinct characters (with different post counts).
  - Response:  
    ```json
    [
      {
        "id": 17,
        "name": "Character A",
        "post_count": 6510,
        "image_url": "https://example.com/a.jpg"
      },
      {
        "id": 22,
        "name": "Character B",
        "post_count": 318,
        "image_url": "https://example.com/b.png"
      }
    ]
    ```
- *(Optional for admin workflow)* `/api/init` or database seeding script to populate/update the character data.

**Logic:**
- Always select two characters with different post_count values to avoid ties.
- Data stored and retrieved from the characters table.

***

### 3. Frontend Design

**Framework:** React.js or any SPA framework.

**Components:**
- **Game Board:** Shows two cards, each with the character’s image, name, and clickable area.
- **Reveal State:** After choice, show which character was correct and display both counts.
- **Streak Display:** Shows current and best streaks.
- **Restart/Next Button:** User clicks to continue or restart after a loss.

**UX:**
- Simple, mobile-friendly layout
- Prominent images with accessible alt text from the database.

***

### 4. Streak Management

- Streaks are handled in frontend state (can use `localStorage` to persist the best streak).

***

### 5. Game Logic

- Fetch `/api/get-round` for two characters.
- Player selects one.
- Reveal answer and update streak.
- If incorrect, offer to restart and update best streak if needed.
- Repeat.

***

### 6. Robustness & Edge Cases

- Prevent ties by only returning characters with distinct post_count.
- Handle insufficient data gracefully.
- Display placeholder image if image_url is missing.
- Network error: show a generic error, allow retry.

***

### 7. Programming Agent Instructions

- Set up the `characters` table exactly as defined above.
- Seed the database with character names, their post counts, and image URLs.
- Build backend endpoints to fetch and serve two random, distinct characters per request.
- Construct a minimal frontend that fetches, displays, compares, and scores user input.
- Optimize for clean code and easy future extension (e.g., additional modes, authentication).
- Ensure accessibility—all images have alt text from the character name.

***

This design provides a solid, extensible starting point for a web game leveraging your preferred relational database structure.
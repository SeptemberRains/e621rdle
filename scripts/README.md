# Scripts Documentation

This directory contains various utility scripts for data collection, database management, and debugging for the e621rdle project.

## Overview

The scripts in this directory handle:
- **Data Collection**: Fetching character data from e621.net API
- **Database Management**: Seeding the SQLite database with character information
- **Image Processing**: Finding and fixing missing character images
- **Debugging**: Network call debugging and troubleshooting
- **Git Management**: Repository maintenance utilities

## Scripts

### Data Collection Scripts

#### `get_chars.py` - Character Data Fetcher
**Purpose**: Fetches the top 1000 character tags from e621.net API and saves them to CSV.

**Usage**:
```bash
python get_chars.py output_file.csv
```

**Features**:
- Fetches character tags ordered by post count
- Respects e621.net rate limiting (1.1 second delays)
- Handles pagination automatically
- Saves to CSV format with `name` and `post_count` columns

**Example**:
```bash
python get_chars.py characters.csv
```

**Output**: Creates a CSV file with character names and their post counts.

---

#### `get_char_top_img.py` - Character Image Fetcher
**Purpose**: Finds representative images for characters by querying e621.net posts API.

**Usage**:
```bash
python get_char_top_img.py input_characters.csv output_images.csv [--login USERNAME] [--api-key KEY] [--threads N]
```

**Parameters**:
- `input_characters.csv`: Input file with character data
- `output_images.csv`: Output file for image URLs
- `--login USERNAME`: (Optional) e621.net username for authenticated requests
- `--api-key KEY`: (Optional) e621.net API key for authenticated requests
- `--threads N`: (Optional) Number of concurrent threads (default: 10)

**Features**:
- Multi-threaded processing for faster execution
- Searches for highest-scored, non-animated posts
- Handles rate limiting and API errors gracefully
- Supports both authenticated and anonymous requests
- Thread-safe CSV writing

**Example**:
```bash
python get_char_top_img.py characters.csv top_img.csv --threads 20
```

**Output**: Creates a CSV file with character names and their representative image URLs.

---

### Database Management Scripts

#### `seed.js` - Database Seeder
**Purpose**: Populates the SQLite database with character data from CSV files.

**Usage**:
```bash
node seed.js
```

**Features**:
- Creates the `characters` table with proper schema
- Imports character data from `characters.csv`
- Imports image URLs from `top_img.csv`
- Handles CSV parsing with proper quote handling
- Creates database indexes for performance
- Provides detailed progress logging

**Requirements**:
- `characters.csv` file in project root
- `top_img.csv` file in project root
- SQLite3 database file will be created at `../database.sqlite`

**Database Schema**:
```sql
CREATE TABLE characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  post_count INTEGER NOT NULL,
  image_url TEXT
);
```

---

### Image Processing Scripts

#### `fix_missing_images.py` - Image URL Fixer
**Purpose**: Attempts to find image URLs for characters that don't have them.

**Usage**:
```bash
python fix_missing_images.py [--login USERNAME] [--api-key KEY] [--threads N] [--debug]
```

**Parameters**:
- `--login USERNAME`: (Optional) e621.net username for authenticated requests
- `--api-key KEY`: (Optional) e621.net API key for authenticated requests
- `--threads N`: (Optional) Number of concurrent threads (default: 10)
- `--debug`: Enable detailed debugging output

**Features**:
- Identifies characters with missing or empty image URLs
- Retries failed requests with exponential backoff
- Comprehensive error handling and logging
- Thread-safe processing
- Updates the existing `top_img.csv` file

**Example**:
```bash
python fix_missing_images.py --login myusername --api-key mykey --threads 15 --debug
```

---

### Debugging Scripts

#### `debug_network_calls.py` - Network Debugger
**Purpose**: Debugs network calls by comparing failing and working character queries.

**Usage**:
```bash
python debug_network_calls.py [--login USERNAME] [--api-key KEY]
```

**Parameters**:
- `--login USERNAME`: (Optional) e621.net username for authenticated requests
- `--api-key KEY`: (Optional) e621.net API key for authenticated requests

**Features**:
- Compares a failing character query with a working one
- Shows detailed request/response information
- Helps identify API issues and authentication problems
- Interactive debugging session

**Example**:
```bash
python debug_network_calls.py --login myusername --api-key mykey
```

---

### Git Management Scripts

#### `rename_git.sh` - Git History Rewriter
**Purpose**: Rewrites git history to change author information.

**Usage**:
```bash
bash rename_git.sh
```

**Features**:
- Changes commit author name and email
- Updates both committer and author information
- Preserves all branches and tags
- **Warning**: This rewrites git history - use with caution!

**Configuration**:
Edit the script to set:
- `OLD_EMAIL`: Current email to replace
- `CORRECT_NAME`: New author name
- `CORRECT_EMAIL`: New author email

---

## Data Files

### `characters.csv`
Contains character data with columns:
- `name`: Character name
- `post_count`: Number of posts on e621.net

### `top_img.csv`
Contains character image data with columns:
- `name`: Character name
- `image_url`: Representative image URL

### `requirements.txt`
Python dependencies for the data collection scripts:
- `requests`: HTTP library for API calls
- `csv`: Built-in CSV handling

---

## Setup Instructions

### Python Environment
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Node.js Environment
1. Install dependencies:
   ```bash
   npm install
   ```

### e621.net API Access
For better results, consider getting e621.net API credentials:
1. Create an account on e621.net
2. Generate an API key in your account settings
3. Use `--login` and `--api-key` parameters with the Python scripts

---

## Common Workflows

### Initial Data Setup
1. Fetch character data:
   ```bash
   python get_chars.py characters.csv
   ```

2. Find character images:
   ```bash
   python get_char_top_img.py characters.csv top_img.csv --threads 20
   ```

3. Seed the database:
   ```bash
   node seed.js
   ```

### Fixing Missing Images
1. Run the image fixer:
   ```bash
   python fix_missing_images.py --threads 15
   ```

2. Re-seed the database:
   ```bash
   node seed.js
   ```

### Debugging Issues
1. Run the debug script:
   ```bash
   python debug_network_calls.py --login myusername --api-key mykey
   ```

---

## Troubleshooting

### Common Issues

1. **Rate Limiting**: e621.net has strict rate limits. The scripts include delays, but you may need to reduce thread count.

2. **Authentication Required**: Some posts require login. Use `--login` and `--api-key` parameters.

3. **Network Errors**: Check your internet connection and e621.net status.

4. **CSV Parsing Errors**: Ensure CSV files are properly formatted and encoded as UTF-8.

### Performance Tips

1. **Thread Count**: Start with 10 threads and adjust based on your connection and e621.net response times.

2. **Batch Processing**: Process data in smaller batches if you encounter memory issues.

3. **Rate Limiting**: The scripts include built-in delays, but you can increase them if needed.

---

## Notes

- All scripts respect e621.net's terms of service and rate limiting
- The e621.net API requires a custom User-Agent header
- Some posts may be unavailable without authentication
- The scripts are designed to be robust and handle errors gracefully
- Always backup your data before running scripts that modify files

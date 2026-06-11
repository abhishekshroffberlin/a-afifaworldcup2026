# Anirudh & Abhishek World Cup HQ — Live API version

This version uses a Vercel serverless function at `/api/worldcup` to fetch FIFA World Cup data from football-data.org without exposing your API key in the browser.

## Setup

1. Sign up at https://www.football-data.org/ and copy your API token.
2. In Vercel, open your project.
3. Go to Settings → Environment Variables.
4. Add:

   FOOTBALL_DATA_API_TOKEN=your_token_here

5. Replace your old `index.html` with this one.
6. Add the `api/worldcup.js` file to your project.
7. Commit and push to GitHub, or redeploy manually.

## Test

After deployment, open:

/api/worldcup?type=matches&season=2026

If it returns JSON, your live data route works.

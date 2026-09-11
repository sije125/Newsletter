# Newsletter

Learning how to use Express.js to make a sign up page for a newsletter.

## AI Money-Making Agent

`/agent` runs an interactive interview ("Niche Finder") that asks about your
skills, interests, available time/budget, and risk tolerance, then
recommends a specific niche and a specific method for making money online
with AI, plus concrete first steps.

### Setup

1. `npm install`
2. Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY` to your
   [Anthropic API key](https://console.anthropic.com/).
3. `npm start`
4. Open `http://localhost:3000/agent`

### Newsletter signup

The signup form at `/` posts to Mailchimp. To enable it, also set
`MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID`, and `MAILCHIMP_DATA_CENTER`
(the part after the `-` in your API key, e.g. `us18`) in `.env`.

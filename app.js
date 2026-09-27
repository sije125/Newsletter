require('dotenv').config();
const express = require('express');
const parser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(parser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('/signup.html', { root: __dirname });
});

app.post('/', (req, res) => {
  const firstName = req.body.fname;
  const lastName = req.body.lname;
  const email = req.body.email;

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const dataCenter = process.env.MAILCHIMP_DATA_CENTER;

  if (!apiKey || !listId || !dataCenter) {
    console.error('Mailchimp is not configured. Set MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID and MAILCHIMP_DATA_CENTER.');
    return res.sendFile('/failure.html', { root: __dirname });
  }

  const data = {
    members: [
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  fetch(`https://${dataCenter}.api.mailchimp.com/3.0/lists/${listId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `apikey ${apiKey}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        res.sendFile('/success.html', { root: __dirname });
      } else {
        res.sendFile('/failure.html', { root: __dirname });
      }
    })
    .catch((err) => {
      console.error('Mailchimp request failed:', err);
      res.sendFile('/failure.html', { root: __dirname });
    });
});

// --- AI money-making agent ---

app.get('/agent', (req, res) => {
  res.sendFile('/public/agent.html', { root: __dirname });
});

const AGENT_SYSTEM_PROMPT = `You are "Niche Finder", an advisor whose only job is to help the user find a
realistic, specific way to make money online using AI tools.

Run this like a structured interview, one focused question at a time, plain and conversational, not surveys.
Cover these areas across the conversation, adapting based on what the user already told you:
1. Current skills, professional background, education, and things they're good at.
2. Hobbies, interests, and topics they'd enjoy working on for months.
3. Time they can realistically commit per week, and any budget they can invest.
4. Risk tolerance and preference: steady service/freelance income vs. slower-building
   scalable income (products, content, software).
5. Existing assets: an audience, network, portfolio, past business/freelance experience.

Rules:
- Ask ONLY one question per turn until you have enough signal (usually after 4-6 of their answers).
- Keep questions short and specific to what they already said - never generic or repeated.
- Do not recommend anything until you've covered the areas above.
- When you do have enough information, stop asking questions and give a final recommendation with:
  a) A specific niche, chosen from their actual skills/interests (not a generic category).
  b) A specific monetization method (e.g., productized AI freelance service, a narrow micro-SaaS,
     a niche newsletter/content business, an AI automation service for a specific type of local
     business, AI-assisted digital products, done-for-you AI consulting, etc.) that fits their time,
     budget, and risk tolerance.
  c) 3-5 concrete first steps they can take this week to validate and start it.
- Every recommendation must clearly trace back to specific things the user told you - no boilerplate advice.
- Be direct, encouraging, and concise. Use short paragraphs or bullet points, not walls of text.`;

app.post('/api/agent', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' });
  }

  const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
  if (messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1024,
        system: AGENT_SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', response.status, errText);
      return res.status(502).json({ error: 'The AI service returned an error.' });
    }

    const result = await response.json();
    const reply = result.content?.[0]?.text || '';
    res.json({ reply });
  } catch (err) {
    console.error('Failed to reach Anthropic API:', err);
    res.status(502).json({ error: 'Failed to reach the AI service.' });
  }
});

app.listen(port, () => {
  console.log('listening on port ' + port);
});

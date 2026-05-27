const express = require('express');
const router = express.Router();
const axios = require('axios');

const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';

const BASE_PERSONA = `You are IKEA Assistant, a calm and patient voice guide that helps people build IKEA furniture hands-free. You are like a knowledgeable friend sitting next to them on the floor — steady, clear, and unflappable when things go wrong.

Starting a session
When the conversation begins, greet the user warmly and ask what they're building. Accept any of these:
- A product name ("I'm building a KALLAX")
- An article number
- A vague description ("it's a big white bookshelf with 4 shelves")

If they give you a vague description, ask one clarifying question to identify the product. Once you've identified it, confirm: "Got it — let's build your [PRODUCT NAME] together."

If you cannot identify the product, ask them to describe the box or any text on the manual.

Guiding the build
Walk through the build ONE step at a time. Never read ahead.

After each step, wait for the user to say something like "done", "okay", "next", or "got it" before continuing.

Keep each instruction SHORT and spoken — you are a voice, not a manual. No bullet points, no lists. Just clear natural sentences.

Always say which parts and hardware they need BEFORE describing what to do with them. ("Grab the two long side panels and four of the small wooden dowels...")

Count pieces out loud when it matters. ("You'll need exactly 8 of the small silver screws for this step.")

When things go wrong
Users will get confused, frustrated, or make mistakes. This is normal. Stay calm always.

If they say something is stuck, stripped, or won't fit: troubleshoot gently before suggesting they undo work.

If they skipped a step accidentally: help them figure out the least disruptive way to fix it.

If they're frustrated: acknowledge it, slow down, and simplify your language.

If they ask to go back: recap the previous step clearly and help them re-check their work.`;

function buildAssistantPrompt({ productName, parts, steps }) {
  const partsList = parts
    .map((p) => `  - ${p.name} (x${p.quantity}, ID: ${p.id})`)
    .join('\n');

  const stepsList = steps
    .map((s) => {
      let line = `  Step ${s.stepNumber}: ${s.title}\n    ${s.description}`;
      if (s.warning) line += `\n    ⚠️ Warning: ${s.warning}`;
      return line;
    })
    .join('\n\n');

  return `${BASE_PERSONA}

Manual data for this session — ${productName}:

Parts list:
${partsList}

Assembly steps:
${stepsList}

You are now specifically helping the user build the ${productName}. Use the steps and parts above as your guide. Start by greeting them and confirming the product, then walk through Step 1.`;
}

router.get('/signed-url', async (req, res) => {
  try {
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    if (!agentId) {
      return res.status(500).json({ error: 'ELEVENLABS_AGENT_ID not configured' });
    }

    const response = await axios.get(
      `${ELEVENLABS_BASE}/convai/conversation/get_signed_url`,
      {
        params: { agent_id: agentId },
        headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
        timeout: 10000,
      }
    );

    res.json({ signedUrl: response.data.signed_url });
  } catch (err) {
    console.error('Signed URL error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to get signed URL from ElevenLabs' });
  }
});

router.post('/update-agent', async (req, res) => {
  try {
    const { steps, productName, parts } = req.body;

    if (!steps || !productName || !parts) {
      return res.status(400).json({ error: 'Missing steps, productName, or parts' });
    }

    const agentId = process.env.ELEVENLABS_AGENT_ID;
    if (!agentId) {
      return res.status(500).json({ error: 'ELEVENLABS_AGENT_ID not configured' });
    }

    const systemPrompt = buildAssistantPrompt({ productName, parts, steps });

    const agentConfig = {
      conversation_config: {
        agent: {
          prompt: {
            prompt: systemPrompt,
          },
          first_message: `Hi! I'm here to help you build your ${productName}. Before we start, lay out all your parts somewhere you can see them. Ready when you are — shall I walk you through the parts list first, or go straight to Step 1?`,
        },
      },
    };

    if (process.env.ELEVENLABS_VOICE_ID) {
      agentConfig.conversation_config.tts = {
        voice_id: process.env.ELEVENLABS_VOICE_ID,
      };
    }

    await axios.patch(
      `${ELEVENLABS_BASE}/convai/agents/${agentId}`,
      agentConfig,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Update agent error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to update ElevenLabs agent' });
  }
});

module.exports = router;

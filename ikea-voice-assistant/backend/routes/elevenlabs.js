const express = require('express');
const router = express.Router();
const axios = require('axios');

const ELEVENLABS_BASE = 'https://api.elevenlabs.io/v1';

const AGENT_SYSTEM_PROMPT = `You are a calm, patient, and friendly assembly assistant. Your job is to guide users through building or assembling things — furniture, electronics, toys, anything — completely hands-free using voice.

When the conversation starts, greet the user warmly and ask: "What are we building today?"

When the user tells you what they're building:
1. Call the find_assembly_instructions tool with the product name right away.
2. Once you have the instructions, confirm the product: "Got it — let's build your [PRODUCT NAME] together."
3. Optionally offer to read the parts list first, or jump straight to Step 1.

Guiding the build:
- Walk through ONE step at a time. Never skip ahead.
- Wait for the user to say "done", "next", "okay", or "ready" before advancing.
- Keep each instruction SHORT and spoken — no lists, no bullet points. Natural speech only.
- Always tell them WHICH parts or hardware to grab BEFORE telling them what to do.
- Count pieces when it matters: "You'll need exactly 4 of the small silver screws."

When things go wrong:
- Stay calm always. Frustration is normal.
- If something is stuck or won't fit: troubleshoot gently before asking them to undo work.
- If they're confused: slow down, simplify, repeat.
- If they want to go back: recap the previous step clearly.

When all steps are complete, congratulate them enthusiastically.`;

const FIND_INSTRUCTIONS_TOOL = {
  type: 'client',
  name: 'find_assembly_instructions',
  description: 'Search online and find step-by-step assembly or setup instructions for a product. Call this as soon as the user tells you what they are building.',
  parameters: {
    type: 'object',
    properties: {
      product_name: {
        type: 'string',
        description: 'The exact name or model of the product to find instructions for (e.g. "IKEA KALLAX", "LEGO Technic 42151", "MALM bed frame")',
      },
    },
    required: ['product_name'],
  },
};

router.post('/setup', async (req, res) => {
  try {
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    if (!agentId) return res.status(500).json({ error: 'ELEVENLABS_AGENT_ID not configured' });

    const patchBody = {
      conversation_config: {
        agent: {
          prompt: {
            prompt: AGENT_SYSTEM_PROMPT,
            tools: [FIND_INSTRUCTIONS_TOOL],
          },
          first_message: "Hey! I'm your assembly assistant. What are we building today?",
        },
      },
    };

    if (process.env.ELEVENLABS_VOICE_ID) {
      patchBody.conversation_config.tts = { voice_id: process.env.ELEVENLABS_VOICE_ID };
    }

    await axios.patch(`${ELEVENLABS_BASE}/convai/agents/${agentId}`, patchBody, {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Agent setup error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to configure agent' });
  }
});

router.get('/signed-url', async (req, res) => {
  try {
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    if (!agentId) return res.status(500).json({ error: 'ELEVENLABS_AGENT_ID not configured' });

    const response = await axios.get(`${ELEVENLABS_BASE}/convai/conversation/get_signed_url`, {
      params: { agent_id: agentId },
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
      timeout: 10000,
    });

    res.json({ signedUrl: response.data.signed_url });
  } catch (err) {
    console.error('Signed URL error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to get signed URL from ElevenLabs' });
  }
});

// Legacy endpoint — kept for backward compat
router.post('/update-agent', async (req, res) => res.redirect(307, '/api/elevenlabs/setup'));

module.exports = router;

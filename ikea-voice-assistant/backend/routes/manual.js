const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const pdf = require('pdf-parse');
const Anthropic = require('@anthropic-ai/sdk');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CLAUDE_SYSTEM_PROMPT = `You are parsing an IKEA assembly manual. Extract and return ONLY a JSON object with this shape:
{
  "productName": string,
  "estimatedTime": string,
  "parts": [{ "id": string, "name": string, "quantity": number }],
  "tools": [string],
  "steps": [{ "stepNumber": number, "title": string, "description": string, "warning": string }]
}
Return only valid JSON, no markdown, no explanation. The warning field is optional — only include it when there is an actual safety or important notice for that step.`;

async function parseWithClaude(pdfText) {
  const truncated = pdfText.slice(0, 12000);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: CLAUDE_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Parse this IKEA assembly manual text into the required JSON format:\n\n${truncated}`,
      },
    ],
  });

  const rawText = message.content[0].text.trim();

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Claude did not return valid JSON');
  }

  return JSON.parse(jsonMatch[0]);
}

async function fetchPdfBuffer(url) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; IKEA-Assistant/1.0)',
      Accept: 'application/pdf,*/*',
    },
    maxRedirects: 5,
  });
  return Buffer.from(response.data);
}

function buildIkeaPdfUrl(articleNumber) {
  const clean = articleNumber.replace(/[.\s-]/g, '');
  return `https://www.ikea.com/us/en/assembly_instructions/s${clean}.pdf`;
}

router.post('/parse', upload.single('pdf'), async (req, res) => {
  try {
    let pdfBuffer;

    if (req.file) {
      pdfBuffer = req.file.buffer;
    } else if (req.body.pdfUrl) {
      pdfBuffer = await fetchPdfBuffer(req.body.pdfUrl);
    } else if (req.body.articleNumber) {
      const articleNumber = req.body.articleNumber.trim();
      const pdfUrl = buildIkeaPdfUrl(articleNumber);
      console.log(`Fetching IKEA PDF from: ${pdfUrl}`);

      try {
        pdfBuffer = await fetchPdfBuffer(pdfUrl);
      } catch (fetchErr) {
        const altUrl = `https://www.ikea.com/us/en/assembly_instructions/${articleNumber.replace(/[.\s]/g, '-')}.pdf`;
        console.log(`Primary URL failed, trying: ${altUrl}`);
        pdfBuffer = await fetchPdfBuffer(altUrl);
      }
    } else {
      return res.status(400).json({ error: 'Provide articleNumber, pdfUrl, or upload a PDF file' });
    }

    const pdfData = await pdf(pdfBuffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(422).json({ error: 'Could not extract readable text from PDF. The file may be image-based.' });
    }

    console.log(`Extracted ${extractedText.length} characters from PDF, sending to Claude...`);
    const parsed = await parseWithClaude(extractedText);

    res.json(parsed);
  } catch (err) {
    console.error('Manual parse error:', err.message);

    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'IKEA PDF not found for that article number. Try pasting the direct PDF URL.' });
    }
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'Claude returned malformed JSON. Try again.' });
    }

    res.status(500).json({ error: err.message || 'Failed to parse manual' });
  }
});

module.exports = router;

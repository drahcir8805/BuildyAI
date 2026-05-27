const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an assembly instruction finder. Search the web to find real assembly or setup instructions for the given product. Return ONLY a JSON object with this exact structure — no markdown, no explanation:
{
  "productName": string,
  "estimatedTime": string,
  "parts": [{ "id": string, "name": string, "quantity": number }],
  "tools": [string],
  "steps": [{ "stepNumber": number, "title": string, "description": string, "warning": string }]
}
If you cannot find exact instructions, use your knowledge to generate accurate, realistic assembly steps for the product.`;

async function findInstructions(productName) {
  const messages = [
    {
      role: 'user',
      content: `Find assembly or setup instructions for: "${productName}". Search the web for the actual instructions, then return them as the required JSON.`,
    },
  ];

  let response;
  let iterations = 0;

  do {
    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages,
    });

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });

      const toolResults = response.content
        .filter((b) => b.type === 'tool_use')
        .map((b) => ({
          type: 'tool_result',
          tool_use_id: b.id,
          content: '',
        }));

      if (toolResults.length > 0) {
        messages.push({ role: 'user', content: toolResults });
      }
    }

    iterations++;
  } while (response.stop_reason === 'tool_use' && iterations < 6);

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('No text response from Claude');

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude did not return valid JSON');

  return JSON.parse(jsonMatch[0]);
}

router.post('/find-instructions', async (req, res) => {
  try {
    const { product_name } = req.body;
    if (!product_name) {
      return res.status(400).json({ error: 'product_name is required' });
    }

    console.log(`Searching for instructions: "${product_name}"`);
    const result = await findInstructions(product_name);
    console.log(`Found ${result.steps?.length || 0} steps for "${result.productName}"`);

    res.json(result);
  } catch (err) {
    console.error('Find instructions error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to find instructions' });
  }
});

module.exports = router;

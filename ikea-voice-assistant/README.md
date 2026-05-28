#  Assembly Voice Assistant

An AI-powered voice assistant that guides you through IKEA furniture assembly step by step, using ElevenLabs Conversational AI and Claude for manual parsing.

## Features
- **AI Understanding**: Claude extracts structured steps, parts lists, tools, and warnings from the manual
- **Voice Assistant**: Talk to the assistant hands-free — ask about parts, request repeats, say "next" to advance steps
- **Visual Tracker**: See your progress through all assembly steps with a highlighted current step
- **Parts Checklist**: Check off parts as you find them to stay organized

## Setup

### Prerequisites

- Node.js 18+
- An [ElevenLabs](https://elevenlabs.io) account (free tier works)
- An [Anthropic](https://console.anthropic.com) API key

### 1. Install dependencies

```bash
cd ikea-voice-assistant/backend && npm install
cd ../frontend && npm install
```

### 2. Create an ElevenLabs Conversational AI Agent

1. Go to [elevenlabs.io/app/conversational-ai](https://elevenlabs.io/app/conversational-ai)
2. Click **Create Agent**
3. Set the first message to:
   > Hi! Ready to help you build your IKEA furniture. What are we assembling today?
4. Choose any voice you like
5. Save the agent and copy the **Agent ID** from the URL or settings panel

### 3. Configure environment variables

**backend/.env**
```
ANTHROPIC_API_KEY=sk-ant-...
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_AGENT_ID=your_agent_id_here
```

**frontend/.env**
```
VITE_BACKEND_URL=http://localhost:3001
```

### 4. Run the app

In two separate terminals:

```bash
# Terminal 1 — Backend
cd ikea-voice-assistant/backend
npm run dev
```

```bash
# Terminal 2 — Frontend
cd ikea-voice-assistant/frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

1. Tap the **Voice Orb** to start the conversation
4. Allow microphone access when prompted
5. The assistant greets you and reads Step 1 — say **"next"** to advance, ask questions naturally

## Project Structure

```
ikea-voice-assistant/
├── backend/
│   ├── server.js              # Express server on port 3001
│   ├── routes/
│   │   ├── manual.js          # PDF fetch + Claude parsing
│   │   └── elevenlabs.js      # Signed URL + agent config
│   └── .env
└── frontend/
    ├── src/
    │   ├── App.jsx             # Main app, 3-view state machine
    │   ├── components/
    │   │   ├── ProductSearch.jsx   # Article/URL/file input
    │   │   ├── VoiceOrb.jsx        # Animated mic button
    │   │   ├── StepTracker.jsx     # Visual step progress
    │   │   └── PartsList.jsx       # Parts checklist
    │   └── hooks/
    │       └── useElevenLabs.js    # ElevenLabs WebSocket hook
    └── .env
```

## Troubleshooting


**Microphone permission denied** — The browser requires HTTPS or localhost for microphone access. Make sure you're on `http://localhost:5173`.

**Agent not responding correctly** — The agent prompt is updated each time you load a new manual. If the agent seems confused, try ending and restarting the session after loading the manual.

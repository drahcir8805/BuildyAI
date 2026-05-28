# buildy — AI Assembly Voice Assistant

> Built for the **Toronto Tech Week × Cursor Hackathon** (May 2026)

buildy is a hands-free AI voice assistant that guides you through assembling furniture and products step by step. Tell it what you're building, and it finds the instructions, reads them to you, and walks you through every step — no manual required.

---

## How it works

1. Open the app and tap the glowing orb
2. Say what you're building — *"I'm putting together an IKEA KALLAX"*
3. buildy searches the web for assembly instructions using Claude AI
4. It guides you through every step, hands-free, via voice
5. Check off parts as you find them and track your progress visually

The entire interaction is voice-driven. No typing, no scrolling through a PDF — just talk.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Voice AI | ElevenLabs Conversational AI (WebSocket) |
| Intelligence | Anthropic Claude (`claude-sonnet-4-20250514`) |
| Web search | Claude `web_search_20250305` tool |
| PDF parsing | `pdf-parse` (for manual file uploads) |

**Architecture flow:**
```
User speaks → ElevenLabs (STT + LLM) → client tool call →
  frontend → backend → Claude + web search → assembly steps →
ElevenLabs (TTS) → speaks instructions back to user
```

---

## Running locally

### Prerequisites

- Node.js 18+
- [Anthropic API key](https://console.anthropic.com)
- [ElevenLabs](https://elevenlabs.io) account + Conversational AI agent

### 1. Clone the repo

```bash
git clone https://github.com/drahcir8805/BuildyAI.git
cd BuildyAI/ikea-voice-assistant
```

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Create an ElevenLabs agent

1. Go to [elevenlabs.io/app/conversational-ai](https://elevenlabs.io/app/conversational-ai)
2. Click **Create Agent**
3. Set the first message to: `Hey! I'm your assembly assistant. What are we building today?`
4. Pick any voice
5. Save and copy the **Agent ID**

### 4. Set environment variables

**`backend/.env`**
```env
ANTHROPIC_API_KEY=sk-ant-...
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_AGENT_ID=agent_...
ELEVENLABS_VOICE_ID=          # optional — ElevenLabs voice ID
```

**`frontend/.env`**
```env
VITE_BACKEND_URL=http://localhost:3001
```

### 5. Run

```bash
# Terminal 1 — backend
cd ikea-voice-assistant/backend
npm run dev

# Terminal 2 — frontend
cd ikea-voice-assistant/frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Deploying

The frontend and backend deploy separately.

**Frontend → Vercel**
- Root directory: `ikea-voice-assistant/frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_BACKEND_URL=https://your-backend-url`

**Backend → Railway / Render / Fly.io**
- Root directory: `ikea-voice-assistant/backend`
- Start command: `node server.js`
- Add all four env vars from `backend/.env`

---

## Project structure

```
ikea-voice-assistant/
├── backend/
│   ├── server.js                  # Express server, port 3001
│   └── routes/
│       ├── elevenlabs.js          # Agent config + signed URL
│       ├── manual.js              # PDF upload + Claude parsing
│       └── tools.js               # Claude web search tool endpoint
└── frontend/
    └── src/
        ├── App.jsx                # 3-column layout, full UI
        ├── hooks/
        │   └── useElevenLabs.js   # ElevenLabs WebSocket hook + client tools
        └── components/            # (VoiceOrb, StepTracker, PartsList legacy)
```

---

## Hackathon

Built at the **Toronto Tech Week × Cursor Hackathon**, May 2026.

The idea came from the frustration of assembling IKEA furniture while constantly having to stop and look at the manual. buildy lets you keep your hands on the pieces and your eyes on the work — the AI reads the steps to you and answers questions in real time.

---

## License

MIT

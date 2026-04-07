# Poke Daily Briefing — MCP Server

Morning Brief MCP server that gives [Poke](https://poke.com) real-time access to weather, news, and calendar context. Deploy once, connect via Poke Kitchen, and your AI assistant starts every conversation knowing what's happening in the world.

## Tools

| Tool | Description | API |
|------|-------------|-----|
| `get_weather` | Current conditions, forecast, sunrise/sunset for any city | [Open-Meteo](https://open-meteo.com/) (free, no key) |
| `get_top_news` | Top headlines by category (business, tech, sports, etc.) | [NewsData.io](https://newsdata.io/) (free tier: 200 req/day) |
| `get_calendar_today` | Today's date, day of week, and calendar events | Built-in (calendar provider integration coming soon) |

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/poke-apps/daily-briefing.git
cd daily-briefing
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
NEWSDATA_API_KEY=your_key_here   # Get free key at https://newsdata.io/register
PORT=3001                         # Default port
```

### 3. Build and run

```bash
npm run build    # Compile TypeScript
npm start        # Start the MCP server
```

Or for development with hot reload:
```bash
npm run dev
```

### 4. Verify

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "server": "poke-daily-briefing",
  "version": "1.0.0",
  "tools": ["get_weather", "get_top_news", "get_calendar_today"]
}
```

## Connecting to Poke Kitchen

1. Deploy this server (see [Deployment](#deployment) below)
2. Open **Poke Kitchen** in your Poke app
3. Add a new **MCP Server** connection:
   - **Name:** Daily Briefing
   - **URL:** `https://your-deployed-url.up.railway.app/sse`
   - **Transport:** SSE
4. Save and test — Poke now has access to all three tools

### Example Poke Prompts

Once connected, try asking Poke:

- *"What's the weather like today?"*
- *"Give me today's top tech news"*
- *"What day is it and what's on my calendar?"*
- *"Morning briefing please"* — Poke will call all three tools and synthesize a daily brief

## Deployment

### Railway (Recommended)

1. Push to GitHub
2. Connect your repo in [Railway](https://railway.app)
3. Add environment variable: `NEWSDATA_API_KEY`
4. Railway auto-detects `railway.toml` and deploys
5. Your SSE endpoint will be at `https://<your-app>.up.railway.app/sse`

### Any Node.js Host

The server is a standard Express app. Deploy anywhere that runs Node.js 18+:

```bash
npm install
npm run build
PORT=3001 NEWSDATA_API_KEY=xxx npm start
```

## Project Structure

```
daily-briefing/
├── src/
│   ├── index.ts              # MCP server entry — SSE transport, tool registration
│   ├── types.ts              # Shared TypeScript interfaces
│   └── tools/
│       ├── weather.ts        # Open-Meteo geocoding + forecast
│       ├── news.ts           # NewsData.io headline fetching
│       └── calendar.ts       # Date context + calendar prompt
├── package.json
├── tsconfig.json
├── railway.toml              # Railway deployment config
├── .env.example              # Environment variable template
└── .gitignore
```

## API Details

### get_weather

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `location` | string | Yes | City name (e.g. "New York", "London, UK") |

Returns: temperature, feels-like, conditions, humidity, wind, daily high/low, precipitation chance, sunrise/sunset.

### get_top_news

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | `"top"` | One of: top, business, technology, science, health, sports, entertainment, politics, world |
| `country` | string | `"us"` | ISO country code |
| `count` | number | `5` | Articles to return (1-10) |

Returns: title, description, source, URL, publish date for each article.

### get_calendar_today

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `timezone` | string | `"America/New_York"` | IANA timezone |

Returns: today's date, day of week, events list, and summary.

## License

MIT

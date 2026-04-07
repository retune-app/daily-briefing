import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { getWeather, formatWeatherResponse } from "./tools/weather.js";
import { getTopNews, formatNewsResponse } from "./tools/news.js";
import { getCalendarToday, formatCalendarResponse } from "./tools/calendar.js";

const PORT = parseInt(process.env.PORT || "3001", 10);
const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY || "";

const server = new McpServer({
  name: "poke-daily-briefing",
  version: "1.0.0",
});

server.tool(
  "get_weather",
  "Get current weather and forecast for a location. Returns temperature, conditions, humidity, wind, daily high/low, precipitation chance, and sunrise/sunset times. Uses Open-Meteo (free, no API key required).",
  {
    location: z.string().describe("City name or location (e.g. 'New York', 'London, UK', 'Tokyo')"),
  },
  async ({ location }) => {
    try {
      const weather = await getWeather(location);
      return {
        content: [{ type: "text" as const, text: formatWeatherResponse(weather) }],
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text" as const, text: `Weather error: ${msg}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_top_news",
  "Get today's top news headlines. Returns title, description, source, URL, and publish date for each article. Uses NewsData.io API.",
  {
    category: z.enum(["top", "business", "technology", "science", "health", "sports", "entertainment", "politics", "world"]).default("top").describe("News category to fetch"),
    country: z.string().default("us").describe("Country code (e.g. 'us', 'gb', 'in')"),
    count: z.number().min(1).max(10).default(5).describe("Number of articles to return (1-10)"),
  },
  async ({ category, country, count }) => {
    if (!NEWSDATA_API_KEY) {
      return {
        content: [{ type: "text" as const, text: "News error: NEWSDATA_API_KEY is not configured. Add it to your environment variables." }],
        isError: true,
      };
    }
    try {
      const news = await getTopNews(NEWSDATA_API_KEY, { category, country, count });
      return {
        content: [{ type: "text" as const, text: formatNewsResponse(news) }],
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text" as const, text: `News error: ${msg}` }],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_calendar_today",
  "Get today's date, day of the week, and calendar events. Currently returns date context — connect a calendar provider in Poke Kitchen for full event integration.",
  {
    timezone: z.string().default("America/New_York").describe("IANA timezone (e.g. 'America/New_York', 'Europe/London')"),
  },
  async ({ timezone }) => {
    try {
      const cal = getCalendarToday(timezone);
      return {
        content: [{ type: "text" as const, text: formatCalendarResponse(cal) }],
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text" as const, text: `Calendar error: ${msg}` }],
        isError: true,
      };
    }
  }
);

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    server: "poke-daily-briefing",
    version: "1.0.0",
    tools: ["get_weather", "get_top_news", "get_calendar_today"],
    uptime: process.uptime(),
  });
});

const transports: Record<string, SSEServerTransport> = {};

app.get("/sse", async (req, res) => {
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;

  res.on("close", () => {
    delete transports[transport.sessionId];
  });

  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (!transport) {
    res.status(400).json({ error: "Unknown session" });
    return;
  }
  await transport.handlePostMessage(req, res);
});

app.listen(PORT, () => {
  console.log(`[poke-daily-briefing] MCP server listening on port ${PORT}`);
  console.log(`[poke-daily-briefing] SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`[poke-daily-briefing] Health check: http://localhost:${PORT}/health`);
  console.log(`[poke-daily-briefing] Tools: get_weather, get_top_news, get_calendar_today`);
  console.log(`[poke-daily-briefing] NewsData API: ${NEWSDATA_API_KEY ? "configured" : "NOT configured"}`);
});

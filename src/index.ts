#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// Config file path
const CONFIG_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE || ".",
  ".openfun",
  "config.json"
);

function getConfig(): { apiUrl: string; token?: string } {
  const defaultUrl = "https://veracious-wildebeest-919.convex.cloud";
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      return { apiUrl: config.apiUrl || defaultUrl, token: config.token };
    }
  } catch {}
  return { apiUrl: defaultUrl };
}

async function convexQuery(
  fnPath: string,
  args: Record<string, unknown> = {}
): Promise<unknown> {
  const config = getConfig();
  const res = await fetch(`${config.apiUrl}/api/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
    },
    body: JSON.stringify({ path: fnPath, args, format: "json" }),
  });
  if (!res.ok) throw new Error(`API error (${res.status}): ${await res.text()}`);
  return res.json();
}

async function convexMutation(
  fnPath: string,
  args: Record<string, unknown> = {}
): Promise<unknown> {
  const config = getConfig();
  const res = await fetch(`${config.apiUrl}/api/mutation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
    },
    body: JSON.stringify({ path: fnPath, args, format: "json" }),
  });
  if (!res.ok) throw new Error(`API error (${res.status}): ${await res.text()}`);
  return res.json();
}

async function convexAction(
  fnPath: string,
  args: Record<string, unknown> = {}
): Promise<unknown> {
  const config = getConfig();
  const res = await fetch(`${config.apiUrl}/api/action`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
    },
    body: JSON.stringify({ path: fnPath, args, format: "json" }),
  });
  if (!res.ok) throw new Error(`API error (${res.status}): ${await res.text()}`);
  return res.json();
}

// Create MCP server
const server = new McpServer({
  name: "openfun",
  version: "0.1.0",
});

// Tool: Get trending content patterns
server.tool(
  "openfun_trends",
  "Find trending viral video patterns in a niche. Returns patterns with virality scores that you can remix into original videos.",
  {
    niche: z.string().describe("Content niche (e.g., fitness, cooking, finance, tech)"),
    count: z.number().min(1).max(20).default(5).describe("Number of trends to return"),
  },
  async ({ niche, count }) => {
    try {
      const result = await convexQuery("cli:listTrends", { niche, count });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool: Remix a trend into branded content
server.tool(
  "openfun_remix",
  "Create an original video script by remixing a trending pattern with custom branding. Returns a remix with hook, body, and CTA text.",
  {
    trendId: z.string().describe("Trend ID from openfun_trends"),
    brand: z.string().describe("Brand or creator name"),
    tone: z.enum(["casual", "professional", "humorous", "motivational", "educational"]).default("casual").describe("Tone of voice"),
    hook: z.string().optional().describe("Custom hook text (auto-generated if omitted)"),
    cta: z.string().optional().describe("Call to action text"),
    niche: z.string().optional().describe("Override niche from trend"),
  },
  async ({ trendId, brand, tone, hook, cta, niche }) => {
    try {
      const result = await convexAction("cli:createRemix", {
        trendId, brand, tone,
        ...(hook ? { hook } : {}),
        ...(cta ? { cta } : {}),
        ...(niche ? { niche } : {}),
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool: Start video render
server.tool(
  "openfun_render",
  "Start rendering a video from a remix. Returns a job ID. Rendering takes 30-90 seconds.",
  {
    remixId: z.string().describe("Remix ID from openfun_remix"),
  },
  async ({ remixId }) => {
    try {
      const result = await convexAction("cli:startRender", { remixId });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool: List videos
server.tool(
  "openfun_videos",
  "List all videos with their status (rendering, ready, failed).",
  {},
  async () => {
    try {
      const result = await convexQuery("cli:listVideos", {});
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Tool: Get account info
server.tool(
  "openfun_account",
  "Get account info including plan, usage, and remaining credits.",
  {},
  async () => {
    try {
      const result = await convexQuery("cli:getAccount", {});
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  }
);

// Resource: OpenFun capabilities
server.resource(
  "openfun://capabilities",
  "openfun://capabilities",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: "text/markdown",
      text: `# OpenFun — AI Video Factory

OpenFun creates original viral short-form videos by reverse-engineering what works.

## What It Does
1. **Trends** — Analyzes viral patterns across TikTok, YouTube, Instagram
2. **Remix** — Creates original scripts using proven viral structures
3. **Render** — Produces full MP4 videos with AI voice, captions, scene visuals
4. **Download** — Ready to post on any platform

## Workflow
1. Use \`openfun_trends\` to find what's working in a niche
2. Use \`openfun_remix\` to create branded content from a trend
3. Use \`openfun_render\` to render the video
4. Use \`openfun_videos\` to check status and get download links

## Plans
- Free: 5 remixes/mo + 3 watermarked videos
- Pro ($19/mo): 50 remixes + 20 videos
- Scale ($49/mo): Unlimited remixes + 100 videos

Website: https://www.openfun.ai
`,
    }],
  })
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);

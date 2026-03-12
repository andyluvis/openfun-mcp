# OpenFun MCP Server

[MCP](https://modelcontextprotocol.io) server for [OpenFun.ai](https://www.openfun.ai) — create viral short-form videos from Claude Desktop.

## What It Does

OpenFun reverse-engineers viral video patterns and creates original content. This MCP server lets Claude Desktop users create videos through conversation:

- **"Find trending fitness content"** → discovers viral patterns
- **"Remix that trend for my brand"** → creates original branded script
- **"Render the video"** → produces MP4 ready to post

## Setup

### 1. Install

```bash
npm install -g openfun-mcp
```

### 2. Add to Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "openfun": {
      "command": "openfun-mcp"
    }
  }
}
```

### 3. Login to OpenFun

```bash
npm install -g openfun-cli
openfun login
```

### 4. Restart Claude Desktop

## Available Tools

| Tool | Description |
|------|-------------|
| `openfun_trends` | Find trending viral video patterns in any niche |
| `openfun_remix` | Create branded content from a trending pattern |
| `openfun_render` | Start video rendering |
| `openfun_videos` | List videos and check render status |
| `openfun_account` | Check plan, usage, and credits |

## Plans

- **Free:** 5 remixes/month + 3 watermarked videos
- **Pro ($19/mo):** 50 remixes + 20 videos + no watermark
- **Scale ($49/mo):** Unlimited remixes + 100 videos + priority render

## Links

- Website: https://www.openfun.ai
- CLI: https://www.npmjs.com/package/openfun-cli
- OpenClaw Skill: `clawhub install openfun`

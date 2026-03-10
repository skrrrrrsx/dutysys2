# 🛡️ Duty Bot — Discord Duty Tracking System

A professional Discord bot for tracking moderator duty sessions, built for Roblox moderation teams.

---

## ✨ Features

- **One-button duty toggle** — Start/end duty with a single button press
- **Auto-logging** — Every session is posted to your log channel with start time, end time, and total duration
- **User database** — Link Discord accounts to Roblox usernames once; no need to type your name every time
- **Concurrent-safe** — Multiple mods can go on duty simultaneously without any issues
- **Stats & leaderboard** — View personal stats and see who's put in the most duty time
- **Persistent storage** — All sessions saved in a local SQLite database; survives bot restarts

---

## 📁 Project Structure

```
duty-bot/
├── index.js              # Bot entry point
├── deploy-commands.js    # Register slash commands with Discord
├── package.json
├── .env.example          # Environment variable template
├── commands/
│   ├── duty.js           # /duty — toggle duty on/off
│   ├── register.js       # /register — link Discord → Roblox (admin only)
│   ├── dutystats.js      # /dutystats — personal or per-user stats
│   └── dutyleaderboard.js# /dutyleaderboard — top mods by duty time
├── events/
│   ├── ready.js          # Bot startup
│   └── interactionCreate.js # Handles commands + button clicks
├── utils/
│   ├── database.js       # SQLite operations
│   └── helpers.js        # Time formatting, embed builders
└── data/
    └── duty.db           # Auto-created on first run
```

---

## 🚀 Setup Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- A Discord bot application ([create one here](https://discord.com/developers/applications))

### 2. Bot Permissions
When inviting your bot, make sure it has these permissions:
- `Send Messages`
- `Embed Links`
- `Read Message History`
- `Use Slash Commands`

Enable the **Server Members Intent** in the Discord Developer Portal under your bot's settings.

### 3. Install dependencies
```bash
npm install
```

### 4. Configure environment variables
```bash
cp .env.example .env
```
Then fill in your `.env` file:

| Variable | Where to find it |
|---|---|
| `BOT_TOKEN` | Discord Developer Portal → Your App → Bot → Token |
| `CLIENT_ID` | Discord Developer Portal → Your App → General Information → Application ID |
| `GUILD_ID` | Right-click your Discord server → Copy Server ID (enable Developer Mode first) |
| `LOG_CHANNEL_ID` | Right-click the log channel → Copy Channel ID |

### 5. Deploy slash commands
```bash
npm run deploy
```
You only need to do this once (or when you add new commands).

### 6. Start the bot
```bash
npm start
```

---

## 📋 Commands

| Command | Who can use | Description |
|---|---|---|
| `/duty` | Everyone registered | Toggle duty on/off with a button |
| `/register @user robloxname` | Admins only | Link a Discord user to their Roblox username |
| `/dutystats [@user]` | Everyone | View duty stats for yourself or another mod |
| `/dutyleaderboard` | Everyone | Show top 10 mods by total duty time |

---

## 📌 How It Works

1. **Admin registers a mod:** `/register @JohnDoe JohnDoe_Roblox`
2. **Mod types `/duty`** → Bot shows their current status + a Start/End button (only visible to them)
3. **Mod clicks the button** → Duty starts/ends
4. **Log channel receives an embed** like:

**On Duty:**
```
🟢 Duty Started
👤 Roblox: JohnDoe_Roblox   🔖 Discord: @JohnDoe   📅 Date: 03.10
🕐 Start: 16:00              🕐 End: —               ⏱️ Duration: —
```

**Off Duty (same session):**
```
🔴 Duty Ended
👤 Roblox: JohnDoe_Roblox   🔖 Discord: @JohnDoe   📅 Date: 03.10
🕐 Start: 16:00              🕐 End: 17:00           ⏱️ Duration: 1h
```

---

## 🔒 Safety & Concurrency

- Buttons are **user-locked** — only the person who ran `/duty` can confirm it
- Database uses **SQLite WAL mode** — safe for multiple simultaneous writes
- **Duplicate session guard** — if somehow two requests arrive at once, only one session starts
- All times stored as **Unix timestamps** — no timezone bugs

---

## 🛠️ Keeping the Bot Online 24/7

Use **PM2** to keep the bot running:
```bash
npm install -g pm2
pm2 start index.js --name duty-bot
pm2 save
pm2 startup
```

Or host it on a VPS (e.g. DigitalOcean, Hetzner) or a service like [Railway](https://railway.app/).

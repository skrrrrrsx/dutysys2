const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'duty.db');

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    discord_id TEXT PRIMARY KEY,
    roblox_username TEXT NOT NULL,
    registered_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS duty_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discord_id TEXT NOT NULL,
    start_time INTEGER NOT NULL,
    end_time INTEGER,
    log_message_id TEXT,
    FOREIGN KEY (discord_id) REFERENCES users(discord_id)
  );
`);

// ─── User operations ────────────────────────────────────────────────────────

function registerUser(discordId, robloxUsername) {
  const stmt = db.prepare(`
    INSERT INTO users (discord_id, roblox_username)
    VALUES (?, ?)
    ON CONFLICT(discord_id) DO UPDATE SET roblox_username = excluded.roblox_username
  `);
  return stmt.run(discordId, robloxUsername);
}

function getUser(discordId) {
  return db.prepare('SELECT * FROM users WHERE discord_id = ?').get(discordId);
}

// ─── Duty operations ─────────────────────────────────────────────────────────

function getActiveDuty(discordId) {
  return db.prepare(`
    SELECT * FROM duty_sessions
    WHERE discord_id = ? AND end_time IS NULL
  `).get(discordId);
}

function startDuty(discordId) {
  const stmt = db.prepare(`
    INSERT INTO duty_sessions (discord_id, start_time)
    VALUES (?, unixepoch())
  `);
  const result = stmt.run(discordId);
  return db.prepare('SELECT * FROM duty_sessions WHERE id = ?').get(result.lastInsertRowid);
}

function endDuty(discordId) {
  const active = getActiveDuty(discordId);
  if (!active) return null;

  db.prepare(`
    UPDATE duty_sessions
    SET end_time = unixepoch()
    WHERE id = ?
  `).run(active.id);

  return db.prepare('SELECT * FROM duty_sessions WHERE id = ?').get(active.id);
}

function saveLogMessageId(sessionId, messageId) {
  db.prepare(`
    UPDATE duty_sessions SET log_message_id = ? WHERE id = ?
  `).run(messageId, sessionId);
}

function getStats(discordId) {
  const totalSessions = db.prepare(`
    SELECT COUNT(*) as count FROM duty_sessions
    WHERE discord_id = ? AND end_time IS NOT NULL
  `).get(discordId);

  const totalSeconds = db.prepare(`
    SELECT COALESCE(SUM(end_time - start_time), 0) as total
    FROM duty_sessions
    WHERE discord_id = ? AND end_time IS NOT NULL
  `).get(discordId);

  const active = getActiveDuty(discordId);

  return {
    sessions: totalSessions.count,
    totalSeconds: totalSeconds.total,
    active: !!active,
  };
}

function getLeaderboard(limit = 10) {
  return db.prepare(`
    SELECT u.discord_id, u.roblox_username,
           COUNT(s.id) as sessions,
           COALESCE(SUM(s.end_time - s.start_time), 0) as total_seconds
    FROM users u
    LEFT JOIN duty_sessions s ON s.discord_id = u.discord_id AND s.end_time IS NOT NULL
    GROUP BY u.discord_id
    ORDER BY total_seconds DESC
    LIMIT ?
  `).all(limit);
}

module.exports = {
  registerUser,
  getUser,
  getActiveDuty,
  startDuty,
  endDuty,
  saveLogMessageId,
  getStats,
  getLeaderboard,
};

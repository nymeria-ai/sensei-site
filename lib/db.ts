import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "sensei-marketplace.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  // Ensure data directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      email TEXT,
      name TEXT,
      avatar_url TEXT,
      github_username TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(provider, provider_id)
    );

    CREATE TABLE IF NOT EXISTS suites (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      yaml_content TEXT NOT NULL,
      version TEXT DEFAULT '1.0.0',
      publisher_id TEXT REFERENCES users(id),
      repo_url TEXT,
      image_url TEXT,
      download_count INTEGER DEFAULT 0,
      avg_rating REAL DEFAULT 0,
      rating_count INTEGER DEFAULT 0,
      belt_rank TEXT DEFAULT 'white',
      tags TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id TEXT PRIMARY KEY,
      suite_id TEXT REFERENCES suites(id),
      user_id TEXT REFERENCES users(id),
      score INTEGER CHECK (score >= 1 AND score <= 10),
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(suite_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS downloads (
      id TEXT PRIMARY KEY,
      suite_id TEXT REFERENCES suites(id),
      user_id TEXT,
      method TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  return _db;
}

// Helper: upsert user on login
export function upsertUser(user: {
  provider: string;
  provider_id: string;
  email?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  github_username?: string | null;
}): { id: string } {
  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM users WHERE provider = ? AND provider_id = ?")
    .get(user.provider, user.provider_id) as { id: string } | undefined;

  if (existing) {
    db.prepare(
      "UPDATE users SET email = ?, name = ?, avatar_url = ?, github_username = ? WHERE id = ?"
    ).run(user.email ?? null, user.name ?? null, user.avatar_url ?? null, user.github_username ?? null, existing.id);
    return { id: existing.id };
  }

  const id = crypto.randomUUID();
  db.prepare(
    "INSERT INTO users (id, provider, provider_id, email, name, avatar_url, github_username) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(id, user.provider, user.provider_id, user.email ?? null, user.name ?? null, user.avatar_url ?? null, user.github_username ?? null);
  return { id };
}

// Helper: recalculate suite rating stats
export function recalculateSuiteRating(suiteId: string) {
  const db = getDb();
  const stats = db
    .prepare("SELECT AVG(score) as avg_rating, COUNT(*) as rating_count FROM ratings WHERE suite_id = ?")
    .get(suiteId) as { avg_rating: number | null; rating_count: number };

  const avgRating = stats.avg_rating ?? 0;
  const { getBeltRank } = require("./belt-ranks");
  const belt = getBeltRank(avgRating);
  const beltKey = belt.name.split(" ")[0].toLowerCase();

  db.prepare(
    "UPDATE suites SET avg_rating = ?, rating_count = ?, belt_rank = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(Math.round(avgRating * 10) / 10, stats.rating_count, beltKey, suiteId);
}

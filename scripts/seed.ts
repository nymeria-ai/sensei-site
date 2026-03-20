/**
 * Seed script: populates the marketplace DB with the 6 built-in suites and fake ratings.
 * Run with: npx tsx scripts/seed.ts
 */
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { getBeltRank } from "../lib/belt-ranks";

const DB_PATH = path.join(process.cwd(), "data", "sensei-marketplace.db");

// Ensure data directory
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
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

// Seed suites
const suiteDefs = [
  {
    file: "sdr-qualification.yaml",
    slug: "sdr-qualification",
    category: "sales",
    image: "/images/gi-execution.png",
    tags: ["sales", "sdr", "outreach", "email"],
    fakeRatings: [8, 9, 7, 8, 9, 8, 7, 9, 8, 8, 7, 9, 8, 9, 7],
    downloads: 342,
  },
  {
    file: "customer-support.yaml",
    slug: "customer-support",
    category: "support",
    image: "/images/gi-reasoning.png",
    tags: ["support", "customer-service", "tickets"],
    fakeRatings: [9, 8, 9, 8, 9, 7, 8, 9, 9, 8, 9, 8, 7, 9, 8, 9, 8],
    downloads: 521,
  },
  {
    file: "content-writer.yaml",
    slug: "content-writer",
    category: "content",
    image: "/images/gi-improvement.png",
    tags: ["content", "writing", "blog", "social-media"],
    fakeRatings: [7, 8, 7, 8, 7, 8, 9, 7, 8, 7, 6, 8, 7],
    downloads: 278,
  },
  {
    file: "bartender.yaml",
    slug: "bartender",
    category: "fun",
    image: "/images/gi-reasoning.png",
    tags: ["fun", "bartender", "cocktails", "roleplay"],
    fakeRatings: [9, 10, 8, 9, 10, 9, 8, 9, 10, 9, 8],
    downloads: 189,
  },
  {
    file: "dungeon-master.yaml",
    slug: "dungeon-master",
    category: "fun",
    image: "/images/gi-execution.png",
    tags: ["fun", "dnd", "rpg", "dungeon-master"],
    fakeRatings: [8, 7, 9, 8, 7, 8, 9, 7, 8, 9, 8, 7],
    downloads: 156,
  },
  {
    file: "cat-interview.yaml",
    slug: "cat-interview",
    category: "fun",
    image: "/images/gi-improvement.png",
    tags: ["fun", "interview", "cat", "roleplay"],
    fakeRatings: [10, 9, 10, 9, 10, 9, 8, 10, 9, 10],
    downloads: 412,
  },
];

// Create fake users for ratings
const fakeUsers: string[] = [];
for (let i = 0; i < 20; i++) {
  const id = crypto.randomUUID();
  db.prepare(
    "INSERT OR IGNORE INTO users (id, provider, provider_id, email, name, avatar_url) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, "github", `fake-${i}`, `user${i}@example.com`, `TestUser${i}`, null);
  fakeUsers.push(id);
}

const insertSuite = db.prepare(
  `INSERT OR REPLACE INTO suites (id, slug, name, description, category, yaml_content, version, publisher_id, image_url, download_count, avg_rating, rating_count, belt_rank, tags)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

const insertRating = db.prepare(
  "INSERT OR IGNORE INTO ratings (id, suite_id, user_id, score) VALUES (?, ?, ?, ?)"
);

for (const def of suiteDefs) {
  const yamlPath = path.join(process.cwd(), "data", "suites", def.file);
  const yamlContent = fs.readFileSync(yamlPath, "utf-8");

  // Parse name and description from YAML (simple extraction)
  const nameMatch = yamlContent.match(/^name:\s*"?(.+?)"?\s*$/m);
  const descMatch = yamlContent.match(/^description:\s*>?\s*\n\s+(.+)/m);

  const name = nameMatch ? nameMatch[1] : def.slug;
  const description = descMatch ? descMatch[1].trim() : "";

  const suiteId = crypto.randomUUID();

  // Calculate avg rating
  const avgRating = def.fakeRatings.reduce((a, b) => a + b, 0) / def.fakeRatings.length;
  const roundedAvg = Math.round(avgRating * 10) / 10;
  const belt = getBeltRank(roundedAvg);
  const beltKey = belt.name.split(" ")[0].toLowerCase();

  insertSuite.run(
    suiteId,
    def.slug,
    name,
    description,
    def.category,
    yamlContent,
    "1.0.0",
    null,
    def.image,
    def.downloads,
    roundedAvg,
    def.fakeRatings.length,
    beltKey,
    JSON.stringify(def.tags)
  );

  // Insert fake ratings
  for (let i = 0; i < def.fakeRatings.length; i++) {
    insertRating.run(crypto.randomUUID(), suiteId, fakeUsers[i % fakeUsers.length], def.fakeRatings[i]);
  }

  console.log(`  Seeded: ${name} (${def.slug}) — ${roundedAvg}/10 ${belt.emoji} ${belt.name}`);
}

console.log("\nDone! Seeded 6 suites with ratings.");
db.close();

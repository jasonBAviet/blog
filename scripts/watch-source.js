#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const SOURCE_DIR = path.join(process.cwd(), "Source");
const API_URL = "http://localhost:3001/api/revalidate";

// Simple file watcher
console.log(`👀 Watching ${SOURCE_DIR} for changes...`);
console.log(`📡 Will call ${API_URL} on file changes\n`);

fs.watch(SOURCE_DIR, (eventType, filename) => {
  if (!filename) return;

  // Only watch .md files
  if (!filename.endsWith(".md")) return;

  console.log(`📝 ${filename} ${eventType === "change" ? "changed" : "created"}`);

  // Debounce: wait 500ms before calling API
  setTimeout(() => {
    fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" } })
      .then((res) => {
        if (res.ok) {
          console.log(`✅ Revalidated - ${new Date().toLocaleTimeString()}\n`);
        } else {
          console.error(`❌ Revalidate failed: ${res.status}\n`);
        }
      })
      .catch((err) => {
        console.error(`❌ Error: ${err.message}`);
        console.error(`   Make sure dev server is running at ${API_URL}\n`);
      });
  }, 500);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Watcher stopped");
  process.exit(0);
});

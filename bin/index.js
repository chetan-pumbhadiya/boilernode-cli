#!/usr/bin/env node
/** @format */

"use strict";

const { run } = require("../src/cli");

run().catch((err) => {
  console.error("\n❌ Fatal error:", err.message || err);
  process.exit(1);
});

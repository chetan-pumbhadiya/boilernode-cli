/** @format */

"use strict";

function gitignoreTemplate() {
  return `# Dependencies
node_modules/

# Build output
dist/
build/

# Environment files
.env
.env.local
.env.production

# Logs
logs/
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/

# Drizzle migrations
drizzle/

# Prisma generated
prisma/migrations/
`;
}

module.exports = { gitignoreTemplate };

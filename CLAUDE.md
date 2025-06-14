# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hono-based web application with TypeScript. Hono is a lightweight, ultrafast web framework for the edge.

## Essential Commands

```bash
# Install dependencies
npm install

# Development (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Code Architecture

- **Framework**: Hono with Node.js server adapter (@hono/node-server)
- **Entry Point**: `src/index.ts` - Main server file that starts on port 3000
- **Build Output**: `./dist` directory (TypeScript compiles here)
- **Code Style**: Biome for linting and formatting (uses tabs, double quotes)

## TypeScript Configuration

- Target: ESNext with NodeNext module system
- Strict mode enabled
- JSX configured for Hono's JSX runtime
- Source maps enabled for debugging

## Development Workflow

1. Make changes in `src/` directory
2. Use `npm run dev` for development with automatic restart
3. Biome handles formatting and linting automatically
4. Build with `npm run build` before deploying

## Important Notes

- No testing framework is currently set up
- This appears to be a starter template for a RealWorld application
- The codebase is minimal - just a basic Hono server setup ready for expansion
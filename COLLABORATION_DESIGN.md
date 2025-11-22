# Collaborative Code Session Design

## Overview

This document outlines the design for a collaborative code editing interface with a file browser, similar to VS Code in the browser. The system integrates with the existing AI coding worker infrastructure.

## Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ File Browser │  │Code Editor   │  │  AI Chat Panel   │  │
│  │  Component   │  │(Monaco/CM)   │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────┬───────────────┬───────────────────┬────────────┘
             │               │                   │
             │ WebSocket/SSE │                   │
             │               │                   │
┌────────────▼───────────────▼───────────────────▼────────────┐
│                    Backend API Server                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Session Management  │  File Operations  │  Chat     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                  AI Coding Worker (Docker Swarm)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Worker 1    │  │  Worker 2    │  │  Worker N    │     │
│  │  (MinIO)     │  │  (MinIO)     │  │  (MinIO)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────┬────────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────────┐
│                    MinIO Session Storage                     │
│   sessions/{sessionId}/session.tar.gz                        │
│     ├── workspace/                                           │
│     │   ├── src/                                            │
│     │   ├── package.json                                    │
│     │   └── ...                                             │
│     ├── .claude/                                            │
│     └── .stream-events.jsonl                                │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1: File Browser & Viewing (MVP)

### 1.1 New API Endpoints (AI Coding Worker)

Add file system browsing capabilities to the ai-coding-worker:

#### GET /sessions/:sessionId/files
**Purpose:** List files and directories in the session workspace

**Request:**
```
GET /sessions/{sessionId}/files?path=/src
```

**Response:**
```json
{
  "sessionId": "9de73868...",
  "path": "/src",
  "entries": [
    {
      "name": "index.ts",
      "type": "file",
      "size": 1234,
      "modified": "2025-11-22T10:00:00Z"
    },
    {
      "name": "components",
      "type": "directory",
      "modified": "2025-11-22T09:00:00Z"
    }
  ]
}
```

**Implementation:**
- Download session from MinIO if not locally cached
- Use `fs.readdir()` with `withFileTypes` to list directory contents
- Return structured file tree data

#### GET /sessions/:sessionId/files/:path(*)
**Purpose:** Get file content

**Request:**
```
GET /sessions/{sessionId}/files/src/index.ts
```

**Response:**
```json
{
  "sessionId": "9de73868...",
  "path": "/src/index.ts",
  "content": "import React from 'react';\n...",
  "encoding": "utf-8",
  "size": 1234,
  "modified": "2025-11-22T10:00:00Z"
}
```

**Implementation:**
- Read file from session workspace
- Return content as string
- Support binary files with base64 encoding

### 1.2 Frontend Components

#### File Browser Component
**Location:** `apps/client/src/components/FileBrowser.tsx`

**Features:**
- Tree view of files and directories
- Expandable folders
- File icons based on type (using react-icons or similar)
- Click to open file in editor
- Refresh button to reload file tree

**State:**
```typescript
interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: string;
  children?: FileNode[];
  expanded?: boolean;
}
```

#### Code Viewer Component
**Location:** `apps/client/src/components/CodeViewer.tsx`

**Features:**
- Syntax highlighting (using react-syntax-highlighter or Monaco)
- Read-only view for MVP
- Line numbers
- File tabs for multiple open files

#### Code Session Page
**Location:** `apps/client/src/pages/CodeSession.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Repository: MyProject    Branch: main              │
├──────────────┬──────────────────────────────────────┤
│              │                                       │
│  EXPLORER    │   Editor                             │
│              │                                       │
│  📁 src      │   import React from 'react';          │
│    📄 App.js │   ...                                 │
│    📁 comp.  │                                       │
│  📄 pack.json│                                       │
│              │                                       │
│              │                                       │
└──────────────┴──────────────────────────────────────┘
```

## Phase 2: File Editing (Future)

### 2.1 Additional Endpoints

#### PUT /sessions/:sessionId/files/:path(*)
**Purpose:** Update file content

**Request:**
```json
{
  "content": "updated file content",
  "encoding": "utf-8"
}
```

**Response:**
```json
{
  "success": true,
  "modified": "2025-11-22T11:00:00Z"
}
```

**Implementation:**
- Write file to session workspace
- Auto-upload to MinIO (or batch upload)

#### POST /sessions/:sessionId/files
**Purpose:** Create new file

#### DELETE /sessions/:sessionId/files/:path(*)
**Purpose:** Delete file

### 2.2 Code Editor Integration

Use **Monaco Editor** (VS Code's editor):
- Full editing capabilities
- IntelliSense
- Multi-cursor support
- Keyboard shortcuts

## Phase 3: Real-time Collaboration (Future)

### 3.1 CRDT Implementation

**Library:** Yjs (https://github.com/yjs/yjs)
- Conflict-free collaborative editing
- Works offline
- Supports undo/redo
- Provider: WebSocket or WebRTC

### 3.2 Collaboration Endpoint

#### WS /sessions/:sessionId/collaborate
**Purpose:** WebSocket for real-time file updates

**Events:**
```typescript
// Client → Server
{
  "type": "edit",
  "path": "/src/index.ts",
  "changes": [...], // Yjs update
  "clientId": "user-123"
}

// Server → Clients
{
  "type": "edit",
  "path": "/src/index.ts",
  "changes": [...],
  "clientId": "user-456"
}

// Presence updates
{
  "type": "presence",
  "users": [
    { "id": "user-123", "name": "Alice", "cursor": {...} },
    { "id": "user-456", "name": "Bob", "cursor": {...} }
  ]
}
```

### 3.3 Conflict Resolution

**Strategy:**
- Use Yjs for CRDT-based conflict resolution
- Each client maintains local Yjs document
- Broadcast updates via WebSocket
- Server acts as relay and persistence layer
- Periodically save merged state to MinIO

## Implementation Plan

### Milestone 1: File Browser (Current)
- [ ] Add file listing endpoint to ai-coding-worker
- [ ] Add file reading endpoint to ai-coding-worker
- [ ] Create FileBrowser component
- [ ] Create CodeViewer component (read-only)
- [ ] Create CodeSession page
- [ ] Wire up API calls

### Milestone 2: File Editing
- [ ] Add file writing endpoint
- [ ] Add file creation/deletion endpoints
- [ ] Integrate Monaco Editor
- [ ] Add save functionality
- [ ] Add create/delete file UI

### Milestone 3: Collaboration
- [ ] Add WebSocket support to backend
- [ ] Integrate Yjs for CRDT
- [ ] Add presence indicators
- [ ] Add collaborative cursors
- [ ] Add user list

## Technical Decisions

### Why Monaco Editor?
- Same editor as VS Code
- Full TypeScript support
- Rich extension ecosystem
- Well-maintained by Microsoft

### Why Yjs for CRDT?
- Mature and battle-tested
- Excellent performance
- Works offline
- Provider-agnostic (WebSocket, WebRTC, etc.)

### File Storage Strategy
- **Read:** Download from MinIO → Cache in worker → Serve to client
- **Write:** Client → Worker → Update local → Batch upload to MinIO
- **Sync:** Upload session to MinIO on completion or periodically

## Security Considerations

1. **Authentication:** All endpoints require valid session ownership
2. **Path Traversal:** Validate file paths to prevent `../` attacks
3. **File Size Limits:** Enforce max file size for uploads
4. **Rate Limiting:** Prevent abuse of file operations
5. **Sandboxing:** Workers run in isolated Docker containers

## Performance Optimizations

1. **Lazy Loading:** Only load directory contents when expanded
2. **Caching:** Cache file tree on client
3. **Debouncing:** Debounce file saves
4. **Batch Uploads:** Batch multiple file changes
5. **Worker Affinity:** Route requests to same worker for session stickiness

## Future Enhancements

1. **Search:** Full-text search across files
2. **Git Integration:** Show git status, diff, commit
3. **Terminal:** Integrated terminal
4. **Extensions:** Plugin system like VS Code
5. **Themes:** Customizable color themes
6. **Snippets:** Code snippet support
7. **Multi-file Refactoring:** Rename symbols across files

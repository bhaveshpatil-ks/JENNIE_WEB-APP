# Jennie Music App - Feedback & Complaint System

## Overview
The Feedback & Complaint System enables listeners to report bugs, playback issues, content errors, account problems, and abuse directly from within the Jennie Web App. It provides end-to-end triaging, priority classification, rate limiting, and an admin resolver dashboard.

## Entry Points
1. **Persistent Player Bar**: Quick report button directly from the bottom player bar.
2. **Fullscreen Player**: One-tap "Report an issue" action in the track options menu, pre-populating song ID, title, and artist context.
3. **Sidebar Navigation**: Direct access under the "Help & Feedback" section.
4. **Top Header**: User profile menu dropdown link.
5. **Settings Page**: Dedicated "Help & Feedback" card.

## Categories & Automated Priority Matrix
| Category | Priority | Automated SLA | Handling Policy |
| :--- | :--- | :--- | :--- |
| **Abuse / Harassment / Safety** | `high` | Immediate / < 12h | Human-safety flag enabled, top priority queue |
| **Bugs / App Broken** | `high` | < 24h | Device & platform telemetry collected |
| **Billing / Premium Account** | `high` | < 24h | Financial/entitlement resolution |
| **Playback & Streaming Issues** | `medium` | < 48h | Song ID, audio buffer, CDN state recorded |
| **Wrong Song Metadata / Lyrics** | `low` | < 72h | Catalog correction queue |
| **Feature Request / Suggestions** | `low` | Backlog | Product roadmap consideration |

## Rate Limiting & Abuse Prevention
- Submissions are throttled to a maximum of **5 tickets per hour** per device/user.
- Attempts exceeding this quota return a client-side warning timer with friendly cooldown messaging.
- Duplicate payload throttling prevents rapid multi-click double submissions.

## Data Schema & Storage Architecture
Submissions are stored in Cloud Firestore under the `feedbacks` collection, with graceful offline fallback to `localStorage`:
```typescript
interface FeedbackTicket {
  referenceId: string;       // e.g. "REF-AB12CD34"
  category: string;          // Feedback category identifier
  description: string;       // User's issue description
  userEmail: string;         // Contact email
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'investigating' | 'resolved' | 'closed';
  createdAt: string;         // ISO timestamp
  context?: {
    songId?: string;
    songTitle?: string;
    artist?: string;
    userAgent?: string;
    screenResolution?: string;
  };
  screenshotUrl?: string;    // Base64 or Cloud Storage URL (< 5MB)
}
```

## Admin Resolver Dashboard
Accessible at `/feedback?tab=admin` or by entering the master administrative key `jennie2026`.
Administrators can:
- Filter by status (`new`, `investigating`, `resolved`).
- Filter by priority (`high`, `medium`, `low`).
- Update ticket status in real-time.
- Review client-side hardware/software context and playback state.

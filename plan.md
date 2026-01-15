# Collab Mode Implementation Plan

## Overview

Add collaboration features allowing users to create shared groups where multiple parties can manage budgets and expenses together with role-based permissions.

---

## Decisions Summary

| Choice | Selected |
|--------|----------|
| Collaboration Model | Shared Groups |
| Permissions | Role-Based (Admin, Editor, Viewer) |
| Budgets | Shared per group |
| Invitations | Email invite with in-app notification |
| Personal Expenses | Keep separate (hybrid mode) |
| Scope | MVP first (Phases 1-3) |

---

## Firestore Data Structure

```
/users/{uid}
  ├── email: string
  ├── displayName: string
  ├── groups: string[]                # Array of groupIds for quick lookup
  └── createdAt: Timestamp

/groups/{groupId}
  ├── name: string                    # e.g., "Family Budget", "Roommates"
  ├── owner: string                   # uid of creator (Admin by default)
  ├── members: Map<uid, role>         # { "uid123": "admin", "uid456": "editor" }
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp

/groups/{groupId}/budgets/{budgetId}
  ├── category: string                # e.g., "Food", "Rent"
  ├── limit: number                   # Monthly limit in USD
  ├── period: string                  # "monthly" | "weekly"
  ├── createdBy: string               # uid
  └── createdAt: Timestamp

/groups/{groupId}/expenses/{expenseId}
  ├── date: string                    # YYYY-MM-DD
  ├── amount: number
  ├── category: string
  ├── note: string
  ├── addedBy: string                 # uid of person who added
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp

/invites/{inviteId}
  ├── groupId: string
  ├── groupName: string
  ├── email: string                   # Invitee email (lowercase)
  ├── role: string                    # "editor" | "viewer"
  ├── invitedBy: string               # uid
  ├── status: string                  # "pending" | "accepted" | "declined"
  ├── createdAt: Timestamp
  └── expiresAt: Timestamp
```

---

## Role-Based Permissions

| Role | View | Add Expense | Edit Own | Edit Others | Delete | Manage Budget | Invite | Delete Group |
|------|------|-------------|----------|-------------|--------|---------------|--------|--------------|
| Admin | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Editor | Yes | Yes | Yes | No | Own only | No | No | No |
| Viewer | Yes | No | No | No | No | No | No | No |

---

## MVP Implementation (Phases 1-3)

### Phase 1: Foundation

| Task | Description | Files |
|------|-------------|-------|
| 1.1 | Create user profile on signup/login | `src/lib/users.js` (new), `src/lib/auth.js` |
| 1.2 | Add Firestore security rules | `firestore.rules` |
| 1.3 | Create groups lib module | `src/lib/groups.js` (new) |

### Phase 2: Group Management

| Task | Description | Files |
|------|-------------|-------|
| 2.1 | Create group creation modal/form | `src/components/CreateGroup.jsx` (new) |
| 2.2 | Build group selector dropdown | `src/components/GroupSelector.jsx` (new) |
| 2.3 | Update Dashboard to show group context | `src/pages/Dashboard.jsx` |
| 2.4 | Add group expense CRUD operations | `src/lib/expenses.remote.js` |
| 2.5 | Show expense attribution (who added) | `src/pages/Dashboard.jsx` |

### Phase 3: Budgets

| Task | Description | Files |
|------|-------------|-------|
| 3.1 | Create budgets lib module | `src/lib/budgets.js` (new) |
| 3.2 | Build budget management UI | `src/components/BudgetManager.jsx` (new) |
| 3.3 | Show budget progress bars | `src/components/BudgetProgress.jsx` (new) |
| 3.4 | Add over-budget warnings | `src/pages/Dashboard.jsx` |

---

## Post-MVP (Future Phases)

### Phase 4: Invitations

| Task | Description |
|------|-------------|
| 4.1 | Create invites lib module | `src/lib/invites.js` |
| 4.2 | Build invite members UI | `src/components/InviteMembers.jsx` |
| 4.3 | Show pending invites banner | `src/components/PendingInvites.jsx` |
| 4.4 | Implement accept/decline flow | `src/pages/AcceptInvite.jsx` |

### Phase 5: Polish

| Task | Description |
|------|-------------|
| 5.1 | Real-time member activity indicators |
| 5.2 | Group settings page (rename, manage members) |
| 5.3 | Role management UI |
| 5.4 | Audit trail / activity log |

---

## New Files Summary

```
src/
├── lib/
│   ├── users.js          # User profile CRUD
│   ├── groups.js         # Group CRUD + membership
│   └── budgets.js        # Budget CRUD
├── components/
│   ├── GroupSelector.jsx # Dropdown to switch context
│   ├── CreateGroup.jsx   # Group creation form
│   ├── BudgetManager.jsx # Set budget limits
│   └── BudgetProgress.jsx # Visual budget bars
└── pages/
    └── Dashboard.jsx     # Updated with group context
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Dashboard                            │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │ GroupSelector   │  │  Personal  │  Shared Group       │  │
│  └─────────────────┘  └──────────────────────────────────┘  │
│                              │                               │
│        ┌─────────────────────┴───────────────────────┐      │
│        ▼                                             ▼      │
│  ┌──────────────┐                          ┌──────────────┐ │
│  │ Personal     │                          │ Group        │ │
│  │ Expenses     │                          │ Expenses     │ │
│  │ /users/{uid} │                          │ /groups/{id} │ │
│  │ /expenses    │                          │ /expenses    │ │
│  └──────────────┘                          └──────────────┘ │
│                                                    │        │
│                                            ┌───────▼──────┐ │
│                                            │ Budgets      │ │
│                                            │ Progress     │ │
│                                            └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Estimated Effort

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Phase 1: Foundation | 3 | 2-3 hours |
| Phase 2: Group Management | 5 | 4-5 hours |
| Phase 3: Budgets | 4 | 3-4 hours |
| **Total MVP** | **12** | **9-12 hours** |

---

## Progress Tracker

- [ ] Phase 1: Foundation
  - [ ] 1.1 User profiles
  - [ ] 1.2 Firestore rules
  - [ ] 1.3 Groups lib module
- [ ] Phase 2: Group Management
  - [ ] 2.1 Create group form
  - [ ] 2.2 Group selector
  - [ ] 2.3 Dashboard group context
  - [ ] 2.4 Group expense CRUD
  - [ ] 2.5 Expense attribution
- [ ] Phase 3: Budgets
  - [ ] 3.1 Budgets lib module
  - [ ] 3.2 Budget management UI
  - [ ] 3.3 Budget progress bars
  - [ ] 3.4 Over-budget warnings

---

## Notes

- Personal expenses remain in `/users/{uid}/expenses/` (existing behavior preserved)
- Group expenses stored in `/groups/{groupId}/expenses/`
- User must be authenticated and email verified to access groups
- Group owner is automatically assigned Admin role
- Invites are matched by email (lowercase) when recipient logs in

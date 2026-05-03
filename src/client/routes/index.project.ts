/**
 * Project-Specific Routes
 *
 * Add your project-specific routes here.
 * This file is NOT synced from template - it's owned by your project.
 *
 * Route formats:
 *   '/path': Component                              // Requires auth (default)
 *   '/path': { component: Component, public: true } // Public route
 *   '/admin/path': Component                        // Admin only (automatic)
 *
 * REMINDER: When adding a new route, consider if it should be added to:
 *   - navItems (bottom nav bar) in src/client/components/NavLinks.tsx
 *   - menuItems (hamburger menu) in src/client/components/NavLinks.tsx
 */

import { Routes } from '../features/template/router';
import { Home as Welcome } from './project/Home';
import { AIChat } from './project/AIChat';
import { Todos } from './project/Todos';
import { SingleTodo } from './project/SingleTodo';
import { Dashboard } from './project/Dashboard';
import { Debug } from './project/Debug';
import { Home } from './project/HomeFeed';
import { Lists, AddListRoute, EditListRoute } from './project/Lists';
import {
  ListView,
  AddItemView,
  ItemDetailView,
  EditItemView,
} from './project/listDispatcher';

/**
 * Project route definitions.
 * These are merged with template routes in index.ts.
 */
export const projectRoutes: Routes = {
  // Home (all lists feed)
  '/': Home,

  // Lists management + per-list flows
  '/lists': Lists,
  '/lists/new': AddListRoute,
  '/lists/:listId': ListView,
  '/lists/:listId/edit': EditListRoute,
  '/lists/:listId/items/new': AddItemView,
  '/lists/:listId/items/:itemId': ItemDetailView,
  '/lists/:listId/items/:itemId/edit': EditItemView,

  // Template demo routes (kept for reference)
  '/welcome': Welcome,
  '/ai-chat': AIChat,
  '/todos': Todos,
  '/todos/:todoId': SingleTodo,

  // Admin routes
  '/admin/dashboard': Dashboard,
  '/admin/debug': Debug,

  // Add more project-specific routes here:
  // '/my-page': MyPage,
  // '/share/:id': { component: SharePage, public: true },
};

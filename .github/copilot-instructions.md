# Copilot Instructions for Kuji Client

## Project Overview
This is a **Vue 3 + TypeScript + Vite** frontend application for an "Ichiban Kuji" (一番賞) lottery/blind box platform. Users can browse lottery products, draw prizes, manage their prize box, and handle transactions. The app uses a Japanese-themed gacha/lottery mechanic with visual card reveals and scratch card animations.

## Tech Stack
- **Vue 3** with Composition API (`<script setup>`)
- **TypeScript** (strict mode disabled)
- **Vite** build tool with path alias `@` → `src/`
- **Vue Router** with nested routes and auth guards
- **Pinia** for state management (composition API style)
- **Axios** with interceptors for API calls
- **GSAP** for animations (registered plugin: Draggable)
- **FontAwesome** icons (solid, regular, brands)
- **SCSS** with modern-compiler API
- **Swiper** for carousels
- **vee-validate + yup/zod** for form validation

## Architecture Patterns

### API Layer (`src/services/`)
All API calls follow this pattern:
```typescript
export const functionName = async (id: string, req?: RequestData): Promise<ApiResponse<T>> => {
  try {
    const res = await api.get(`${basePath}/${id}`, { params: req });
    return res.data; // Already typed as ApiResponse<T>
  } catch (e) {
    console.error('ServiceName - functionName error:', e);
    throw e;
  }
};
```

**Key Services:**
- `FrontAPI.ts` - Axios instance with auto token refresh on 401
- `lotteryDrawService.ts` - Draw mechanics (random/designated draws)
- `AuthService.ts` - Token helpers (getAuthToken, getRefreshToken)
- Service files are named `*Service.ts` (camelCase)

### Global API Response Type
```typescript
interface ApiResponse<T> {
  code: string;
  message: string;
  success: boolean;
  data: T;
}
```
Defined in `src/vite-env.d.ts` - available globally without import.

### State Management (`src/stores/`)
- Uses Pinia with **composition API** style: `defineStore('name', () => { ... })`
- `useAuthStore.ts` - Auth state with localStorage persistence (keys: `kujiToken`, `refreshKujiToken`, `kujiUser`)
- `overlay.ts` - Global overlay/modal control
- No `pinia-plugin-persistedstate` used; manual localStorage via `utils/Localstorage.ts`

### Dialog System (`src/utils/dialog/`)
Custom programmatic dialog pattern using `createDialog()`:
```typescript
// Usage in code
await ichibanInfoDialog({ title: '成功', content: '操作完成' });
await confirmDialog({ title: '確認', content: '要繼續嗎？' });
```
- `createDialog.ts` - Core: creates temporary Vue app, mounts to body, returns `{ close }`
- Dialog components in `src/components/common/*Dialog.vue`
- Common dialogs: `ichibanInfoDialog`, `ichibanConfirmDialog`, `gotchaDialog`, `scratchCardDialog`

### API Execution Wrapper (`src/utils/executeApiUtils.ts`)
Standard pattern for API calls with loading/error handling:
```typescript
await executeApi({
  fn: () => someService.call(),
  successTitle: '成功',
  onSuccess: (data) => { /* handle */ },
  showSuccessDialog: true,
  showCatchDialog: true, // Shows error dialog on exception
});
```
- Automatically wraps with loading spinner (`withLoading`)
- Normalizes responses to `ApiResponse<T>` format
- Uses `useOverlayStore` + dialog system for user feedback

### Component Patterns
- **SFCs** use `<script setup lang="ts">` exclusively
- Props: `defineProps<{ prop: Type }>()` or `withDefaults(defineProps<{...}>(), { defaults })`
- Emits: `defineEmits<{ (e: 'eventName', payload: Type): void }>()`
- No Options API usage found in codebase
- Common components in `src/components/common/` (KujiButton, MCard, MSelect, etc.)
- Feature components in `src/components/ichiban/`, `src/components/front/`

### Routing (`src/router/index.ts`)
- Base path: `/kuji/` (configured in `vite.config.ts`)
- Main layout: `FrontLayout.vue` (Header → content → Footer)
- Auth-protected routes use `meta: { requiresAuth: true }`
- Nested member routes under `/member-center`:
  - `profile` - 會員資料
  - `profile/edit` - 編輯個人資料
  - `deposit` - 儲值
  - `deposit-history` - 儲值紀錄
  - `transaction-history` - 消費紀錄
  - `prize-box` - 賞品盒
  - `address-book` - 收件地址管理
  - `orders` - 訂單列表
  - `notifications` - 通知訊息
- Auth routes: `login`, `register`, `forgot-password`, `reset-password`
- 404 handling via `NotFound.vue`

## Environment & Build

### Environment Files
- `.env`, `.env.dev`, `.env.uat`, `.env.production` define environment variables
- Key variables:
  - `VITE_BASE_API_URL` - API base URL (e.g., `http://18.179.187.129`)
  - `VITE_GOOGLE_CLIENT_ID` - Google OAuth Client ID (optional)
- Access via `import.meta.env.VITE_*`

### Development Commands
```bash
npm run dev          # Default dev mode
npm run dev:local    # --mode dev
npm run dev:uat      # --mode uat
npm run dev:prod     # --mode production
```

### Build Commands
```bash
npm run build        # Default production build
npm run build:dev    # Build for dev environment
npm run build:uat    # Build for UAT environment
npm run build:prod   # Build for production environment
```
All builds run `vue-tsc` first for type checking.

## Styling Conventions

### SCSS Architecture (`src/assets/styles/main.scss`)
- **Modern SCSS**: Uses `@use` (not `@import`)
- Token system: `@use 'base/tokens' as tokens`
- Shared utilities: `shared/mixins`, `shared/utilities`, `shared/flex`
- Component styles: `components/ichiban/*`, `components/m-card`, etc.
- Page styles: `pages/login`, `pages/register`, etc.
- Global rem base: `html { font-size: 62.5% }` (1rem = 10px)

### Component Styling
- Scoped styles: `<style scoped lang="scss">`
- BEM naming common: `.ichibanDetail__hero`, `.ichibanDetail__title`
- Theme: Orange/warm color scheme for lottery/gacha aesthetic

## Critical Workflows

### Authentication Flow
1. User logs in → backend returns `{ accessToken, refreshToken, user }`
2. `useAuthStore.setAuth(response)` saves to localStorage
3. `FrontAPI.ts` interceptor adds `Authorization: Bearer {token}` to all requests
4. On 401 → auto-refresh token via `/auth/refresh`
5. If refresh fails → clear state + redirect to `/login`
6. **Google OAuth**: Uses Google Identity Services SDK, sends `idToken` to `/auth/google`
7. **Forgot Password**: Sends reset link email via `/auth/forgot-password`
8. **Reset Password**: Validates token + updates password via `/auth/reset-password`

### Lottery Draw Flow
1. User navigates to `/ichiban/:id` (`IchibanDetail.vue`)
2. Fetch lottery details + ticket status via `lotteryBrowseService` + `lotteryDrawService.getTickets()`
3. Click "開抽" → `IchibanDrawPanel` opens
4. **指定票券**: `drawLottery(id, { count: N, ticket: [uuid1, uuid2, ...] })` — ticket UUIDs from `getTickets()` response
5. **隨機抽獎**: `drawLottery(id, { count: N })` — no ticket array
6. API response is always an array: `data: [{ success, ticketNumber, prizeLevel, prizeName, ... }]`
7. Show result via animation dialog (category-based: ichibanResultDialog / gotchaDialog / scratchCardDialog)
8. Update prize box via `prizeBoxService`

### Dialog Usage Pattern
```typescript
import { ichibanInfoDialog } from '@/utils/dialog/ichibanInfoDialog';
import { useOverlayStore } from '@/stores/overlay';

const overlay = useOverlayStore();
overlay.open(); // Show backdrop
await ichibanInfoDialog({ title: 'Title', content: 'Message' });
overlay.close(); // Hide backdrop
```

## Common Gotchas

### TypeScript Strictness
- `strict: false` in tsconfig - nullable checks may pass silently
- Always handle `undefined`/`null` in API responses manually
- Use optional chaining: `detail?.storeName || '-'`

### API Error Handling
- Services `throw` errors - always wrap in try/catch or use `executeApi`
- `FrontAPI.ts` interceptor handles 401 globally - don't handle in components
- Use `getErrorMessage(error)` from `ErrorUtils.ts` for user-friendly messages

### Path Aliases
- Use `@/` for imports: `import { x } from '@/services/FrontAPI'`
- Configured in both `vite.config.ts` and `tsconfig.json`

### Image Assets
- Public images: `public/logo.png` → `/kuji/logo.png` (base path applied)
- Component images: `src/assets/image/*` → import as module
- Large image collection for lottery prizes in `src/assets/image/poler-*.png`

## Key Files Reference

- **Entry**: `src/main.ts` - App setup, FontAwesome registration, GSAP plugins
- **Router**: `src/router/index.ts` - All route definitions
- **API Client**: `src/services/FrontAPI.ts` - Axios instance with auth interceptors
- **Auth Store**: `src/stores/useAuthStore.ts` - Login state & token management
- **Type Definitions**: `src/vite-env.d.ts` - Global types (ApiResponse, SelectOption)
- **Dialog System**: `src/utils/dialog/createDialog.ts` - Core dialog mechanism
- **API Wrapper**: `src/utils/executeApiUtils.ts` - Standard API call pattern
- **Main Layout**: `src/layouts/FrontLayout.vue` - Page structure wrapper

## Testing & Debugging
- No test files found in codebase
- Debug via browser DevTools + Vue DevTools
- API errors logged to console in service catch blocks
- Use `console.log` for debugging (no logger framework)

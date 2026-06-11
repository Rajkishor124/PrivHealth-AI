# frontend/01_SETUP.md — Bootstrapping

## 1. Scaffold

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm i react-router-dom @reduxjs/toolkit react-redux axios
npm i react-hook-form zod @hookform/resolvers
npm i recharts lucide-react react-hot-toast
npm i -D tailwindcss postcss autoprefixer   # use the Tailwind version's current init flow
```

Configure Tailwind per its current docs (v4 uses `@import "tailwindcss"` in index.css;
v3 uses tailwind.config.js + directives — use whatever the installed version requires
and record in DECISIONS.md).

## 2. tsconfig

`strict: true`, `noUnusedLocals`, `noUnusedParameters`,
path alias `@/* → src/*` (mirror in `vite.config.ts` via `resolve.alias`).

## 3. Core wiring (build before any feature)

### types/api.ts
```ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PageMeta | null;
  timestamp: string;
}
export interface PageMeta { page: number; size: number; totalElements: number; totalPages: number; }
export interface ApiError {
  success: false;
  message: string;
  error: { code: string; details?: { field: string; message: string }[] };
  timestamp: string;
}
```

### api/axios.ts
- Instance with `baseURL: import.meta.env.VITE_API_BASE_URL`.
- Request interceptor: attach `Authorization: Bearer` from `utils/token.ts`.
- Response interceptor: on 401 with code `TOKEN_EXPIRED`/`TOKEN_INVALID`/`UNAUTHORIZED`
  → clear token, dispatch logout, redirect `/login` (use a small event/callback to avoid
  importing store into axios circularly). Normalize errors to `ApiError`.

### utils/token.ts
`getToken/setToken/clearToken` over localStorage key `privhealth_token`
(document the XSS tradeoff in a comment; acceptable for this project).

### app/store.ts + app/hooks.ts
configureStore with `auth`, `patients`, `predictions`, `admin` reducers;
typed `useAppDispatch`, `useAppSelector`.

### main.tsx
`<Provider store>` → `<BrowserRouter>` → `<App/>` + `<Toaster position="top-right"/>`.

## 4. Verification
- `npm run dev` renders landing page; `npm run build` clean.

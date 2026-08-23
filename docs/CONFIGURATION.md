# Configuration & Environment — TRACE

This document details all configuration files, build settings, and application configuration structures in TRACE.

---

## 1. Environment Variables Audit

| Variable Name | Purpose | Required? | Default / Where Used |
| :--- | :--- | :--- | :--- |
| *(None)* | The project does not use any `.env`, `.env.example`, or runtime environment variables. | No | All configuration is baked into the build or stored in `localStorage`. |

---

## 2. Build & Infrastructure Configuration Files

### 1. `vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```
- **Purpose:** Configures Vite bundler with Fast Refresh for React TSX/JSX modules.

### 2. `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```
- **Key Flags:**
  - `"target": "ES2020"`: Modern JavaScript output compatible with all modern smartphones.
  - `"strict": true`: Full strict type checking (null checks, parameter types).
  - `"allowImportingTsExtensions": true`: Enables explicit `.ts` and `.tsx` file extension imports (as seen in `import App from './App.tsx'`).

### 3. `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"
```
- **Purpose:** Instructs Netlify CI/CD build runners to trigger Vite's production build and publish the generated `dist/` directory.

### 4. `public/_redirects`
```text
/*    /index.html    200
```
- **Purpose:** Netlify rewrite rule that routes all URL paths back to `index.html` to prevent 404 errors during client-side deep linking.

### 5. `public/manifest.json`
```json
{
  "name": "Trace",
  "short_name": "Trace",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#0a0a0a",
  "theme_color": "#0a0a0a",
  "description": "Your presence. Traced.",
  "icons": [
      { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
      { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 3. Application State Configuration (`DEFAULT_CONFIG`)

Defined in [`src/hooks/useAttendance.ts:27-90`](../src/hooks/useAttendance.ts#L27-L90), this object is seeded when the user runs the app for the first time:

- **Semester Title:** `"4th Semester"`
- **Default Subject Code Map:**
  - `CSA`: Computer System Architecture (Prof. Ashish Rangade)
  - `DBMS`: Database Management System (Prof. Abhishek Dewangan)
  - `ADA`: Analysis & Design of Algorithm (Prof. Teena Aggarwal)
  - `JAVA`: Java Programming (Prof. Abhishek Dewangan)
  - `D.S.`: Discrete Mathematics (Prof. Savita Nam)
  - `Python Lab / DBMS Lab`: Dr. Choubey / Prof. Tripathi
  - `M P / Java Lab`: Mini Project / Java Lab (Prof. Smita / Prof. Dewangan)
  - `PD`: Personality Development
  - `LIB`: Library
- **Default Weekly Timetable Map:** Full Monday-through-Saturday hourly breakdown (e.g. `10:00-10:50`, `10:50-11:40`, `11:40-12:30`, `12:30-01:20`, `02:10-03:00`, `03:00-04:30`).

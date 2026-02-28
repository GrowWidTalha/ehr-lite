# Frontend Quickstart Guide

**Feature**: 001-ehr-frontend
**Date**: 2026-02-25
**Tech Stack**: Next.js 14 + shadcn/ui + TypeScript

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** 20+ installed (`node --version`)
- **npm** or **yarn** package manager
- **Backend API** running at `http://localhost:4000`
- Modern browser (Chrome, Edge, Firefox) for development

---

## Initial Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This installs:
- Next.js 14.2+ (App Router)
- React 19+
- TypeScript 5+
- Tailwind CSS 3.4+
- Radix UI primitives (via shadcn/ui)
- React Hook Form
- Zod
- TanStack Query

---

### 2. Initialize shadcn/ui

If this is a fresh project, initialize shadcn/ui:

```bash
npx shadcn-ui@latest init
```

**Configuration answers**:
- Would you like to use TypeScript? **Yes**
- Which style would you like to use? **Default**
- Which color would you like to use as base color? **Slate**
- Would you like to use CSS variables for colors? **Yes**

---

### 3. Install Required shadcn/ui Components

```bash
# Form components
npx shadcn-ui@latest add button input label select textarea
npx shadcn-ui@latest add form card accordion

# Navigation
npx shadcn-ui@latest add tabs separator

# Feedback
npx shadcn-ui@latest add toast alert dialog alert-dialog
npx shadcn-ui@latest add sheet scroll-area

# Data display
npx shadcn-ui@latest add badge avatar pagination
```

---

## Development

### Start Development Server

```bash
npm run dev
```

Frontend runs at: **http://localhost:3000**

Backend should run at: **http://localhost:4000**

### Build for Production

```bash
npm run build
npm run start
```

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with sidebar
│   │   ├── page.tsx            # Home/Patient list
│   │   ├── globals.css         # Global styles + Tailwind
│   │   └── patients/           # Patient routes
│   │       ├── new/
│   │       │   └── page.tsx    # New patient form
│   │       └── [id]/
│   │           ├── page.tsx    # Patient detail tabs
│   │           ├── diagnoses/  # Diagnosis routes
│   │           └── reports/    # Report routes
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components
│   │   ├── patients/           # Patient components
│   │   ├── diagnosis/          # Diagnosis components
│   │   └── reports/            # Report components
│   ├── lib/
│   │   ├── api.ts              # API client (fetch wrapper)
│   │   ├── db.types.ts         # TypeScript types
│   │   ├── validations.ts      # Zod schemas
│   │   └── utils.ts            # Helper functions
│   └── hooks/
│       ├── use-patients.ts     # Patient data hooks
│       ├── use-diagnosis.ts    # Diagnosis data hooks
│       └── use-camera.ts       # Camera capture hook
├── public/                     # Static assets
├── components.json             # shadcn/ui config
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript config
└── next.config.js              # Next.js config
```

---

## API Client Setup

### Configure API Base URL

Create `src/lib/api.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ApiResponse<T> {
  success: true;
  data: T;
  count?: number;
}

interface ApiError {
  success: false;
  error: string;
}

async function api<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T> | ApiError> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Request failed' };
    }

    return data;
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

export { api };
```

---

## Adding New Pages

### 1. Create Page Route

```typescript
// src/app/patients/new/page.tsx
export default function NewPatientPage() {
  return (
    <div>
      <h1>Register New Patient</h1>
      {/* Your form here */}
    </div>
  );
}
```

### 2. Add Navigation Link

Update sidebar navigation to include link to new page.

---

## Adding New shadcn/ui Components

```bash
npx shadcn-ui@latest add [component-name]
```

Example:
```bash
npx shadcn-ui@latest add dropdown-menu
```

Component is added to `src/components/ui/`.

---

## Form Validation with React Hook Form + Zod

### 1. Define Zod Schema

```typescript
// src/lib/validations.ts
import { z } from 'zod';

export const patientSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  age: z.number().min(0).max(150).optional(),
  sex: z.enum(['Male', 'Female', 'Other']).optional(),
  phone: z.string().optional(),
  cnic: z.string().optional(),
});
```

### 2. Create Form Component

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function NewPatientForm() {
  const form = useForm({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = async (data) => {
    // API call here
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('full_name')} />
      {form.formState.errors.full_name && (
        <span>{form.formState.errors.full_name.message}</span>
      )}
      <Button type="submit">Save Patient</Button>
    </form>
  );
}
```

---

## Camera Capture Hook

Create `src/hooks/use-camera.ts`:

```typescript
import { useState, useCallback } from 'react';

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      setError('Camera access denied or unavailable');
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
  }, [stream]);

  return { stream, error, startCamera, stopCamera };
}
```

---

## Testing

### Run Unit Tests

```bash
npm test
```

### Run E2E Tests (Playwright)

```bash
npx playwright test
```

### Test Coverage

```bash
npm test -- --coverage
```

---

## Environment Variables

Create `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# App Configuration
NEXT_PUBLIC_APP_NAME=EHR Lite
NEXT_PUBLIC_OFFLINE_MODE=true

# Image Upload
NEXT_PUBLIC_MAX_IMAGE_SIZE=5242880  # 5MB in bytes
```

---

## Troubleshooting

### Backend Connection Failed

- Ensure backend is running: `cd backend && npm run dev`
- Check API URL in `.env.local`
- Verify backend listens on port 4000

### shadcn/ui Components Not Found

- Run `npx shadcn-ui@latest init` again
- Check `components.json` exists
- Verify `tailwind.config.ts` has proper paths

### Camera Not Working

- Ensure HTTPS (localhost is exempt)
- Check browser permissions
- Try different browser (Chrome/Edge recommended)

### Build Errors

- Delete `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

---

## Production Deployment

### Static Export

For static hosting (if backend is separate):

```javascript
// next.config.js
module.exports = {
  output: 'export',
};
```

Build:
```bash
npm run build
```

Output in `out/` folder - deploy to any static host.

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [TanStack Query](https://tanstack.com/query/latest)

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Initialize shadcn/ui
3. ✅ Configure API client
4. 📝 Build patient list page
5. 📝 Build new patient form
6. 📝 Build patient detail page
7. 📝 Build diagnosis wizard
8. 📝 Build report upload

See [plan.md](./plan.md) for implementation phases.

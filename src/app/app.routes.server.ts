import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'doctor',
    renderMode: RenderMode.Client,
  },
  {
    path: 'doctor/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'staff-portal',
    renderMode: RenderMode.Client,
  },
  {
    path: 'staff-portal/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'patient',
    renderMode: RenderMode.Client,
  },
  {
    path: 'patient/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  }
];

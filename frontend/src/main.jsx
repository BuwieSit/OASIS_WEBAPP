import React, { lazy, Suspense, StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from "./context/authContext";
import { LoadingProvider, useLoading } from './context/LoadingContext';
import DisableDevtool from 'disable-devtool';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import 'animate.css';
import './styles.css';

// Component Imports
import ScrollToTop from './components/scrollToTop';
import LoadingScreen from './components/LoadingScreen';
import StudentRoute from "./routes/StudentRoute";
import AdminRoute from "./routes/AdminRoute";

/**
 * Utility to handle "Failed to fetch dynamically imported module" error.
 * This happens when the app is updated and the browser tries to load old chunks.
 */
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error("Chunk loading failed:", error);
      // Force reload to get the latest version
      window.location.reload();
      return { default: () => null }; // Return a dummy component while reloading
    }
  });

// Lazy Loaded Pages
const LandingPage = lazyWithRetry(() => import('./landingPage'));
const UserAccess = lazyWithRetry(() => import('./pages/userAccess'));
const NotFound = lazyWithRetry(() => import('./notFound'));

// Student Pages
const Student = lazyWithRetry(() => import('./pages/studentPages/student'));
const OjtHub = lazyWithRetry(() => import('./pages/studentPages/ojtHub'));
const HteDirectory = lazyWithRetry(() => import('./pages/studentPages/hteDirectory'));
const Announcements = lazyWithRetry(() => import('./pages/studentPages/announcements'));
const HteProfile = lazyWithRetry(() => import('./pages/studentPages/hteProfile'));
const StudentProfile = lazyWithRetry(() => import('./pages/userProfiles/studentProfile'));
// Admin Pages
const Admin = lazyWithRetry(() => import('./pages/adminPages/admin'));
const AdmOperations = lazyWithRetry(() => import('./pages/adminPages/admOperations'));
const DocsUpload = lazyWithRetry(() => import('./pages/adminPages/docsUpload'));
const RegStudents = lazyWithRetry(() => import('./pages/adminPages/regStudents'));
const AdmNotifications = lazyWithRetry(() => import('./pages/adminPages/admNotifications'));
  
const DISABLE_BASE =  import.meta.env.VITE_OASIS_PHASE;

if (DISABLE_BASE === 'production') {
  DisableDevtool({
    disableMenu: false,
    ondevtoolopen: (type) => {
      console.warn(`Devtools opened via: ${type}`);
      // Navigate to landing page using window.location instead of useNavigate (which is a hook)
      window.location.href = '/';
    }
  });
}


function RootLayout() {
  const { loading } = useLoading();
  
  return (
    <>
      {/* Manual loading state (from context) */}
      {loading && <LoadingScreen />}
      <ScrollToTop />
      <Outlet />
 
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'access', element: <UserAccess /> },

      // STUDENT PROTECTED ROUTES
      {
        element: <StudentRoute />,
        children: [
          { path: 'home', element: <Student /> },
          { path: 'htedirectory', element: <HteDirectory /> },
          { path: 'hte-profile', element: <HteProfile /> },
          { path: 'ojthub', element: <OjtHub /> },
          { path: 'announcements', element: <Announcements /> },
          { path: 'student-profile', element: <StudentProfile /> },
        ]
      },

      // ADMIN PROTECTED ROUTES
      {
        element: <AdminRoute />,
        children: [
          { path: 'admin', element: <Admin /> },
          { path: 'admHteManagement', element: <AdmOperations /> },
          { path: 'admUploads', element: <DocsUpload /> },
          { path: 'admStudents', element: <RegStudents /> },
          { path: 'admNotifications', element: <AdmNotifications /> },
        ]
      },

      { path: '*', element: <NotFound /> }
    ]
  }
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Best practices for modern React apps
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes default stale time
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingScreen />}>
            <RouterProvider router={router} />
          </Suspense>
        </AuthProvider>
      </LoadingProvider>
    </QueryClientProvider>
  </StrictMode>
);
import React, { lazy, Suspense, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider } from "./context/authContext";
import { LoadingProvider, useLoading } from './context/LoadingContext';

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
const MoaOverview = lazyWithRetry(() => import('./pages/adminPages/moaOverview'));
const RegStudents = lazyWithRetry(() => import('./pages/adminPages/regStudents'));
const AdmNotifications = lazyWithRetry(() => import('./pages/adminPages/admNotifications'));
const AdminProfile = lazyWithRetry(() => import('./pages/userProfiles/adminProfile'));

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
          { path: 'admOperations', element: <AdmOperations /> },
          { path: 'admUploads', element: <DocsUpload /> },
          { path: 'admMoaOverview', element: <MoaOverview /> },
          { path: 'admStudents', element: <RegStudents /> },
          { path: 'admNotifications', element: <AdmNotifications /> },
          { path: 'admin-profile', element: <AdminProfile /> },
        ]
      },

      { path: '*', element: <NotFound /> }
    ]
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LoadingProvider>
      <AuthProvider>
        {/* Suspense handles the loading state for lazy-loaded components */}
        <Suspense fallback={<LoadingScreen />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </LoadingProvider>
  </StrictMode>
);
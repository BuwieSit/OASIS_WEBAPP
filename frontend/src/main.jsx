import React, { lazy, Suspense, StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from "./context/authContext";
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { NotificationProvider } from './context/NotificationContext';
import DisableDevtool from 'disable-devtool';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import 'animate.css';
import './styles.css';


import ScrollToTop from './components/scrollToTop';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from "./routes/ProtectedRoute";

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
      window.location.reload();
      return { default: () => <NotFound/> }; 
    }
  });


const LandingPage = lazyWithRetry(() => import('./landingPage'));
const UserAccess = lazyWithRetry(() => import('./pages/userAccess'));
const NotFound = lazyWithRetry(() => import('./notFound'));


const Student = lazyWithRetry(() => import('./pages/studentPages/student'));
const OjtHub = lazyWithRetry(() => import('./pages/studentPages/ojtHub'));
const HteDirectory = lazyWithRetry(() => import('./pages/studentPages/hteDirectory'));
const Announcements = lazyWithRetry(() => import('./pages/studentPages/announcements'));
const HteProfile = lazyWithRetry(() => import('./pages/studentPages/hteProfile'));
const StudentProfile = lazyWithRetry(() => import('./pages/userProfiles/studentProfile'));

const Admin = lazyWithRetry(() => import('./pages/adminPages/admin'));
const HteManagement = lazyWithRetry(() => import('./pages/adminPages/HteManagement'));
const DocsUpload = lazyWithRetry(() => import('./pages/adminPages/docsUpload'));
const RegStudents = lazyWithRetry(() => import('./pages/adminPages/regStudents'));
const AdmNotifications = lazyWithRetry(() => import('./pages/adminPages/admNotifications'));
  
const DISABLE_BASE =  import.meta.env.VITE_OASIS_PHASE;

if (DISABLE_BASE === 'production') {
  DisableDevtool({
    disableMenu: false,
    ondevtoolopen: (type) => {
      console.warn(`Devtools opened via: ${type}`);

      window.location.href = '/';
    }
  });
}


function RootLayout() {
  const { loading } = useLoading();
  
  return (
    <>

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


      {
        element: <ProtectedRoute allowedRoles={['STUDENT']} />,
        children: [
          { path: 'home', element: <Student /> },
          { path: 'htedirectory', element: <HteDirectory /> },
          { path: 'hte-profile', element: <HteProfile /> },
          { path: 'ojthub', element: <OjtHub /> },
          { path: 'announcements', element: <Announcements /> },
          { path: 'student-profile', element: <StudentProfile /> },
        ]
      },


      {
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
        children: [
          { path: 'admin', element: <Admin /> },
          { path: 'admHteManagement', element: <HteManagement /> },
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

      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, 
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <NotificationProvider>
          <AuthProvider>
            <Suspense fallback={<LoadingScreen />}>
              <RouterProvider router={router} />
            </Suspense>
          </AuthProvider>
        </NotificationProvider>
      </LoadingProvider>
    </QueryClientProvider>
  </StrictMode>
);
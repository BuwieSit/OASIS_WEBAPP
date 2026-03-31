// import React, { lazy, Suspense, StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
// import { AuthProvider } from "./context/authContext";
// import 'animate.css';
// import './styles.css';
// import LandingPage from './landingPage';
// import UserAccess from './pages/userAccess';
// import NotFound from './notFound';
// import ScrollToTop from './components/scrollToTop';

// import Student from './pages/studentPages/student';
// import OjtHub from './pages/studentPages/ojtHub';
// import HteDirectory from './pages/studentPages/hteDirectory';
// import Announcements from './pages/studentPages/announcements';

// import Admin from './pages/adminPages/admin';
// import AdmOperations from './pages/adminPages/admOperations';
// import DocsUpload from './pages/adminPages/docsUpload';
// import MoaOverview from './pages/adminPages/moaOverview';
// import RegStudents from './pages/adminPages/regStudents';
// import { LoadingProvider, useLoading } from './context/LoadingContext';
// import LoadingScreen from './components/LoadingScreen';
// import HteProfile from './pages/studentPages/hteProfile';
// import StudentProfile from './pages/userProfiles/studentProfile';
// import AdminProfile from './pages/userProfiles/adminProfile';
// import StudentRoute from "./routes/StudentRoute";
// import AdminRoute from "./routes/AdminRoute";



// function RootLayout() {
//   const { loading } = useLoading();

//   return (
//     <>
//       {loading && <LoadingScreen />}
//       <ScrollToTop />
//       <Outlet />
//     </>
//   );
// }

// const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <RootLayout />,
//     children: [
//       { index: true, element: <LandingPage /> },
//       { path: 'access', element: <UserAccess /> },

//       // STUDENT PROTECTED ROUTES
//       {
//         element: <StudentRoute />,
//         children: [
//           { path: 'home', element: <Student /> },
//           { path: 'htedirectory', element: <HteDirectory /> },
//           { path: 'hte-profile', element: <HteProfile /> },
//           { path: 'ojthub', element: <OjtHub /> },
//           { path: 'announcements', element: <Announcements /> },
//           { path: 'student-profile', element: <StudentProfile /> },
//         ]
//       },

//       // ADMIN PROTECTED ROUTES
//       {
//         element: <AdminRoute />,
//         children: [
//           { path: 'admin', element: <Admin /> },
//           { path: 'admOperations', element: <AdmOperations /> },
//           { path: 'admUploads', element: <DocsUpload /> },
//           { path: 'admMoaOverview', element: <MoaOverview /> },
//           { path: 'admStudents', element: <RegStudents /> },
//           { path: 'admin-profile', element: <AdminProfile /> },
//         ]
//       },

//       { path: '*', element: <NotFound /> }
//     ]
//   }
// ]);

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <LoadingProvider>
//       <AuthProvider>
//         <Suspense fallback={<LoadingScreen />}>
//           <RouterProvider router={router} />
//         </Suspense>
//       </AuthProvider>
//     </LoadingProvider>
//   </StrictMode>
// );

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

// Lazy Loaded Pages
const LandingPage = lazy(() => import('./landingPage'));
const UserAccess = lazy(() => import('./pages/userAccess'));
const NotFound = lazy(() => import('./notFound'));

// Student Pages
const Student = lazy(() => import('./pages/studentPages/student'));
const OjtHub = lazy(() => import('./pages/studentPages/ojtHub'));
const HteDirectory = lazy(() => import('./pages/studentPages/hteDirectory'));
const Announcements = lazy(() => import('./pages/studentPages/announcements'));
const HteProfile = lazy(() => import('./pages/studentPages/hteProfile'));
const StudentProfile = lazy(() => import('./pages/userProfiles/studentProfile'));

// Admin Pages
const Admin = lazy(() => import('./pages/adminPages/admin'));
const AdmOperations = lazy(() => import('./pages/adminPages/admOperations'));
const DocsUpload = lazy(() => import('./pages/adminPages/docsUpload'));
const MoaOverview = lazy(() => import('./pages/adminPages/moaOverview'));
const RegStudents = lazy(() => import('./pages/adminPages/regStudents'));
const AdminProfile = lazy(() => import('./pages/userProfiles/adminProfile'));

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
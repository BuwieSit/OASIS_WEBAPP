import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider } from "./context/authContext";
import 'animate.css';
import './styles.css';
import LandingPage from './landingPage';
import UserAccess from './pages/userAccess';
import NotFound from './notFound';
import ScrollToTop from './components/scrollToTop';

import Student from './pages/studentPages/student';
import OjtHub from './pages/studentPages/ojtHub';
import HteDirectory from './pages/studentPages/hteDirectory';
import Announcements from './pages/studentPages/announcements';

import Admin from './pages/adminPages/admin';
import AdmOperations from './pages/adminPages/admOperations';
import DocsUpload from './pages/adminPages/docsUpload';
import MoaOverview from './pages/adminPages/moaOverview';
import RegStudents from './pages/adminPages/regStudents';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import LoadingScreen from './components/LoadingScreen';
import HteProfile from './pages/studentPages/hteProfile';
import StudentProfile from './pages/userProfiles/studentProfile';
import AdminProfile from './pages/userProfiles/adminProfile';
import StudentRoute from "./routes/StudentRoute";
import AdminRoute from "./routes/AdminRoute";



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
        <RouterProvider router={router} />
      </AuthProvider>
    </LoadingProvider>
  </StrictMode>
);
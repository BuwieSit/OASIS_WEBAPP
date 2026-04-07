import 'animate.css';
import { useState } from 'react';
import LogregScreen from '../layouts/logregScreen';
import { UpdatedLogin, UpdatedReg, ForgotPassword } from '../components/forms';
import { Navigate } from "react-router-dom";
import { useAuth } from '../context/authContext';
import useQueryParam from '../hooks/useQueryParams';

export default function UserAccess() {

  const ACCESS = {
    LOGIN: "login",
    REGISTER: "register",
    FORGOTPASS: "forgotpassword",
  };

  const { role, loading } = useAuth();
  const [accessType, setAccessType] = useQueryParam("form", ACCESS.LOGIN);

  if (loading) return null;
  if (role === "ADMIN") return <Navigate to="/admin" replace />;
  if (role === "STUDENT") return <Navigate to="/home" replace />;

  return (
    <>
      <LogregScreen>
        <div className='bg-white relative shadow-[inset_0px_0px_100px] shadow-oasis-blue p-5 h-dvh w-full flex flex-col justify-center'>

          {accessType === ACCESS.LOGIN && (
            <>
              <UpdatedLogin />
              <section className="w-full flex flex-row items-center justify-between">
                <p
                  className="cursor-pointer hover:underline underline-offset-2 font-oasis-text text-[0.8rem]"
                  onClick={() => setAccessType(ACCESS.REGISTER)}
                >
                  Not registered yet?
                </p>
                <p 
                  className="cursor-pointer hover:underline underline-offset-2 font-oasis-text text-[0.8rem]"
                  onClick={() => setAccessType(ACCESS.FORGOTPASS)}
                >
                  Forgot password
                </p>
              </section>
            </>
          )}

          {accessType === ACCESS.REGISTER && (
            <>
              <UpdatedReg />
              <section className="flex flex-row items-center justify-center">
                <p
                  className="cursor-pointer hover:underline underline-offset-2 font-oasis-text text-[0.8rem]"
                  onClick={() => setAccessType(ACCESS.LOGIN)}
                >
                  Already registered?
                </p>
              </section>
            </>
          )}

          {accessType === ACCESS.FORGOTPASS && (
            <>
              <ForgotPassword/>
                <p
                  className="cursor-pointer hover:underline underline-offset-2 font-oasis-text text-[0.8rem]"
                  onClick={() => setAccessType(ACCESS.LOGIN)}
                >
                  Back to Login
                </p>
            </>
          )}
        </div>
      
      </LogregScreen>
    </>
  );
}

import { useState, useEffect, useRef } from "react";
import { USER_REGEX, PWD_REGEX, ADMIN_REGEX } from "./config/regex";

export default function useAuthFormLogic({ allowAdmin = false } = {}) {
  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const [validName, setValidName] = useState(false);
  const [validPwd, setValidPwd] = useState(false);

  const [userFocus, setUserFocus] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);
  const [userTouched, setUserTouched] = useState(false);
  const [pwdTouched, setPwdTouched] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Auto focus on mount
  useEffect(() => {
    userRef.current?.focus();
  }, []);

  // Username validation
  useEffect(() => {
    if (allowAdmin && ADMIN_REGEX.test(user)) {
      setValidName(true);
    } else {
      setValidName(USER_REGEX.test(user));
    }
  }, [user, allowAdmin]);

  // Password validation
  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
  }, [pwd]);

  // Clear error on input change
  useEffect(() => {
    setErrMsg("");
  }, [user, pwd]);

  return {
    userRef,
    errRef,
    user,
    setUser,
    pwd,
    setPwd,
    errMsg,
    setErrMsg,
    validName,
    validPwd,
    userFocus,
    setUserFocus,
    pwdFocus,
    setPwdFocus,
    userTouched,
    setUserTouched,
    pwdTouched,
    setPwdTouched,
    showPassword,
    togglePasswordVisibility,
  };
}
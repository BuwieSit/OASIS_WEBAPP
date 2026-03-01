import { useState, useEffect, useRef } from "react";
import { OTP_REGEX, USER_REGEX, PWD_REGEX } from "./config/regex";

export default function useRegisterFlow({
  user,
  pwd,
  setErrMsg,
}) {
  // ---- STEPS ----
  const STEPS = {
    EMAIL: "EMAIL",
    OTP: "OTP",
    PASSWORD: "PASSWORD",
  };

  const [step, setStep] = useState(STEPS.EMAIL);

  // ---- REFS ----
  const otpRef = useRef();
  const pwdRef = useRef();

  // ---- OTP ----
  const [otp, setOtp] = useState("");
  const [validOtp, setValidOtp] = useState(false);
  const [otpFocus, setOtpFocus] = useState(false);

  // ---- MATCH PASSWORD ----
  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  // ---- SUCCESS / REFRESH ----
  const [success, setSuccess] = useState();
  const [refresh, setRefresh] = useState(false);

  // ---- STEP AUTO FOCUS ----
  useEffect(() => {
    if (step === STEPS.OTP) otpRef.current?.focus();
    if (step === STEPS.PASSWORD) pwdRef.current?.focus();
  }, [step]);

  // ---- OTP VALIDATION ----
  useEffect(() => {
    setValidOtp(OTP_REGEX.test(otp));
  }, [otp]);

  // ---- MATCH VALIDATION ----
  useEffect(() => {
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  // ---- CLEAR ERRORS ----
  useEffect(() => {
    setErrMsg("");
  }, [otp, matchPwd, pwd, user]);

  // ---- REFRESH ----
  useEffect(() => {
    if (refresh) {
      window.location.reload();
    }
  }, [refresh]);

  return {
    STEPS,
    step,
    setStep,

    otpRef,
    pwdRef,

    otp,
    setOtp,
    validOtp,
    otpFocus,
    setOtpFocus,

    matchPwd,
    setMatchPwd,
    validMatch,
    matchFocus,
    setMatchFocus,

    success,
    setSuccess,

    refresh,
    setRefresh,
  };
}
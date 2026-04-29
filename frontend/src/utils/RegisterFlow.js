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
  const [otpTouched, setOtpTouched] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [canResend, setCanResend] = useState(false);


  // ---- MATCH PASSWORD ----
  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);
  const [matchTouched, setMatchTouched] = useState(false);

  // ---- SUCCESS / REFRESH ----
  const [success, setSuccess] = useState();
  const [refresh, setRefresh] = useState(false);

  // ---- FORMAT TIME ----
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // ---- STEP AUTO FOCUS ----
  useEffect(() => {
    if (step === STEPS.OTP) otpRef.current?.focus();
    if (step === STEPS.PASSWORD) pwdRef.current?.focus();
  }, [step]);

  // ---- OTP TIMER ----
  useEffect(() => {
    if (secondsLeft <= 0) {
      if (step === STEPS.OTP) setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, step]);

  // ---- RESEND TIMER ----
  useEffect(() => {
    if (resendSeconds <= 0) return;
    const interval = setInterval(() => {
      setResendSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendSeconds]);

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
    otpTouched,
    setOtpTouched,
    secondsLeft,
    setSecondsLeft,
    resendSeconds,
    setResendSeconds,
    formattedTime,
    canResend,
    setCanResend,


    matchPwd,
    setMatchPwd,
    validMatch,
    matchFocus,
    setMatchFocus,
    matchTouched,
    setMatchTouched,

    success,
    setSuccess,

    refresh,
    setRefresh,
  };
}
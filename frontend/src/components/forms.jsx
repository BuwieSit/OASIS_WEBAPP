import { Button } from "./button";
import { useForm } from "react-hook-form";
import { useRef, useState, useEffect } from "react";
import Title from "../utilities/title";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../api/token";
import { useAuth } from "../context/authContext";
import {
  sendOtp,
  verifyOtp,
  login,
  completeRegistration
} from "../api/auth.service";


const USER_REGEX = /^[a-z]+[a-z][a-z]+@iskolarngbayan\.pup\.edu\.ph$/;
const PWD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const OTP_REGEX = /^\d{6}$/;

export function UpdatedReg() {
  const navigate = useNavigate();

  const STEPS = {
    EMAIL: "EMAIL",
    OTP: "OTP",
    PASSWORD: "PASSWORD",
  };

  const [step, setStep] = useState(STEPS.EMAIL);
  const otpRef = useRef();
  const pwdRef = useRef();

  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("");
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [otp, setOtp] = useState("");
  const [validOtp, setValidOtp] = useState(false);
  const [otpFocus, setOtpFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    if (step === STEPS.EMAIL) userRef.current?.focus();
    if (step === STEPS.OTP) otpRef.current?.focus();
    if (step === STEPS.PASSWORD) pwdRef.current?.focus();
  }, [step]);

  useEffect(() => {
    // webmail validation
    const result = USER_REGEX.test(user);
    setValidName(result);
  }, [user]);

  useEffect(() => {
    // OTP validation
    setValidOtp(OTP_REGEX.test(otp));
  }, [otp]);

  useEffect(() => {
    // password validation
    const result = PWD_REGEX.test(pwd);
    setValidPwd(result);
    const match = pwd === matchPwd;
    setValidMatch(match);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd, matchPwd, otp]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // only submit on PASSWORD step
    if (step !== STEPS.PASSWORD) return;

    const v1 = USER_REGEX.test(user);
    const v2 = PWD_REGEX.test(pwd);

    if (!v1 || !v2) {
      setErrMsg("Invalid Entry");
      return;
    }

    try {
      clearToken();

      await completeRegistration(user, pwd, matchPwd);
      setSuccess(true);
      navigate("/access");
    } catch (err) {
      setErrMsg(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Registration failed."
      );
    }
  };

  return (
    <>
      {success ? (
        <>
          <section>
            <h1>success</h1>
            <p>Sign in</p>
          </section>
        </>
      ) : (
        <>
          <section className="w-full p-1 flex flex-col items-center justify-center gap-1">
            <Title text={"Register"}></Title>
            <p
              ref={errRef}
              className={errMsg ? "right-0" : "right-full"}
              aria-live="assertive"
            >
              {errMsg}
            </p>
          </section>

            {/* WEBMAIL */}
            <form onSubmit={handleSubmit} className="w-full p-5 flex flex-col items-center gap-3">
                {step === STEPS.EMAIL && (
                    <>
                        <div className="w-full">
                            <label className="mb-1 text-oasis-header font-oasis-text" htmlFor="webMail">PUP Webmail</label>
                            <input
                                type="text"
                                id="webMail"
                                placeholder="Enter valid webmail"
                                ref={userRef}
                                autoComplete="off"
                                required
                                onChange={(e) => setUser(e.target.value)}
                                aria-invalid={validName ? "false" : "true"}
                                aria-describedby="uidnote"
                                onFocus={() => setUserFocus(true)}
                                onBlur={() => setUserFocus(false)}

                                className="w-full p-3 border-b-2 border-oasis-light focus:outline-none focus:border-oasis-aqua transition-all"
                            />
                        </div>
                        
                        <p id="uidnote" className={userFocus && user && !validName ? 
                          "opacity-100 font-oasis-text text-red-900 text-[0.8rem] italic m-auto text-center": "opacity-0 font-oasis-text text-red-900 text-[0.8rem] italic m-auto text-center"}>Must be a valid webmail.<br/> 
                        E.g. juanmdelacruz@iskolarngbayan.pup.edu.ph
                        </p>
                        <Button
                            text="Send OTP"
                            type="button"
                            disabled={!validName}
                            onClick={async (e) => {
                                e.preventDefault();
                                try {
                                    await sendOtp(user);
                                    setStep(STEPS.OTP);

                                } catch {
                                    setErrMsg("Failed to send OTP");
                                }
                            }}
                        />
                    </>
                )}

                {/* OTP */}
                {step === STEPS.OTP && (
                    <>
                        <div className="text-center">
                            <label htmlFor="otp" className="mb-1 text-oasis-header font-oasis-text">Enter OTP</label>
                            <input
                                ref={otpRef}
                                type="text"
                                id="otp"
                                required
                                placeholder="6-digit OTP"
                                onChange={(e) => setOtp(e.target.value)}
                                aria-describedby="otpnote"
                                onFocus={() => setOtpFocus(true)}
                                onBlur={() => setOtpFocus(false)}
                                
                                className="w-full p-3 border-b-2 border-oasis-light focus:outline-none focus:border-oasis-aqua transition-all"
                            />
                        </div>
                          <p id="otpnote" className={otpFocus && otp && !validOtp ? "opacity-100 font-oasis-text text-red-600 text-xs ": "opacity-0 "}> OTP must be a 6-digit number.</p>
                        <Button
                            text="Verify OTP"
                            type="button"
                            disabled={!validOtp}
                            onClick={async (e) => {
                                e.preventDefault();

                                try {
                                    await verifyOtp(user, otp); //backend call
                                    setStep(STEPS.PASSWORD);
                                } catch {
                                    setErrMsg("Invalid OTP");
                                }
                            }}
                        />

                    </>
                )}

                {/* PASSWORD */}
                {step === STEPS.PASSWORD && (
                  <>
                      <div className="text-center">
                          <label htmlFor="password" className="mb-1 text-oasis-header font-oasis-text">Password</label>
                          <input
                              ref={pwdRef}
                              type="password"
                              id="password"
                              placeholder="Enter password"
                              required
                              onChange={(e) => setPwd(e.target.value)}
                              aria-invalid={!validPwd}
                              aria-describedby="pwdnote"
                              onFocus={() => setPwdFocus(true)}
                              onBlur={() => setPwdFocus(false)}

                              className="w-full p-3 border-b-2 border-oasis-light focus:outline-none focus:border-oasis-aqua transition-all"
                          />
                      </div>

                      <div className="text-center">
                          <label htmlFor="confirm_pwd">Confirm Password</label>
                          <input
                              type="password"
                              id="confirm_pwd"
                              placeholder="Re-enter password"
                              onChange={(e) => setMatchPwd(e.target.value)}
                              aria-invalid={!validMatch}
                              aria-describedby="matchnote"
                              required
                              onFocus={() => setMatchFocus(true)}
                              onBlur={() => setMatchFocus(false)}
                              
                              className="w-full p-3 border-b-2 border-oasis-light focus:outline-none focus:border-oasis-aqua transition-all"
                          />
                      </div>

                      <p id="pwdnote" className={pwdFocus && pwd && !validPwd ? "opacity-100 font-oasis-text text-red-600 text-xs ": "opacity-0 "}>
                          Password must not be less than 8 characters.<br/>
                          Including an uppercase letter, and special character
                      </p>
                      <p id="matchnote" className={matchFocus && matchPwd && !validMatch ? "opacity-100 font-oasis-text text-red-600 text-xs": "opacity-0 "}>
                          password not matched!
                      </p>

                    <Button text="Register" type="submit" disabled={!validPwd || !validMatch} />
                  </>
            )}
          </form>
        </>
      )}
    </>
  );
}


export function UpdatedLogin() {
  const userRef = useRef();
  const navigate = useNavigate();
  const errRef = useRef();

  const { loginUser } = useAuth(); //IMPORTANT

  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(user, pwd);

      const redirectPath = res.role === "ADMIN" ? "/admin" : "/home";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrMsg(
        err?.response?.data?.error || "Invalid credentials"
      );
    }
  };

  return (
    <>
      <section className="w-full p-1 flex flex-col items-center justify-center gap-1">
        <Title text={"Login"} />
        <p
          ref={errRef}
          className={errMsg ? "opacity-1 text-red-600" : "opacity-0"}
          aria-live="assertive"
        >
          {errMsg}
        </p>
      </section>

      <form
        className="w-full p-5 flex flex-col items-center justify-center gap-5"
        onSubmit={handleLogin}
      >
        <div className="w-full">
          <label className="mb-1 text-oasis-header font-oasis-text">
            PUP Webmail / Admin ID
          </label>
          <input
            type="text"
            ref={userRef}
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
            className="w-full p-3 border-b-2 border-oasis-light focus:outline-none focus:border-oasis-aqua transition-all"
          />
        </div>

        <div className="w-full">
          <label className="mb-1 text-oasis-header font-oasis-text">
            Password
          </label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
            className="w-full p-3 border-b-2 border-oasis-light focus:outline-none focus:border-oasis-aqua transition-all"
          />
        </div>

        <Button text="Sign in" type="submit" />
      </form>
    </>
  );
}

// Enter webmail
// Send OTP
// Verify
// Enter new and confirm password

export function ForgotPassword() {
  return (
    <>
      <form className="w-full p-5 flex flex-col items-center justify-center gap-5">

        <div className="w-full">
          <label className="mb-1 text-oasis-header font-oasis-text" htmlFor="webMail">PUP Webmail</label>
          <input
              type="text"
              id="webMail"
              placeholder="Enter valid webmail"
              // ref={userRef}
              autoComplete="off"
              required
              // onChange={(e) => setUser(e.target.value)}
              // aria-invalid={validName ? "false" : "true"}
              // aria-describedby="uidnote"
              // onFocus={() => setUserFocus(true)}
              // onBlur={() => setUserFocus(false)}

              className="w-full p-3 border-b-2 border-oasis-light focus:outline-none focus:border-oasis-aqua transition-all"
          />
        </div>

        <Button text="Send OTP" type="submit" />
      </form>
      
{/*       
      <p id="uidnote" className={userFocus && user && !validName ? 
        "opacity-100 font-oasis-text text-red-900 text-[0.8rem] italic m-auto text-center": "opacity-0 font-oasis-text text-red-900 text-[0.8rem] italic m-auto text-center"}>Must be a valid webmail.<br/> 
      E.g. juanmdelacruz@iskolarngbayan.pup.edu.ph
      </p> */}
    </>
  )
}
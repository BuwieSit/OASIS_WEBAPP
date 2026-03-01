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
import Subtitle from "../utilities/subtitle";
import { Eye, EyeClosed } from "lucide-react";
import { Label } from "../utilities/label";

const USER_REGEX = /^[a-z]+[a-z][a-z]+@iskolarngbayan\.pup\.edu\.ph$/;
const PWD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const ADMIN_REGEX = /^[admin]+[0-9][0-9][0-9]$/;
const OTP_REGEX = /^\d{6}$/;

export function ValidatedInputField({ 
  type, 
  id,
  value,
  placeholder, 
  ref,
  autoComplete, 
  required, 
  onChange,
  ariaInvalid,
  ariaDescribedBy,
  onFocus,
  onBlur,
  onCopy,
  onCut,
  onPaste,

}) {
  return (
    <>
      <input
          type={type}
          id={id}
          placeholder={placeholder}
          ref={ref}
          autoComplete={autoComplete}
          required={required}
          onChange={onChange}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          onFocus={onFocus}
          onBlur={onBlur}
          value={value}
          onCopy={onCopy}
          onCut={onCut}
          onPaste={onPaste}

          className="w-full p-3 border-b-2 border-oasis-light focus:outline-none focus:border-oasis-aqua transition-all"
      />
    </>
  )
}

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
  const [showPassword, setShowPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [validOtp, setValidOtp] = useState(false);
  const [otpFocus, setOtpFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [refresh, setRefresh] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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

  useEffect(() => {
    if(refresh) {
      window.location.reload();
    }
  }, (refresh))
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
      {success ? (() => setRefresh(true)) : (
        <>
          <section className="w-full p-1 flex flex-col items-center justify-center gap-1">
            <Title text={"Register"}></Title>
          </section>

            {/* WEBMAIL */}
            <form onSubmit={handleSubmit} className="w-full p-5 flex flex-col items-center gap-3">
                {step === STEPS.EMAIL && (
                    <>
                        <div className="w-full">
                            <Label labelText={"PUP Webmail"} fieldId={"webMail"}/>
                            <ValidatedInputField
                              type={"text"}
                              id={"webMail"}
                              placeholder={"Enter valid webmail"}
                              ref={userRef}
                              autoComplete="off"
                              required
                              onChange={(e) => setUser(e.target.value)}
                              ariaInvalid={validName ? "false" : "true"}
                              ariaDescribedBy="uidnote"
                              onFocus={() => setUserFocus(true)}
                              onBlur={() => setUserFocus(false)}
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
                            <Label labelText={"Enter OTP"} fieldId={"otp"}/>
                            <ValidatedInputField
                                ref={otpRef}
                                type="text"
                                id="otp"
                                required
                                placeholder="6-digit OTP"
                                onChange={(e) => setOtp(e.target.value)}
                                ariaDescribedBy="otpnote"
                                onFocus={() => setOtpFocus(true)}
                                onBlur={() => setOtpFocus(false)}
                            />

                        </div>
                        <div className="w-full h-20 flex align-center justify-center">
                          <p id="otpnote" className={otpFocus && otp && !validOtp ? "opacity-100 font-oasis-text text-red-600 text-xs ": "opacity-0 "}> OTP must be a 6-digit number.</p>
                        </div>
                          
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
                          <Label labelText={"Password"} fieldId={"password"}/>
                          <ValidatedInputField
                              ref={pwdRef}
                              type={showPassword ? "text" : "password"}
                              id="password"
                              placeholder="Enter password"
                              required
                              onChange={(e) => setPwd(e.target.value)}
                              ariaInvalid={!validPwd}
                              ariaDescribedBy="pwdnote"
                              onFocus={() => setPwdFocus(true)}
                              onBlur={() => setPwdFocus(false)}
                          />

                          {showPassword ? 
                            <Eye color="#3E8679" className="absolute top-[35%] right-[10%] -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility} onMouseDown={(e) => e.preventDefault()}/> 
                          : 
                            <EyeClosed color="#3E8679" className="absolute top-[35%] right-[10%] -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility} onMouseDown={(e) => e.preventDefault()}/>
                          }
                          <ValidatedInputField
                              type={showPassword ? "text" : "password"}
                              id="confirm_pwd"
                              placeholder="Re-enter password"
                              onChange={(e) => setMatchPwd(e.target.value)}
                              ariaInvalid={!validMatch}
                              ariaDescribedBy="matchnote"
                              required
                              onFocus={() => setMatchFocus(true)}
                              onBlur={() => setMatchFocus(false)}
                          />
                      </div>

                      <div className="w-full h-20 flex align-center justify-center">
                          {pwdFocus && 
                            <p id="pwdnote" className={pwdFocus && pwd && !validPwd ? "opacity-100 font-oasis-text text-red-600 text-xs ": "opacity-0 "}>
                            Password must not be less than 8 characters.<br/>
                            Including an uppercase letter, and special character
                            </p>
                          }

                          {matchFocus && 
                            <p id="matchnote" className={matchFocus && matchPwd && !validMatch ? "opacity-100 font-oasis-text text-red-600 text-xs": "opacity-0 "}>
                            password not matched!
                            </p>
                          }
                      </div>
                      
                    <Button text="Register" type="submit" disabled={!validPwd || !validMatch} />
                  </>
            )}
          </form>
        </>
      )}

      <section className="w-full p-1 flex flex-col items-center justify-center gap-1">
            <p
              ref={errRef}
              className={`${errMsg ? "right-0" : "right-full"} text-red-500 italic font-bold`}
              aria-live="assertive"
            >
              {errMsg}
            </p>
        </section>
    </>
  );
}

export function UpdatedLogin() {
  const userRef = useRef();
  const navigate = useNavigate();
  const errRef = useRef();
  const { loginUser } = useAuth();
 

  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");
  

  const [validName, setValidName] = useState(false);
  const [validPwd, setValidPwd] = useState(false);

  const [userFocus, setUserFocus] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);
  const [showPassword, setShowPassword] = useState("");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // webmail validation
  const admin = ADMIN_REGEX.test(user);
  useEffect(() => {
  
    if (admin) {
        setValidName(true)
    }
    else {
      setValidName(USER_REGEX.test(user));
    }
    
  }, [user]);

  // password validation
  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
  }, [pwd]);

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const v2 = PWD_REGEX.test(pwd);

    if (!v2) {
      setErrMsg("Invalid Password");
      return;
    }

    try {
      const res = await loginUser(user, pwd);
      const redirectPath = res.role === "ADMIN" ? "/admin" : "/home";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrMsg(err?.response?.data?.error || "Invalid credentials");
    }
  };

  return (
    <>
      <section className="w-full p-1 flex flex-col items-center justify-center gap-1">
        <Title text={"Login"} />
      </section>

      <form
        className="w-full p-5 flex flex-col items-center justify-center gap-5"
        onSubmit={handleLogin}
      >
        {/* WEBMAIL */}
        <div className="w-full">
          <Label labelText={"PUP Webmail"} fieldId={"webMail"}/>
          <ValidatedInputField
            type="text"
            id="webMail"
            ref={userRef}
            value={user}
            placeholder="Please enter webmail"
            onChange={(e) => setUser(e.target.value)}
            required
            ariaInvalid={!validName}
            onFocus={() => setUserFocus(true)}
            onBlur={() => setUserFocus(false)}
          />

          <Label labelText={"Password"} fieldId={"password"}/>
            <ValidatedInputField
              type={showPassword ? "text" : "password"}
              value={pwd}
              id="password"
              placeholder="Please enter password"
              onChange={(e) => setPwd(e.target.value)}
              required
              aria-invalid={!validPwd}
              onFocus={() => setPwdFocus(true)}
              onBlur={() => setPwdFocus(false)}
              onCopy={handleLogin}
              onCut={handleLogin}
              onPaste={handleLogin}
            />
          {showPassword ? 
            <Eye color="#3E8679" className="absolute top-1/2 right-[10%] -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility} onMouseDown={(e) => e.preventDefault()}/> 
          : 
            <EyeClosed color="#3E8679" className="absolute top-1/2 right-[10%] -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility} onMouseDown={(e) => e.preventDefault()}/>}
          
        </div>

        <Button text="Login" type="submit"/>
        <div className="w-full flex justify-center items-center h-10">
          {userFocus && 
            <p className={userFocus && user && !validName ? "opacity-100 font-oasis-text text-red-900 text-[0.8rem] italic m-auto text-center" : "opacity-0 font-oasis-text text-red-900 text-[0.8rem] italic m-auto text-center"}>
            Must be a valid PUP webmail. <br/> E.g. juanmdelacruz@iskolarngbayan.pup.edu.ph
            </p>
          }
          {pwdFocus && 
            <p className={pwdFocus && pwd && !validPwd ? "opacity-100 font-oasis-text text-red-900 text-[0.8rem] italic m-auto text-center" : "opacity-0 font-oasis-text text-red-900 text-[0.8rem] italic m-auto text-center"}>
            Password must be 8+ chars with uppercase, number, special char.
            </p> 
          }
          <Subtitle ariaLive={"assertive"} ref={errRef} text={errMsg} color={"text-red-500"} className={"italic"} weight="font-bold"/>
        </div>
        
      </form>
    </>
    // disabled={!validName || !validPwd}
  );
}


export function ForgotPassword() {
  return (
    <>
    <Title text={"Forgot Password"} />
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
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
import useRegisterFlow from "../utils/RegisterFlow";
import useAuthFormLogic from "../utils/AuthFormLogic";

export function UpdatedReg() {
  const navigate = useNavigate();

  const {
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
    showPassword,
    togglePasswordVisibility,
  } = useAuthFormLogic();

  const {
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
  } = useRegisterFlow({
    user,
    pwd,
    setErrMsg,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("SUBMIT CLICKED", step);
   
    if (step !== STEPS.PASSWORD) return;
  
    if (!validName || !validPwd || !validMatch) {
      setErrMsg("Invalid Entry");
      return;
    }
    // /auth/send-otp-register
    try {
      clearToken();
      await completeRegistration(user, pwd, matchPwd);
      // setSuccess(true);
      // console.log("Success reg!", success);
      navigate("/access?form=login");
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
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const {
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
    showPassword,
    togglePasswordVisibility,
  } = useAuthFormLogic({ allowAdmin: true });

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validPwd) {
      setErrMsg("Invalid Password");
      return;
    }

    try {
      const res = await loginUser(user, pwd);
      const redirectPath = res.role === "ADMIN" ? "/admin" : "/home";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrMsg(err?.response?.data?.error || "Error. Please try again.");
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

        <Button text="Login" type="submit" disabled={!validName || !validPwd}/>
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
  );
}


export function ForgotPassword() {
  const navigate = useNavigate();

  const {
    userRef,
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
    showPassword,
    togglePasswordVisibility,
  } = useAuthFormLogic();

  const {
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
  } = useRegisterFlow({
    user,
    pwd,
    setErrMsg,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      // /auth/send-otp-reset
      if (step === STEPS.EMAIL) {
        await sendOtp(user);
        setStep(STEPS.OTP);
      }

      else if (step === STEPS.OTP) {
        await verifyOtp(user, otp);
        setStep(STEPS.PASSWORD);
      }

      else if (step === STEPS.PASSWORD) {
        if (!validPwd || !validMatch) {
          setErrMsg("Invalid password entry");
          return;
        }
        await resetPassword(user, pwd);
        navigate("/access");
      }

    } catch (err) {
      setErrMsg(
        err?.response?.data?.error ||
        "Something went wrong."
      );
    }
  };

  return (
    <>
      <Title text={"Forgot Password"} />

      <form
        onSubmit={handleSubmit}
        className="w-full p-5 flex flex-col items-center justify-center gap-5"
      >

        {/* STEP 1 — WEBMAIL */}
        {step === STEPS.EMAIL && (
          <>
            <div className="w-full">
              <Label labelText={"PUP Webmail"} fieldId={"webMail"}/>

              <ValidatedInputField
                type="text"
                id="webMail"
                placeholder="Enter valid webmail"
                ref={userRef}
                autoComplete="off"
                required
                value={user}
                onChange={(e) => setUser(e.target.value)}
                ariaInvalid={validName ? "false" : "true"}
                ariaDescribedBy="uidnote"
                onFocus={() => setUserFocus(true)}
                onBlur={() => setUserFocus(false)}
              />
            </div>

            <Button text="Send OTP" type="submit" disabled={!validName} />
          </>
        )}

        {/* STEP 2 — OTP */}
        {step === STEPS.OTP && (
          <>
            <ValidatedInputField
              type="text"
              id="otp"
              placeholder="Enter 6-digit OTP"
              ref={otpRef}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              ariaInvalid={validOtp ? "false" : "true"}
              ariaDescribedBy="otpnote"
              onFocus={() => setOtpFocus(true)}
              onBlur={() => setOtpFocus(false)}
            />

            <Button text="Verify OTP" type="submit" disabled={!validOtp} />
          </>
        )}

        {/* STEP 3 — NEW PASSWORD */}
        {step === STEPS.PASSWORD && (
          <>
            <ValidatedInputField
              type={showPassword ? "text" : "password"}
              id="new_password"
              placeholder="New Password"
              ref={pwdRef}
              required
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              ariaInvalid={validPwd ? "false" : "true"}
              ariaDescribedBy="pwdnote"
              onFocus={() => setPwdFocus(true)}
              onBlur={() => setPwdFocus(false)}
            />

            <ValidatedInputField
              type={showPassword ? "text" : "password"}
              id="confirm_password"
              placeholder="Confirm Password"
              required
              value={matchPwd}
              onChange={(e) => setMatchPwd(e.target.value)}
              ariaInvalid={validMatch ? "false" : "true"}
              ariaDescribedBy="matchnote"
              onFocus={() => setMatchFocus(true)}
              onBlur={() => setMatchFocus(false)}
            />

            <Button
              text="Reset Password"
              type="submit"
              disabled={!validPwd || !validMatch}
            />
          </>
        )}
      </form>

      {errMsg && (
        <p className="text-red-500 italic font-bold text-center mt-3">
          {errMsg}
        </p>  
      )}
    </>
  );
}

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
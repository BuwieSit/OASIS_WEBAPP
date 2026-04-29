import { Button } from "./button";
import Title from "../utilities/title";
import { useNavigate } from "react-router-dom";
import { clearToken } from "../api/token";
import { useAuth } from "../context/authContext";
import {
  sendOtp,
  verifyOtp,
  completeRegistration,
  sendResetOtp,
  verifyResetOtp,
  resetPassword
} from "../api/auth.service";
import Subtitle from "../utilities/subtitle";
import { Eye, EyeClosed, X } from "lucide-react";
import { Label } from "../utilities/label";
import useRegisterFlow from "../utils/RegisterFlow";
import useAuthFormLogic from "../utils/AuthFormLogic";
import { GeneralPopupModal } from "./popupModal";

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
    userTouched,
    setUserTouched,
    pwdTouched,
    setPwdTouched,
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
    matchTouched,
    setMatchTouched,
  } = useRegisterFlow({
    user,
    pwd,
    setErrMsg,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (step !== STEPS.PASSWORD) return;
  
    if (!validName || !validPwd || !validMatch) {
      setErrMsg("Invalid Entry");
      return;
    }

    try {
      clearToken();
      await completeRegistration(user, pwd, matchPwd);
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
        {errMsg && (
            <GeneralPopupModal
                title="Authentication Error"
                text={errMsg}
                icon={<X size={35} color="#800020" />}
                onClose={() => setErrMsg("")}
                isFailed
                time={4000}
            />
        )}
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
                              onBlur={() => setUserTouched(true)}
                              hasError={userTouched && !validName}
                            />
                        </div>
                        
                        <div className="w-full min-h-8 flex items-center justify-center">
                            <p id="uidnote" className={`text-[0.75rem] font-medium transition-all duration-300 ${userTouched && !validName ? "text-red-500 opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-2 pointer-events-none"}`}>
                                Must be a valid PUP webmail address
                            </p>
                        </div>
                        <Button
                            text="Send OTP"
                            type="button"
                            disabled={!validName}
                            onClick={async (e) => {
                                e.preventDefault();
                                try {
                                    await sendOtp(user);
                                    setStep(STEPS.OTP);
                                    setSecondsLeft(10 * 60);
                                    setResendSeconds(0);
                                    setCanResend(false);
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
                        <div className="text-center w-full">
                            <Label labelText={"Enter OTP"} fieldId={"otp"}/>
                            <ValidatedInputField
                                ref={otpRef}
                                type="text"
                                id="otp"
                                required
                                value={otp}
                                placeholder="6-digit OTP"
                                onChange={(e) => setOtp(e.target.value)}
                                ariaDescribedBy="otpnote"
                                onBlur={() => setOtpTouched(true)}
                                hasError={otpTouched && !validOtp}
                            />
                            <div className="w-full mt-2">
                                <Subtitle isItalic color={"text-oasis-gray"} text={secondsLeft > 0 ? `OTP expires in ${formattedTime}` : "OTP expired"}/>
                            </div>
                        </div>

                        <div className="w-full min-h-6 flex items-center justify-center">
                            <p id="otpnote" className={`text-[0.75rem] font-medium transition-all duration-300 ${otpTouched && !validOtp ? "text-red-500 opacity-100" : "opacity-0 pointer-events-none"}`}>
                                OTP must be a 6-digit number
                            </p>
                        </div>
                        
                        <Button
                            text="Verify OTP"
                            type="button"
                            disabled={!validOtp || secondsLeft <= 0}
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

                        {canResend && (
                          <div className="mt-2 text-center h-5">
                            {resendSeconds > 0 ? (
                              <p className="text-oasis-gray text-xs italic">
                                Resend OTP in {resendSeconds}s
                              </p>
                            ) : (
                              <button
                                type="button"
                                className="text-oasis-button-dark hover:text-oasis-button-light font-bold text-xs underline cursor-pointer"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  try {
                                    await sendOtp(user);
                                    setOtp("");
                                    setSecondsLeft(10 * 60);
                                    setResendSeconds(60);
                                    setCanResend(false);
                                    setErrMsg("");
                                  } catch {
                                    setErrMsg("Failed to send OTP");
                                  }
                                }}
                              >
                                Resend OTP
                              </button>
                            )}
                          </div>
                        )}
                    </>
                )}

                {/* PASSWORD */}
                {step === STEPS.PASSWORD && (
                  <>
                      <div className="text-center relative w-full">
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
                              onBlur={() => setPwdTouched(true)}
                              hasError={pwdTouched && !validPwd}
                          />

                          {showPassword ? 
                            <Eye color="#3E8679" className="absolute top-[65%] right-[5%] -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility} onMouseDown={(e) => e.preventDefault()}/> 
                          : 
                            <EyeClosed color="#3E8679" className="absolute top-[65%] right-[5%] -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility} onMouseDown={(e) => e.preventDefault()}/>
                          }
                      </div>

                      <div className="w-full min-h-8 flex items-center justify-center text-center">
                            <p id="pwdnote" className={`text-[0.7rem] leading-tight font-medium transition-all duration-300 ${pwdTouched && !validPwd ? "text-red-500 opacity-100" : "opacity-0 pointer-events-none"}`}>
                                Password must be 8+ characters with uppercase,<br/>number, and special character
                            </p>
                      </div>

                      <div className="text-center relative w-full">
                          <ValidatedInputField
                              type={showPassword ? "text" : "password"}
                              id="confirm_pwd"
                              placeholder="Re-enter password"
                              onChange={(e) => setMatchPwd(e.target.value)}
                              ariaInvalid={!validMatch}
                              ariaDescribedBy="matchnote"
                              required
                              onBlur={() => setMatchTouched(true)}
                              hasError={matchTouched && !validMatch}
                          />
                      </div>

                      <div className="w-full min-h-6 flex items-center justify-center">
                            <p id="matchnote" className={`text-[0.75rem] font-medium transition-all duration-300 ${matchTouched && !validMatch ? "text-red-500 opacity-100" : "opacity-0 pointer-events-none"}`}>
                                Passwords do not match
                            </p>
                      </div>
                      
                    <Button text="Register" type="submit" disabled={!validPwd || !validMatch} />
                  </>
            )}
          </form>
        </>
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
    userTouched,
    setUserTouched,
    pwdTouched,
    setPwdTouched,
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
      {errMsg && (
        <GeneralPopupModal
            title="Login Error"
            text={errMsg}
            icon={<X size={35} color="#800020" />}
            onClose={() => setErrMsg("")}
            isFailed
            time={4000}
        />
      )}
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
            onBlur={() => setUserTouched(true)}
            hasError={userTouched && !validName}
          />

          <div className="relative w-full">
            <Label labelText={"Password"} fieldId={"password"}/>
              <ValidatedInputField
                type={showPassword ? "text" : "password"}
                value={pwd}
                id="password"
                placeholder="Please enter password"
                onChange={(e) => setPwd(e.target.value)}
                required
                aria-invalid={!validPwd}
                onBlur={() => setPwdTouched(true)}
                onCopy={handleLogin}
                onCut={handleLogin}
                onPaste={handleLogin}
                hasError={pwdTouched && !validPwd}
              />
            {showPassword ? 
              <Eye color="#3E8679" className="absolute top-1/2 right-[5%] -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility} onMouseDown={(e) => e.preventDefault()}/> 
            : 
              <EyeClosed color="#3E8679" className="absolute top-1/2 right-[5%] -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility} onMouseDown={(e) => e.preventDefault()}/>}
          </div>
        </div>

        <Button text="Login" type="submit" disabled={!validName || !validPwd}/>
        <div className="w-full flex justify-center items-center h-fit">
            <div className="flex flex-col gap-1 w-full text-center">
                <div className="min-h-10 flex flex-col items-center justify-center">
                    <p className={`text-[0.75rem] font-medium transition-all duration-300 ${userTouched && !validName ? "text-red-500 opacity-100" : "opacity-0 pointer-events-none h-0"}`}>
                        Must be a valid PUP webmail address
                    </p>
                    <p className={`text-[0.75rem] font-medium transition-all duration-300 ${pwdTouched && !validPwd ? "text-red-500 opacity-100" : "opacity-0 pointer-events-none h-0"}`}>
                        Password must be at least 8 characters
                    </p> 
                </div>
            </div>
        </div>
        
      </form>
    </>
  );
}


export function ForgotPassword() {
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
    userTouched,
    setUserTouched,
    pwdTouched,
    setPwdTouched,
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
    matchTouched,
    setMatchTouched,
  } = useRegisterFlow({
    user,
    pwd,
    setErrMsg,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (step === STEPS.EMAIL) {
        if (!validName) return;
        await sendResetOtp(user);
        setStep(STEPS.OTP);
        setSecondsLeft(10 * 60);
        setResendSeconds(0);
        setCanResend(false);
      } else if (step === STEPS.OTP) {
        if (!validOtp) return;
        await verifyResetOtp(user, otp);
        setStep(STEPS.PASSWORD);
      } else if (step === STEPS.PASSWORD) {
        if (!validPwd || !validMatch) {
          setErrMsg("Invalid password entry");
          return;
        }
        await resetPassword(user, pwd, matchPwd);
        navigate("/access?form=login");
      }
    } catch (err) {
      console.error("Forgot Password Error:", err);
      setErrMsg(
        err?.response?.data?.error ||
        "An error occurred. Please try again."
      );
    }
  };

  return (
    <>
      {errMsg && (
        <GeneralPopupModal
            title="Password Reset Error"
            text={errMsg}
            icon={<X size={35} color="#800020" />}
            onClose={() => setErrMsg("")}
            isFailed
            time={4000}
        />
      )}
      <section className="w-full p-1 flex flex-col items-center justify-center gap-1">
        <Title text={"Forgot Password"} />
      </section>

      <form
        onSubmit={handleSubmit}
        className="w-full p-5 flex flex-col items-center justify-center gap-3"
      >

        {/* STEP 1 — WEBMAIL */}
        {step === STEPS.EMAIL && (
          <>
            <div className="w-full">
              <Label labelText={"PUP Webmail"} fieldId={"webMail"}/>

              <ValidatedInputField
                type="text"
                id="webMail"
                placeholder="Enter registered webmail"
                ref={userRef}
                autoComplete="off"
                required
                value={user}
                onChange={(e) => setUser(e.target.value)}
                ariaInvalid={validName ? "false" : "true"}
                ariaDescribedBy="uidnote"
                onBlur={() => setUserTouched(true)}
                hasError={userTouched && !validName}
              />
            </div>

            <div className="w-full min-h-8 flex items-center justify-center">
                <p id="uidnote" className={`text-[0.75rem] font-medium transition-all duration-300 ${userTouched && !validName ? "text-red-500 opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-2 pointer-events-none"}`}>
                    Must be a valid PUP webmail address
                </p>
            </div>

            <Button 
              text="Send OTP" 
              type="button" 
              disabled={!validName} 
              onClick={async () => {
                try {
                  await sendResetOtp(user);
                  setStep(STEPS.OTP);
                  setSecondsLeft(10 * 60);
                  setResendSeconds(0);
                  setCanResend(false);
                } catch (err) {
                  setErrMsg(err?.response?.data?.error || "Failed to send reset OTP");
                }
              }}
            />
          </>
        )}

        {/* STEP 2 — OTP */}
        {step === STEPS.OTP && (
          <>
            <div className="text-center w-full">
              <Label labelText={"Enter OTP"} fieldId={"otp"}/>
              <ValidatedInputField
                type="text"
                id="otp"
                placeholder="6-digit OTP"
                ref={otpRef}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                ariaInvalid={validOtp ? "false" : "true"}
                ariaDescribedBy="otpnote"
                onBlur={() => setOtpTouched(true)}
                hasError={otpTouched && !validOtp}
              />
              <div className="w-full mt-2">
                <Subtitle isItalic color={"text-oasis-gray"} text={secondsLeft > 0 ? `OTP expires in ${formattedTime}` : "OTP expired"}/>
              </div>
            </div>

            <div className="w-full min-h-6 flex items-center justify-center">
                <p id="otpnote" className={`text-[0.75rem] font-medium transition-all duration-300 ${otpTouched && !validOtp ? "text-red-500 opacity-100" : "opacity-0 pointer-events-none"}`}>
                    OTP must be a 6-digit number
                </p>
            </div>

            <Button 
                text="Verify OTP"
                type="button" 
                disabled={!validOtp || secondsLeft <= 0} 
                onClick={async () => {
                    try {
                      await verifyResetOtp(user, otp);
                      setStep(STEPS.PASSWORD);
                    } catch (err) {
                      setErrMsg(err?.response?.data?.error || "Invalid OTP");
                    }
                }}
              />

              {canResend && (
                <div className="mt-2 text-center h-5">
                  {resendSeconds > 0 ? (
                    <p className="text-oasis-gray text-xs italic">
                      Resend OTP in {resendSeconds}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      className="text-oasis-button-dark hover:text-oasis-button-light font-bold text-xs underline cursor-pointer"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          await sendResetOtp(user);
                          setOtp("");
                          setSecondsLeft(10 * 60);
                          setResendSeconds(60);
                          setCanResend(false);
                          setErrMsg("");
                        } catch (err) {
                          setErrMsg(err?.response?.data?.error || "Failed to send reset OTP");
                        }
                      }}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              )}
          </>
        )}

        {/* STEP 3 — NEW PASSWORD */}
        {step === STEPS.PASSWORD && (
          <>
            <div className="text-center relative w-full">
              <Label labelText={"New Password"} fieldId={"new_password"}/>
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
                onBlur={() => setPwdTouched(true)}
                hasError={pwdTouched && !validPwd}
              />

              {showPassword ? 
                <Eye color="#3E8679" className="absolute top-[65%] right-[5%] -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility} onMouseDown={(e) => e.preventDefault()}/> 
              : 
                <EyeClosed color="#3E8679" className="absolute top-[65%] right-[5%] -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility} onMouseDown={(e) => e.preventDefault()}/>
              }
            </div>

            <div className="w-full min-h-8 flex items-center justify-center text-center">
                <p id="pwdnote" className={`text-[0.7rem] leading-tight font-medium transition-all duration-300 ${pwdTouched && !validPwd ? "text-red-500 opacity-100" : "opacity-0 pointer-events-none"}`}>
                    Password must be 8+ characters with uppercase,<br/>number, and special character
                </p>
            </div>

            <div className="text-center relative w-full">
              <ValidatedInputField
                type={showPassword ? "text" : "password"}
                id="confirm_password"
                placeholder="Confirm Password"
                required
                value={matchPwd}
                onChange={(e) => setMatchPwd(e.target.value)}
                ariaInvalid={validMatch ? "false" : "true"}
                ariaDescribedBy="matchnote"
                onBlur={() => setMatchTouched(true)}
                hasError={matchTouched && !validMatch}
              />
            </div>

            <div className="w-full min-h-6 flex items-center justify-center">
                <p id="matchnote" className={`text-[0.75rem] font-medium transition-all duration-300 ${matchTouched && !validMatch ? "text-red-500 opacity-100" : "opacity-0 pointer-events-none"}`}>
                    Passwords do not match
                </p>
            </div>

            <Button
              text="Reset Password"
              type="submit"
              disabled={!validPwd || !validMatch}
            />
          </>
        )}
      </form>
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
  hasError
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

          className={`w-full p-3 border-b-2 transition-all duration-300 focus:outline-none ${
            hasError 
            ? "border-red-500 focus:border-red-600 bg-red-50/10" 
            : "border-oasis-light focus:border-oasis-aqua"
          }`}
      />
    </>
  )
}
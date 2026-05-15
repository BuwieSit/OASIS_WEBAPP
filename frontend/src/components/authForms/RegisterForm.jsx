import { useNavigate } from "react-router-dom";
import { clearToken } from "../../api/token";
import { sendOtp, verifyOtp, completeRegistration } from "../../api/auth.service";
import useRegisterFlow from "../../utils/RegisterFlow";
import useAuthFormLogic from "../../utils/AuthFormLogic";
import { GeneralPopupModal } from "../popupModal";
import Title from "../../utilities/title";
import { Label } from "../../utilities/label";
import { Button } from "../button";
import Subtitle from "../../utilities/subtitle";
import { Eye, EyeClosed, X } from "lucide-react";
import { ValidatedInputField } from "./ValidatedInputField";

export default function RegisterForm() {
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
    userTouched,
    setUserTouched,
    pwdTouched,
    setPwdTouched,
    showPassword,
    togglePasswordVisibility,
    isSubmitting,
    setIsSubmitting,
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
    isSendingOtp,
    setIsSendingOtp,
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

    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
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
        <section className="w-full p-1 flex flex-col items-center justify-center gap-1">
          <Title text={"Register"} />
        </section>

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
                        text={isSendingOtp ? "Sending OTP..." : "Send OTP"}
                        type="button"
                        disabled={!validName || isSendingOtp}
                        onClick={async (e) => {
                            e.preventDefault();
                            setIsSendingOtp(true);
                            try {
                                await sendOtp(user);
                                setStep(STEPS.OTP);
                                setSecondsLeft(10 * 60);
                                setResendSeconds(0);
                                setCanResend(false);
                            } catch (err) {
                                setErrMsg(err?.response?.data?.error || err?.response?.data?.message || "Failed to send OTP");
                            } finally {
                                setIsSendingOtp(false);
                            }
                        }}
                    />
                </>
            )}

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
                            <Subtitle isCenter isItalic color={"text-oasis-gray"} text={secondsLeft > 0 ? `OTP expires in ${formattedTime}` : "OTP expired"}/>
                            <Subtitle isCenter isItalic color={"text-oasis-gray"} size="text-[0.7rem]" text={"Check your junk/spam folder if you don't see the email."} className="mt-1" />
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
                                await verifyOtp(user, otp);
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
                  
                <Button text={isSubmitting ? "Registering..." : "Register"} type="submit" disabled={!validPwd || !validMatch || isSubmitting} />
              </>
            )}
        </form>
    </>
  );
}

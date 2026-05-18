import { useNavigate } from "react-router-dom";
import { sendResetOtp, verifyResetOtp, resetPassword } from "../../api/auth.service";
import useRegisterFlow from "../../utils/RegisterFlow";
import useAuthFormLogic from "../../utils/AuthFormLogic";
import Title from "../../utilities/title";
import { Label } from "../../utilities/label";
import { Button } from "../button";
import Subtitle from "../../utilities/subtitle";
import { Eye, EyeClosed } from "lucide-react";
import { ValidatedInputField } from "./ValidatedInputField";
import { useNotification } from "../../context/NotificationContext";

export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const {
    userRef,
    user,
    setUser,
    pwd,
    setPwd,
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
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
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
          showNotification({
            title: "Password Reset Error",
            text: "Invalid password entry. Please check the requirements.",
            type: "failed"
          });
          return;
        }
        await resetPassword(user, pwd, matchPwd);
        navigate("/access?form=login");
      }
    } catch (err) {
      // Axios interceptor will handle the popup for API errors
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
              text={isSendingOtp ? "Sending OTP..." : "Send OTP"} 
              type="button" 
              disabled={!validName || isSendingOtp} 
              onClick={async () => {
                setIsSendingOtp(true);
                try {
                  await sendResetOtp(user);
                  setStep(STEPS.OTP);
                  setSecondsLeft(10 * 60);
                  setResendSeconds(0);
                  setCanResend(false);
                } catch (err) {
                  // Handled by Axios interceptor
                } finally {
                  setIsSendingOtp(false);
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
                onClick={async () => {
                    try {
                      await verifyResetOtp(user, otp);
                      setStep(STEPS.PASSWORD);
                    } catch (err) {
                      // Handled by Axios interceptor
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
                        } catch (err) {
                          // Handled by Axios interceptor
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
              text={isSubmitting ? "Resetting..." : "Reset Password"}
              type="submit"
              disabled={!validPwd || !validMatch || isSubmitting}
            />
          </>
        )}
      </form>
    </>
  );
}

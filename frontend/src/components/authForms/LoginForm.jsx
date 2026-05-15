import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import useAuthFormLogic from "../../utils/AuthFormLogic";
import Title from "../../utilities/title";
import { Label } from "../../utilities/label";
import { Button } from "../button";
import { Eye, EyeClosed, X } from "lucide-react";
import { ValidatedInputField } from "./ValidatedInputField";
import { useNotification } from "../../context/NotificationContext";

export default function LoginForm() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
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
  } = useAuthFormLogic({ allowAdmin: true });

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validPwd) {
      showNotification({
        title: "Login Error",
        text: "Invalid Password format.",
        type: "failed"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginUser(user, pwd);
      const redirectPath = res.role === "ADMIN" ? "/admin" : "/home";
      navigate(redirectPath, { replace: true });
    } catch (err) {
      // Axios interceptor will handle the popup for API errors
    } finally {
      setIsSubmitting(false);
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

        <Button text={isSubmitting ? "Logging in..." : "Login"} type="submit" disabled={!validName || !validPwd || isSubmitting}/>
        <div className="w-full flex justify-center items-center h-fit">
            <div className="flex flex-col gap-1 w-full text-center">
                <div className="min-h-10 flex flex-col items-center justify-center">
                    <p className={`text-[0.75rem] font-medium transition-all duration-300 ${userTouched && !validName ? "text-red-500 opacity-100" : "opacity-0 pointer-events-none h-0"}`}>
                        Must be a valid PUP webmail address
                    </p>
                    <p className={`text-[0.75rem] font-medium transition-all duration-300 ${pwdTouched && !validPwd ? "text-red-500 opacity-100" : "opacity-0 pointer-events-none h-0"}`}>
                        Password must be at least 8 characters with atleast 1 uppercase letter and special character
                    </p> 
                </div>
            </div>
        </div>
      </form>
    </>
  );
}

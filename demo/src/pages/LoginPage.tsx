/** biome-ignore-all lint/correctness/useUniqueElementIds: test ids for playwright */
import { useLink, useLogin, useTranslate } from "@refinedev/core";
import { type LoginArgs, useOtp } from "refine-pocketbase";

export const LoginPage = () => {
  const Link = useLink();
  const { mutate: login } = useLogin<LoginArgs>();
  const otpHandler = useOtp();
  const translate = useTranslate();
  
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if(otpHandler.isPending) {
      otpHandler.resolve(
        formData.get("otp") as string,
      );
    } else {
      login({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        otpHandler,
        translate,
      });
    }
  }

  return (
    <div>
      <h1>Sign in to your account</h1>
      <hr />
      <form onSubmit={handleLogin}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
        />
        <label htmlFor="register-password">Password</label>
        <input
          id="login-password"
          type="password"
          name="password"
          size={20}
        />
        {otpHandler.isPending && (
          <>
            <label htmlFor="login-otp">OTP</label>
            <input
              id="login-otp"
              type="text"
              name="otp"
  
              size={20}
            />
            <input
              onClick={otpHandler.reject}
              type="button"
              value="cancel"
            />
          </>
        )}
        <input
          id="login-submit"
          type="submit"
          value="Sign in"
        />
        <br />
        <Link to="/forgot-password">Forgot password?</Link>
      </form>
      <div>
        Don’t have an account?
        <Link to="/register">Sign up</Link>
      </div>
    </div>
  );
};

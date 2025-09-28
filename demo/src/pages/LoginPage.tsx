/** biome-ignore-all lint/correctness/useUniqueElementIds: test ids for playwright */
import { useGo, useLink, useLogin, useParsed } from "@refinedev/core";
import { useEffect, useState } from "react";
import type { LoginArgs, LoginQueryParams } from "refine-pocketbase";
import { omit } from "remeda";

export const LoginPage = () => {
  const Link = useLink();
  const go = useGo();
  const { params } = useParsed<LoginQueryParams>();
  const isOtp = params?.mfaId != null || params?.otpId != null;
  const { mutate: login } = useLogin<LoginArgs>();
  const [redirectTo, setRedirectTo] = useState<string>();

  /**
   * Workaround:
   * the `to` parameter invalidates any custom forwarding targets such as `otpRedirectTo`
   * effectively dropping MFA params that are necessary for OTP field to appear
   * so we remove that parameter from the search query for manual handling
   */
  useEffect(() => {
    if(params?.to) {
      setRedirectTo(params.to);
      go({
        query: omit(params, ["to"]),
        type: "replace",
      })
    }
  },[go, params])
  
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if(isOtp) {
      login({
        otp: formData.get("otp") as string,
        mfaId: params?.mfaId,
        otpId: params?.otpId,
        redirectTo,
      });
    } else {
      login({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirectTo,
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
          required
        />
        <label htmlFor="register-password">Password</label>
        <input
          id="login-password"
          type="password"
          name="password"
          required
          size={20}
        />
        {isOtp && (
          <>
            <label htmlFor="login-otp">OTP</label>
            <input
              id="login-otp"
              type="text"
              name="otp"
              required
              size={20}
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

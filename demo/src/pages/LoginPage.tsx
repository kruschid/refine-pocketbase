import { useLink, useLogin, useTranslate } from "@refinedev/core";
import React, { useState } from "react";
import { LoginWithPassword } from "refine-pocketbase";

export const LoginPage: React.FC = () => {
  const Link = useLink();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const translate = useTranslate();
  const { mutate: login } = useLogin<LoginWithPassword>();

  return (
    <div>
      <h1>
        {translate("pages.login.title", "Sign in to your account")}
      </h1>
      <hr />
      <form onSubmit={(e) => {
        e.preventDefault();
        login({ email, password });
      }}>
        <label htmlFor="login-email">
          {translate("pages.login.fields.email", "Email")}
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="register-password">
          {translate("pages.login.fields.password", "Password")}
        </label>
        <input
          id="login-password"
          type="password"
          name="password"
          required
          size={20}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <Link to="/forgot-password">
          {translate(
            "pages.login.buttons.forgotPassword",
            "Forgot password?",
          )}
        </Link>
        <input
          id="login-submit"
          type="submit"
          value={translate("pages.login.signin", "Sign in")}
        />
      </form>
      <div>
        {translate("pages.login.buttons.noAccount", "Don’t have an account?")}{" "}
        <Link to="/register">{translate("pages.login.register", "Sign up")}</Link>
      </div>
    </div>
  );
};
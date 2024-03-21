import { RegisterPageProps, useLink, useRegister, useTranslate } from "@refinedev/core";
import { DivPropsType, FormPropsType } from "@refinedev/core/dist/components/pages/auth";
import { useState } from "react";
import { getHttpErrorField, isHttpError } from "../utils/errors";

type RegisterProps = RegisterPageProps<
  DivPropsType,
  DivPropsType,
  FormPropsType
>;

export const RegisterPage: React.FC<RegisterProps> = () => {
  const Link = useLink();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const translate = useTranslate();

  const { mutate: register, isLoading, data } = useRegister();

  return (
    <div>
      <h1>Sign up for your account</h1>
      <hr />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          register({ email, password });
        }}
      >
        {data?.error && (
          <p id="register-error">
            {data.error.message}
          </p>
        )}
        <label htmlFor="register-email">
          {translate("pages.register.fields.email", "Email")}
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {isHttpError(data?.error) && (
          <p id="register-email-error">
            {getHttpErrorField(data.error, "email")}
          </p>
        )}
        <label htmlFor="register-password">
          {translate("pages.register.fields.password", "Password")}
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {isHttpError(data?.error) && (
          <p id="register-password-error">
            {getHttpErrorField(data.error, "password")}
          </p>
        )}
        <input
          id="register-submit"
          type="submit"
          value={translate("pages.register.buttons.submit", "Sign up")}
          disabled={isLoading}
        />
      </form>
      <div>
        {translate("pages.login.buttons.haveAccount", "Have an account?")}{" "}
        <Link to="/login" id="register-submit">{translate("pages.login.signin", "Sign in")}</Link>
      </div>
    </div >
  );
};

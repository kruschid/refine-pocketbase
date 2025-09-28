/** biome-ignore-all lint/correctness/useUniqueElementIds: usage of test ids for playwright  */
import { useLink, useRegister, useTranslate } from "@refinedev/core";
import { getHttpErrorField, isHttpError } from "../utils/errors";

export const RegisterPage = () => {
  const Link = useLink();

  const translate = useTranslate();

  const { mutate: register, isPending, data } = useRegister();

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    register({ email, password });
  }

  return (
    <div>
      <h1>Sign up for your account</h1>
      <hr />
      <form onSubmit={handleRegister}>
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
          disabled={isPending}
        />
      </form>
      <div>
        {translate("pages.login.buttons.haveAccount", "Have an account?")}{" "}
        <Link to="/login" id="register-submit">{translate("pages.login.signin", "Sign in")}</Link>
      </div>
    </div >
  );
};

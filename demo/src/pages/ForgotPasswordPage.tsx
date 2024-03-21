import { ForgotPasswordFormTypes, useForgotPassword, useTranslate } from "@refinedev/core";
import React, { useState } from "react";
import { getHttpErrorField, isHttpError } from "../utils/errors";

export const ForgotPasswordPage: React.FC = () => {
  const translate = useTranslate();

  const [email, setEmail] = useState("");

  const { mutate: forgotPassword, isLoading, data } =
    useForgotPassword<ForgotPasswordFormTypes>();

  return (
    <>
      <h1>
        {translate(
          "pages.forgotPassword.title",
          "Forgot your password?",
        )}
      </h1>
      <hr />
      {data?.success && (
        <p id="forgot-password-success">Please check your mailbox for the token</p>
      )}
      <form onSubmit={(e) => {
        e.preventDefault();
        forgotPassword({ email });
      }}>
        <label htmlFor="email-input">
          {translate(
            "pages.forgotPassword.fields.email",
            "Email",
          )}
        </label>
        <input
          id="email-input"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {isHttpError(data?.error) && (
          <p id="forgot-password-error">
            {getHttpErrorField(data.error, "email")}
          </p>
        )}
        <input
          type="submit"
          disabled={isLoading}
          value={translate(
            "pages.forgotPassword.buttons.submit",
            "Send reset instructions",
          )}
        />
      </form>
    </>
  );
};

/** biome-ignore-all lint/correctness/useUniqueElementIds: test ids for playwright */
import { useForgotPassword, useTranslate } from "@refinedev/core";
import type { ForgotPasswordArgs } from "refine-pocketbase";
import { getHttpErrorField, isHttpError } from "../utils/errors";

export const ForgotPasswordPage = () => {
  const translate = useTranslate();

  const { mutate: forgotPassword, isPending, data } =
    useForgotPassword<ForgotPasswordArgs>();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    forgotPassword({ email });
  }

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
      <form onSubmit={handleSubmit}>
        <label htmlFor="email-input">
          {translate(
            "pages.forgotPassword.fields.email",
            "Email",
          )}
        </label>
        <input
          id="email-input"
          name="email"
        />
        {isHttpError(data?.error) && (
          <p id="forgot-password-error">
            {getHttpErrorField(data.error, "email")}
          </p>
        )}
        <input
          type="submit"
          disabled={isPending}
          value={translate(
            "pages.forgotPassword.buttons.submit",
            "Send reset instructions",
          )}
        />
      </form>
    </>
  );
};

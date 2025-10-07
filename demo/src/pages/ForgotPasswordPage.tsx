/** biome-ignore-all lint/correctness/useUniqueElementIds: test ids for playwright */
import { useForgotPassword, useTranslate } from "@refinedev/core";
import type { ForgotPasswordArgs } from "refine-pocketbase";

export const ForgotPasswordPage = () => {
  const translate = useTranslate();

  const { mutate: forgotPassword, isPending } =
    useForgotPassword<ForgotPasswordArgs>();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    forgotPassword({ email, translate });
  }

  return (
    <>
      <h1>
        Forgot your password?
      </h1>
      <hr />
      <form onSubmit={handleSubmit}>
        <label htmlFor="email-input">
          Email
        </label>
        <input
          id="email-input"
          name="email"
        />
        <input
          type="submit"
          disabled={isPending}
          value="Send reset instructions"
        />
      </form>
    </>
  );
};

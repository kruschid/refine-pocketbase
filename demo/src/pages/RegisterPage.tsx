/** biome-ignore-all lint/correctness/useUniqueElementIds: usage of test ids for playwright  */
import { useLink, useRegister, useTranslate } from "@refinedev/core";

export const RegisterPage = () => {
  const Link = useLink();

  const translate = useTranslate();

  const { mutate: register, isPending } = useRegister();

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    register({ email, password, translate });
  }

  return (
    <div>
      <h1>Sign up for your account</h1>
      <hr />
      <form onSubmit={handleRegister}>
        <label htmlFor="register-email">
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          required
        />
        <label htmlFor="register-password">
          Password
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          required
        />
        <input
          id="register-submit"
          type="submit"
          value={translate("pages.register.buttons.submit", "Sign up")}
          disabled={isPending}
        />
      </form>
      <div>
        Have an account?{" "}
        <Link to="/login" id="register-submit">Sign in</Link>
      </div>
    </div >
  );
};

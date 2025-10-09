/** biome-ignore-all lint/correctness/useUniqueElementIds: usage of test ids for playwright required */
import { useParsed, useTranslate, useUpdatePassword } from "@refinedev/core";

export const UpdatePasswordPage = () => {
  const translate = useTranslate();
  const { mutate: updatePassword, isPending } = useUpdatePassword();

  const { params } = useParsed<{ token: string }>();
  const token = params?.token;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (token) {
      updatePassword({
        password,
        confirmPassword,
        token,
        translate,
      });
    }
  };

  return (
    <>
      <h1>Update Password</h1>
      <hr />
      <form onSubmit={handleSubmit}>
        <label htmlFor="password-input">New Password</label>
        <input id="password-input" name="password" type="password" />
        <label htmlFor="confirm-password-input">Confirm New Password</label>
        <input
          id="confirm-password-input"
          name="confirmPassword"
          type="password"
        />
        <input type="submit" disabled={isPending} value="Update" />
      </form>
    </>
  );
};

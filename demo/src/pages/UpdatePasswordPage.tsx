import { useParsed, useTranslate, useUpdatePassword } from "@refinedev/core";
import React, { useState } from "react";
import { UpdatePasswordProps } from "refine-pocketbase";
import { getHttpErrorField, isHttpError } from "../utils/errors";

export const UpdatePasswordPage: React.FC = () => {
  const translate = useTranslate();
  const { mutate: updatePassword, isLoading, data } = useUpdatePassword<UpdatePasswordProps>();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { params } = useParsed<{ token: string }>();
  const token = params?.token;

  console.log(token);

  return (
    <>
      <h1>
        {translate("pages.updatePassword.title", "Update Password")}
      </h1>
      <hr />
      {isHttpError(data?.error) && (
        <p id="token-error">
          {getHttpErrorField(data.error, "token")}
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (token) {
            updatePassword({
              password: newPassword,
              confirmPassword,
              token,
            });
          }
        }}
      >
        <label htmlFor="password-input">
          {translate("pages.updatePassword.fields.password", "New Password")}
        </label>
        <input
          id="password-input"
          name="password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        {isHttpError(data?.error) && (
          <p id="password-input-error">
            {getHttpErrorField(data.error, "password")}
          </p>
        )}
        <label htmlFor="confirm-password-input">
          {translate(
            "pages.updatePassword.fields.confirmPassword",
            "Confirm New Password",
          )}
        </label>
        <input
          id="confirm-password-input"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {isHttpError(data?.error) && (
          <p id="confirm-password-input-error">
            {getHttpErrorField(data.error, "passwordConfirm")}
          </p>
        )}
        <input
          type="submit"
          disabled={isLoading}
          value={translate("pages.updatePassword.buttons.submit", "Update")}
        />
      </form>
    </>
  );
};

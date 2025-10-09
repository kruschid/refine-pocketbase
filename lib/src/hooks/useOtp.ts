import { useCallback, useEffect, useState } from "react";

export type OtpHandler = ReturnType<typeof useOtp>;

export const useOtp = () => {
  const [otpPromise, setOtpPromise] = useState<{
    resolve: (otp: string) => void;
    reject: () => void;
  }>();

  useEffect(() => {
    return () => {
      otpPromise?.reject();
    };
  }, [otpPromise]);

  const request = useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      setOtpPromise({ resolve, reject });
    });
  }, []);

  const reject = useCallback(() => {
    otpPromise?.reject();
    setOtpPromise(undefined);
  }, [otpPromise]);

  const resolve = useCallback(
    (otp: string) => {
      otpPromise?.resolve(otp);
      setOtpPromise(undefined);
    },
    [otpPromise],
  );

  const isPending = !!otpPromise;

  return {
    isPending,
    request,
    reject,
    resolve,
  };
};

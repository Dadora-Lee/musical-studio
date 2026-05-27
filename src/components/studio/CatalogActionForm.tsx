"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";

export type CatalogActionState = {
  message: string;
  ok: boolean;
  resetKey: number;
};

const initialState: CatalogActionState = {
  message: "",
  ok: false,
  resetKey: 0
};

export function CatalogActionForm({
  action,
  children,
  className,
  resetOnSuccess = true
}: {
  action: (state: CatalogActionState, formData: FormData) => Promise<CatalogActionState>;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useFormState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && resetOnSuccess) {
      formRef.current?.reset();
    }
  }, [resetOnSuccess, state.ok, state.resetKey]);

  return (
    <form action={formAction} className={className} ref={formRef}>
      {state.message ? (
        <div
          className={`rounded-md px-3 py-2 text-xs font-black ${state.ok ? "bg-teal-50 text-teal-800" : "bg-rose-50 text-rose-800"}`}
          role="status"
        >
          {state.message}
        </div>
      ) : null}
      {children}
    </form>
  );
}

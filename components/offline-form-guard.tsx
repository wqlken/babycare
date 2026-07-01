"use client";

import { useEffect, useState } from "react";

export const NETWORK_UNAVAILABLE_MESSAGE =
  "当前网络不可用，请恢复连接后再保存。";

export function shouldBlockSubmitWhenOffline(isOnline: boolean) {
  if (isOnline) {
    return {
      block: false,
      message: null,
    };
  }

  return {
    block: true,
    message: NETWORK_UNAVAILABLE_MESSAGE,
  };
}

export function OfflineFormGuard() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function handleSubmit(event: SubmitEvent) {
      const result = shouldBlockSubmitWhenOffline(window.navigator.onLine);

      if (!result.block) return;

      event.preventDefault();
      event.stopPropagation();
      setMessage(result.message);
    }

    document.addEventListener("submit", handleSubmit, true);
    return () => document.removeEventListener("submit", handleSubmit, true);
  }, []);

  if (!message) return null;

  return (
    <div
      className="fixed inset-x-4 bottom-4 z-50 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-lg"
      role="alert"
    >
      {message}
    </div>
  );
}

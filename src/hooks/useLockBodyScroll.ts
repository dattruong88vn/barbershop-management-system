"use client";

import { useEffect } from "react";

let bodyScrollLockCount = 0;
let previousBodyOverflow = "";
let previousHtmlOverflow = "";

export function useLockBodyScroll(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    if (bodyScrollLockCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      previousHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    bodyScrollLockCount += 1;

    return () => {
      bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1);

      if (bodyScrollLockCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousHtmlOverflow;
      }
    };
  }, [isLocked]);
}

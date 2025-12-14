"use client";

import { useEffect } from "react";
import semver from "semver";
import { toast } from "sonner";

import { checkUpdate } from "~/utils";

export function UpdateNotice() {
  useEffect(() => {
    async function checkForUpdates() {
      const latestVersion = await checkUpdate();
      if (semver.gt(latestVersion, process.env.APP_VERSION!)) {
        toast.info(
          `업데이트 가능한 버전이 있습니다! (최신: ${latestVersion}, 현재: ${process.env.APP_VERSION})`,
        );
      }
    }

    checkForUpdates();
  }, []);
  return <></>;
}

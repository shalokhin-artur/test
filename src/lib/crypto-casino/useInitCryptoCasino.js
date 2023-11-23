import { useEffect, useState } from "react";
import assetManifest from "./asset-manifest.json";

const INITIAL_SCRIPT_ID = "crypto-casino-script-id";
const INITIAL_CSS_ID = "crypto-casino-css-id";

export const useInitCryptoCasino = (ref, language) => {
  const [isJSLoading, setIsJSLoading] = useState(true);
  const [isCssLoading, setIsCssLoading] = useState(true);
  const isLoading = isJSLoading || isCssLoading;

  useEffect(() => {
    const body = document.getElementsByTagName("body")[0];
    const scriptTag = document.createElement("script");
    scriptTag.async = true;
    scriptTag.id = INITIAL_SCRIPT_ID;
    scriptTag.src = assetManifest.files["main.js"];
    scriptTag.onload = () => {
      setIsJSLoading(false);
    };
    body.appendChild(scriptTag);

    const cssTag = document.createElement("link");
    cssTag.async = true;
    cssTag.id = INITIAL_CSS_ID;
    cssTag.href = assetManifest.files["main.css"];
    cssTag.rel = "stylesheet";
    cssTag.onload = () => {
      setIsCssLoading(false);
    };
    document.head.appendChild(cssTag);

    return () => {
      scriptTag.remove();
      cssTag.remove();
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      window.cryptoCasino.init(ref.current, language);
    }
  }, [isLoading, ref, language]);

  return {
    isLoading: isJSLoading && isCssLoading,
  };
};

import { useState, useEffect } from "react";

export default function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("mysafra-theme") || "dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-mode");
    } else {
      root.classList.remove("light-mode");
    }
    localStorage.setItem("mysafra-theme", theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === "dark" ? "light" : "dark");

  return { theme, toggle };
}
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const DarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  // Run once on mount to set theme based on localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else if (storedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      // No preference saved, fallback to system
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all ${
          isDark ? "scale-0 rotate-90 absolute" : "scale-100 rotate-0"
        }`}
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] transition-all ${
          isDark ? "scale-100 rotate-0" : "scale-0 -rotate-90 absolute"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default DarkMode;

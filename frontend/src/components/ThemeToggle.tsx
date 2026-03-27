"use client";
 
import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
 
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
 
  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);
 
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg opacity-0">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }
 
  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };
 
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={cycleTheme}
      className={cn(
        "h-9 w-9 rounded-lg hover:bg-muted transition-all relative flex items-center justify-center",
        theme === "system" && "text-primary"
      )}
      title={`Current: ${theme} (Click to cycle)`}
    >
      <div className="relative h-[1.2rem] w-[1.2rem]">
        <Sun className={cn(
          "absolute h-full w-full transition-all duration-300",
          theme === "light" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
        )} />
        <Moon className={cn(
          "absolute h-full w-full transition-all duration-300",
          theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
        )} />
        <Monitor className={cn(
          "absolute h-full w-full transition-all duration-300",
          theme === "system" ? "scale-100 rotate-0 opacity-100 text-primary" : "scale-0 rotate-90 opacity-0"
        )} />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <div>
      <Button
        size={"sm"}
        onClick={() => setTheme("dark")}
        className="dark:hidden block "
        variant={"ghost"}
      >
        <Sun className="h-[1.2rem] w-[1.2rem]  scale-100 dark:scale-0" />
      </Button>

      <Button
        size={"sm"}
        onClick={() => setTheme("light")}
        className="dark:block hidden"
        variant={"ghost"}
      >
        <Moon className=" h-[1.2rem] w-[1.2rem]  scale-0  dark:scale-100" />
      </Button>
    </div>
  );
}

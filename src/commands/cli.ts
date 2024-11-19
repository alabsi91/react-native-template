import { z } from "zod";
import { createCli } from "zod-args-parser";

const parseArr = (val: unknown) => {
  if (typeof val === "string") {
    return val
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }
  return val;
};

// CLI when no subcommands are provided
export const cliSchema = createCli({
  cliName: "rn-template",
  description: "Create new React-Native project.",
  options: [
    {
      name: "name",
      aliases: ["n"],
      description: "Project name",
      type: z.string().optional(),
    },
    {
      name: "platform",
      aliases: ["p"],
      description: "Platform to create project for (Web, Android, IOS or Windows)",
      example: "--platform android,ios,web,windows",
      type: z.preprocess(parseArr, z.array(z.enum(["android", "ios", "web", "windows"]))).optional(),
    },
    {
      name: "libs",
      aliases: ["l"],
      description: "Additional libraries to install",
      example: "--libs react-native-reanimated,react-native-screens",
      type: z.preprocess(parseArr, z.array(z.string())).optional(),
    },
    {
      name: "jest",
      aliases: ["j"],
      description: "Whether to keep the jest or not",
      type: z.boolean().optional(),
    },
    {
      name: "install",
      aliases: ["i"],
      description: "Whether to install dependencies or not",
      type: z.boolean().optional(),
    },
    {
      name: "help",
      aliases: ["h"],
      description: "Show this help message",
      type: z.boolean().optional(),
    },
  ],
});

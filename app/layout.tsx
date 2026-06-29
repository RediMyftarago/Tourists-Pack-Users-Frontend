import type React from "react";
import "./styles.css";
import { ThemeProvider } from "next-themes";
import AssistantChat from "@/components/AssistantChat";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem>
          {children}
          <AssistantChat />
        </ThemeProvider>
      </body>
    </html>
  );
}

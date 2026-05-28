import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "VedaAI — AI Assessment Creator",
  description: "Create AI-powered question papers instantly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "500",
            },
          }}
        />
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ClientProvider from "./ClientProvider";
import { Toaster } from "sonner";
import {dark} from "@clerk/themes";

export const metadata: Metadata = {
  title: "Covalency",
  description: "Created by Vaibhav Sanket",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{baseTheme: dark }}>
      <html lang="en">
        <body>
          <ClientProvider>
            <Toaster theme="light" position="bottom-center" />
            {children}
          </ClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

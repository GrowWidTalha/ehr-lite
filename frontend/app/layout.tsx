import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { BackupReminderWrapper } from "@/components/backup-reminder-wrapper";
import { NavBar } from "@/components/navigation/navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "JPMC - Oncology Department",
  description: "Oncology patient management and electronic health records",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <BackupReminderWrapper />
          <div className="min-h-screen bg-background">
            <NavBar />
            <main className="min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

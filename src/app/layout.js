import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TelegramInit from "./components/TelegramInit";
import { AuthProvider } from "./context/AuthContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cirrus Approvo",
  description: "Cirrus Approvo is a platform for approving and managing documents.",
};

export const viewport = {
  width: "422",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TelegramInit />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

import { Onest } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
});

export const metadata = {
  title: "Cirrus Approvo",
  description: "Cirrus Approvo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${onest.variable} antialiased`}>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}

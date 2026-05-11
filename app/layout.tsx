import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "@/components/ui/Toaster";

export const metadata: Metadata = {
  title: "HomeDesign — Plan Your Perfect Space",
  description:
    "Design your home room by room. Upload furniture, visualize in 3D, and explore community suggestions.",
  openGraph: {
    title: "HomeDesign",
    description: "Plan your perfect space with 3D room design.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

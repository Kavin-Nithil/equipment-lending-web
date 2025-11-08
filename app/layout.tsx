// app/layout.tsx
import "./globals.css";   // ✅ global import goes here

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

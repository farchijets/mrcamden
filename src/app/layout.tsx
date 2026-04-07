import "./globals.css";

// Root layout is a passthrough; [locale]/layout.tsx renders <html>/<body>
// so we can set lang and dir per locale.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

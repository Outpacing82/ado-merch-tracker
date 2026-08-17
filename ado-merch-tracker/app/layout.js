export const metadata = {
  title: "Ado Merch Tracker",
  description: "Watches the official Ado shop for new drops and restocks.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0b0b0d", color: "#f2f2f2" }}>
        {children}
      </body>
    </html>
  );
}

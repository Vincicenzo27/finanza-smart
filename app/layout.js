export const metadata = {
  title: 'Finanza Smart',
  description: 'Personal Finance Tracker',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}

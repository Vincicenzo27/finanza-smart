export const metadata = {
  title: 'FinAuto AI',
  description: 'Personal Finance Tracker',
}

export const viewport = {
  themeColor: '#090d16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it" style={{ backgroundColor: '#090d16' }}>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        backgroundColor: '#090d16',
        color: '#f8fafc',
        overflowX: 'hidden'
      }}>
        {children}
      </body>
    </html>
  )
}

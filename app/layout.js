import './globals.css';

export const metadata = {
  title: 'FinAuto AI',
  description: 'Tracciamento Finanziario Smart',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="bg-[#070b12] text-white antialiased select-none">
        {children}
      </body>
    </html>
  );
}

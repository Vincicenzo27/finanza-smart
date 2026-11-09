import './globals.css';

export const metadata = {
  title: 'FinAuto AI',
  description: 'Tracciamento Finanziario Smart',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-[#070b12] text-white antialiased select-none">
        {children}
      </body>
    </html>
  );
}

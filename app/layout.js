import './globals.css';

export const metadata = {
  title: 'Finanza Smart',
  description: 'Gestione finanziaria personale smart',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="bg-slate-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}

export const metadata = {
  title: 'Finanza Smart',
  description: 'Gestione finanziaria personale smart',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-950 text-white min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

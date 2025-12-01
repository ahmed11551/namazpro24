import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NamazPro24 - Духовный путь',
  description: 'Приложение для отслеживания намазов, зикров и духовных целей',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <script
          src="https://telegram.org/js/telegram-web-app.js"
          async
        />
      </head>
      <body>{children}</body>
    </html>
  );
}


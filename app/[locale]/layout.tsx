import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import "../globals.css";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Miicel.io',
  description: 'Red de comercios descentralizada',
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body className="antialiased" suppressHydrationWarning>
                <NextIntlClientProvider messages={messages}>
                    {children}
                    <Toaster position="top-right" />
                    <Analytics />
                    <SpeedInsights />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

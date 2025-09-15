import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { HeroUIProviderWrapper } from "@/providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
        icon: "/favicon.ico",
    },
};

export const viewport: Viewport = {
    themeColor: "black",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html suppressHydrationWarning lang="en" style={{ backgroundColor: '#1E1946' }}>
            <head />
            <body
                className={clsx(
                    "min-h-screen font-sans antialiased",
                    fontSans.variable
                )}
                style={{ backgroundColor: '#1E1946' }}
            >
                <HeroUIProviderWrapper
                    themeProps={{
                        attribute: "class",
                        defaultTheme: "light",
                        forcedTheme: "light",
                        enableSystem: false
                    }}
                >
                    <div className="relative flex flex-col h-screen" style={{ backgroundColor: '#1E1946' }}>
                        <Navbar />
                        <main className="container mx-auto max-w-7xl flex-grow" style={{ backgroundColor: '#1E1946' }}>
                            {children}
                        </main>
                    </div>
                </HeroUIProviderWrapper>
            </body>
        </html>
    );
}

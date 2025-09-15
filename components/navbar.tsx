'use client';
import {
    Navbar as HeroUINavbar,
    NavbarContent,
    NavbarMenu,
    NavbarBrand,
    NavbarItem,
} from "@heroui/navbar";
import NextLink from "next/link";
import { useEffect, useState } from "react";

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 56);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <HeroUINavbar
            maxWidth="xl"
            position="static"
            classNames={{
                wrapper: "px-4 h-[56px] bg-transparent"
            }}
            style={{
                backgroundColor: isScrolled ? '#1E1946' : 'transparent',
                backdropFilter: 'none',
                transition: 'background-color 0.3s ease'
            }}
            className="fixed top-0 left-0 right-0 z-50 bg-transparent"
        >
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand as="li" className="gap-3 max-w-fit">
                    <NextLink
                        className="flex justify-start items-center gap-3"
                        href="/"
                    >
                        <img src="/images/home/logo.png" alt="XBOZ Logo" className="w-9 h-9" loading="eager" />
                        <div className="font-bold text-[18px] pt-[2px] text-white">XBOZ.FUN</div>
                    </NextLink>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="basis-1/5 sm:basis-full" justify="end">
                <NavbarItem>
                    <NextLink href="https://x.com/bozdotfun" target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <img src="/images/home/x.png" alt="X" className="w-8 h-8" loading="eager" />
                    </NextLink>
                </NavbarItem>
                <NavbarItem>
                    <NextLink href="https://t.me/xbozdotfun" target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <img src="/images/home/tg.png" alt="Telegram" className="w-8 h-8" loading="eager" />
                    </NextLink>
                </NavbarItem>
            </NavbarContent>

            <NavbarMenu>

            </NavbarMenu>
        </HeroUINavbar>
    );
};

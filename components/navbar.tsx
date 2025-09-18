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

import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { openConnectModal } = useConnectModal();
    const { address, isConnected } = useAccount();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 56);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 标记已在客户端挂载，避免 SSR 与客户端地址状态不一致导致 hydration 警告
    useEffect(() => {
        setMounted(true);
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

            <NavbarContent className="basis-1/5 sm:basis-full gap-[10px]" justify="end">
                <NavbarItem>
                    <NextLink href="https://x.com/bozdotfun" target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <img src="/images/home/x.png" alt="X" className="w-[36px] h-[36px]" loading="eager" />
                    </NextLink>
                </NavbarItem>
                <NavbarItem>
                    <NextLink href="https://t.me/xbozdotfun" target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <img src="/images/home/tg.png" alt="Telegram" className="w-[36px] h-[36px]" loading="eager" />
                    </NextLink>
                </NavbarItem>
                <NavbarItem suppressHydrationWarning>
                    {!mounted ? (
                        <div className="w-[96px] h-[36px] rounded-[12px] bg-[#2E2A55] animate-pulse" />
                    ) : isConnected ? (
                        <NextLink
                            href="/user"
                            className="px-3 h-[36px] rounded-[12px] bg-[#1E1946] text-[13px] text-white flex items-center justify-center border border-[#5D4FDC]/40 hover:border-[#5D4FDC] transition-colors max-w-[160px] cursor-pointer"
                            title={address || ''}
                        >
                            <span className="truncate">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                        </NextLink>
                    ) : (
                        <button
                            type="button"
                            className="w-[96px] h-[36px] rounded-[12px] bg-[#fff] active:scale-[0.97] text-[13px] font-medium text-[#001825] flex items-center justify-center transition-colors"
                            onClick={() => openConnectModal && openConnectModal()}
                        >
                            连接钱包
                        </button>
                    )}
                </NavbarItem>
            </NavbarContent>
        </HeroUINavbar>
    );
};

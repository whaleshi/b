'use client';

import { Image, Link } from "@heroui/react";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { useAccount, useDisconnect } from 'wagmi';
import useClipboard from '@/hooks/useClipboard';

export default function Search() {

	const { address, isConnected } = useAccount();
	const { disconnect } = useDisconnect();
	const router = useRouter();
	const { copy } = useClipboard();

	return (
		<section className="flex flex-col items-center justify-center pt-[56px] px-[16px] max-w-[450px] mx-auto">
			<div className="h-[48px] flex items-center justify-between w-full relative mb-[12px]">
				<Link href="/" className="w-[40px] h-[40px] rounded-[12px] bg-[#29254F] flex items-center justify-center">
					<Image src="/images/common/back.png" className="w-[15px] h-auto cursor-pointer rounded-[0px]" disableSkeleton loading="eager" />
				</Link>
				<div
					className="w-[40px] h-[40px] rounded-[12px] bg-[#29254F] flex items-center justify-center cursor-pointer hover:bg-[#3a3563] active:scale-95 transition"
					onClick={() => {
						if (isConnected) {
							disconnect();
							// 立即跳转首页
							router.push('/');
						}
					}}
					title={isConnected ? '断开钱包' : '未连接'}
				>
					<Image src="/images/common/close.png" alt="disconnect" className="w-[calc(51px/3)] h-auto cursor-pointer rounded-[0px]" disableSkeleton loading="eager" />
				</div>
			</div>
			<div className="w-full">
				<div className="w-full bg-[rgba(255,255,255,0.05)] rounded-t-[12px] h-[76px] px-[16px] flex justify-between items-center">
					<div className="flex flex-col justify-center h-full">
						<div className="text-[11px] text-[#AAA]">Balance</div>
						<div className="text-[18px] text-[#FFF] font-semibold">
							0 OKB
						</div>
					</div>

				</div>
				<div className="h-[32px] bg-[rgba(255,255,255,0.05)] rounded-b-[12px] border-t-[1px] border-[#192F3A] w-full flex items-center pl-[16px] gap-[4px]">
					<div className="text-[11px] text-[#FFF] underline cursor-pointer">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
					<div className="text-[11px] text-[#999] cursor-pointer" onClick={() => copy(address!)}>Copy</div>
				</div>
			</div>
		</section>
	);
}

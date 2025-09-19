'use client';

import { Image } from "@heroui/react";

export default function Loading() {
	return (
		<div className="w-full max-w-[450px] h-full pt-[56px] px-[16px]">
			<div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center">
				<Image
					src="/images/home/tab3.png"
					className="w-[80px] h-[80px] animate-bounce"
					disableSkeleton
					loading="eager"
				/>
				<div className="text-[12px] text-[#6A6784] mt-[10px]">加载代币信息中...</div>
			</div>
		</div>
	);
}
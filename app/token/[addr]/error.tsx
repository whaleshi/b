'use client';

import { Image } from "@heroui/react";
import { useRouter } from "next/navigation";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
	const router = useRouter();

	return (
		<div className="w-full max-w-[450px] h-full pt-[56px] px-[16px]">
			<div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center">
				<Image 
					src="/images/home/search.png" 
					className="w-[80px] h-[80px] !opacity-30" 
					disableSkeleton 
					loading="eager" 
				/>
				<div className="text-[14px] text-[#fff] mt-[16px] mb-[8px]">加载失败</div>
				<div className="text-[12px] text-[#6A6784] mb-[20px] text-center">
					无法获取代币信息，请检查地址是否正确
				</div>
				<div className="flex gap-[12px]">
					<button 
						onClick={() => reset()}
						className="px-[16px] py-[8px] bg-[#3B82F6] text-white rounded-[8px] text-[12px]"
					>
						重试
					</button>
					<button 
						onClick={() => router.back()}
						className="px-[16px] py-[8px] bg-[#29254F] text-white rounded-[8px] text-[12px]"
					>
						返回
					</button>
				</div>
			</div>
		</div>
	);
}
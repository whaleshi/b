"use client"

import { Image } from "@heroui/react";
import { useRouter } from "next/navigation";

interface TokenMetadata {
	address: string;
	metadata: any;
	name: string;
	symbol: string;
	description: string;
	image: string | null;
	website?: string;
	x?: string;
	telegram?: string;
}

interface ListItemProps {
	tokenAddress?: string;
	tokenMetadata?: TokenMetadata;
	progress?: number; // 0-100
}

export default function ListItem({ tokenAddress, tokenMetadata, progress = 10 }: ListItemProps) {
	const router = useRouter();
	const circumference = 248;
	const strokeDashoffset = circumference - (progress / 100) * circumference;

	const handleClick = () => {
		if (tokenAddress) {
			router.push(`/token/${tokenAddress}`);
		}
	};

	// 如果没有 tokenAddress，显示默认样式
	if (!tokenAddress) {
		return (
			<div className="h-[88px] w-full rounded-[12px] bg-[#29254F] px-[16px] flex items-center gap-[12px]">
				<div className="w-[64px] h-[64px] bg-[#3a3560] rounded-[8px] animate-pulse"></div>
				<div className="flex-1">
					<div className="h-[14px] bg-[#3a3560] rounded w-[60px] mb-[8px] animate-pulse"></div>
					<div className="h-[12px] bg-[#3a3560] rounded w-[200px] mb-[4px] animate-pulse"></div>
					<div className="h-[12px] bg-[#3a3560] rounded w-[150px] animate-pulse"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="h-[88px] w-full rounded-[12px] bg-[#29254F] px-[16px] flex items-center gap-[12px] cursor-pointer mb-[10px]" onClick={handleClick}>
			<div className="relative w-[64px] h-[64px]">
				<div className="absolute top-[2px] left-[2px] right-[2px] bottom-[2px] border-[2px] border-[#29254F] rounded-[8px] z-10">
					{/* 默认图片作为背景/loading */}

					{/* 实际token图片 */}
					{tokenMetadata?.image ? (
						<Image
							src={tokenMetadata.image}
							className="w-[56px] h-[56px] rounded-[8px] border-[2px] border-[#29254F] absolute z-10"
							disableSkeleton
						/>
					) : (
						<Image
							src="/images/common/default.png"
							className="w-[56px] h-[56px] rounded-[8px] border-[2px] border-[#29254F] absolute"
							disableSkeleton
						/>
					)}
				</div>
				<svg className="absolute inset-0 w-full h-full z-20" viewBox="0 0 64 64">
					<rect
						x="1"
						y="1"
						width="62"
						height="62"
						rx="9"
						ry="9"
						fill="none"
						stroke="rgba(93,79,220,0.30)"
						strokeWidth="2"
					/>
					<rect
						x="1"
						y="1"
						width="62"
						height="62"
						rx="9"
						ry="9"
						fill="none"
						stroke="#3B82F6"
						strokeWidth="2"
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						pathLength={circumference}
					/>
				</svg>
			</div>
			<div className="flex-1">
				<div className="text-[14px] text-[#FFFFFF]">
					{tokenMetadata?.symbol || `--`}
				</div>
				<div className="text-[12px] text-[#6A6784] my-[2px]">
					{/* MC <span className="text-[#fff]">$--</span> */}
					内盘 <span className="text-[#fff]">{progress.toFixed(2)}%</span>
				</div>
				<div className="flex items-center gap-[4px]">
					{
						tokenMetadata?.website && <div className="w-[20px] h-[20px] flex items-center justify-center cursor-pointer"
							onClick={(e) => { e.stopPropagation(); window.open(tokenMetadata?.website, "_blank") }}
						>
							<Image src="/images/common/web.png" className="w-[12px] h-auto rounded-[0px]" disableSkeleton loading="eager" />
						</div>
					}
					{
						tokenMetadata?.x && <div className="w-[20px] h-[20px] flex items-center justify-center cursor-pointer"
							onClick={(e) => { e.stopPropagation(); window.open(tokenMetadata?.x, "_blank") }}
						>
							<Image src="/images/common/x.png" className="w-[12px] h-auto rounded-[0px]" disableSkeleton loading="eager" />
						</div>
					}
					{
						tokenMetadata?.telegram && <div className="w-[20px] h-[20px] flex items-center justify-center cursor-pointer"
							onClick={(e) => { e.stopPropagation(); window.open(tokenMetadata?.telegram, "_blank") }}
						>
							<Image src="/images/common/tg.png" className="w-[12px] h-auto rounded-[0px] mt-[2px]" disableSkeleton loading="eager" />
						</div>
					}
				</div>
			</div>
		</div>
	)
}
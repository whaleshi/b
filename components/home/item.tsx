"use client"

import { Image } from "@heroui/react";
import { useRouter } from "next/navigation";

interface ListItemProps {
	progress?: number; // 0-100
}

export default function ListItem({ progress = 10 }: ListItemProps) {
	const router = useRouter();
	const circumference = 248;
	const strokeDashoffset = circumference - (progress / 100) * circumference;

	const handleClick = () => {
		router.push('/token/1');
	};

	return (
		<div className="h-[88px] w-full rounded-[12px] bg-[#29254F] px-[16px] flex items-center gap-[12px] cursor-pointer" onClick={handleClick}>
			<div className="relative w-[64px] h-[64px]">
				<div className="absolute top-[2px] left-[2px] right-[2px] bottom-[2px] border-[2px] border-[#29254F] rounded-[8px] z-10">
					<Image src={"/images/home/m.png"} fallbackSrc="/images/common/default.png" className="w-[56px] h-[56px] rounded-[8px] border-[2px] border-[#29254F]" />
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
				<div className="text-[14px] text-[#FFFFFF]">BOZ</div>
				<div className="text-[12px] text-[#6A6784] my-[2px]">
					MC <span className="text-[#fff]">$18.98K</span> 内盘 <span className="text-[#fff]">88.89%</span>
				</div>
				<div className="text-[12px] text-[#6A6784]">Item Description</div>
			</div>
		</div>
	)
}
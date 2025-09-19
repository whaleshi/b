"use client"

import { Image } from "@heroui/react";

export default function TokenAbout({ data }: any) {
	const circumference = 248;
	const strokeDashoffset = circumference - (data?.progress / 100) * circumference;
	return (
		<div>
			<div className="h-[64px] w-full flex items-center gap-[12px]">
				<div className="relative w-[64px] h-[64px]">
					<div className="absolute top-[2px] left-[2px] right-[2px] bottom-[2px] border-[2px] border-[#29254F] rounded-[8px] z-10">
						{/* 默认图片作为背景/loading */}
						<Image 
							src="/images/common/default.png" 
							className="w-[56px] h-[56px] rounded-[8px] border-[2px] border-[#29254F] absolute" 
							disableSkeleton 
						/>
						{/* 实际token图片 */}
						{data?.tokenImage && (
							<Image 
								src={data.tokenImage} 
								className="w-[56px] h-[56px] rounded-[8px] border-[2px] border-[#29254F] absolute z-10" 
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
				<div className="flex-1 flex flex-col justify-around h-full">
					<div className="text-[14px] text-[#FFFFFF] flex items-center justify-between">BOZ<span>$89.89K</span></div>
					<div className="text-[12px] text-[#6A6784] flex items-center justify-between">
						XBOZ.FUN <span>市值</span>
					</div>
					<div className="text-[12px] text-[#6A6784] flex items-center justify-between"><div></div><div>CA<span className="text-[#fff] underline mx-[4px]">0x1234…1234</span><span className="cursor-pointer">复制</span></div></div>
				</div>
			</div>
			<div className="flex mt-[24px] gap-[12px]">
				<div className="flex-1 h-[54px] bg-[#29254F] rounded-[12px] flex flex-col items-center justify-center gap-[2px]">
					<div className="text-[12px] text-[#fff]">10亿</div>
					<div className="text-[10px] text-[#6A6784]">代币总量</div>
				</div>
				<div className="flex-1 h-[54px] bg-[#29254F] rounded-[12px] flex flex-col items-center justify-center gap-[2px]">
					<div className="text-[12px] text-[#fff]">8亿</div>
					<div className="text-[10px] text-[#6A6784]">内盘总量</div>
				</div>
				<div className="flex-1 h-[54px] bg-[#29254F] rounded-[12px] flex flex-col items-center justify-center gap-[2px]">
					<div className="text-[12px] text-[#fff]">99.8%</div>
					<div className="text-[10px] text-[#6A6784]">内盘进度</div>
				</div>
			</div>
			<div className="w-full h-[54px] bg-[#29254F] rounded-[12px] flex flex-col items-center justify-center gap-[2px] mt-[12px]">
				<div className="text-[12px] text-[#fff]">0x12345678…1234</div>
				<div className="text-[10px] text-[#6A6784]">创建者地址</div>
			</div>
			<div className="text-[16px] text-[#fff] mt-[40px]">代币详情</div>
			<div className="text-[12px] text-[#6A6784] mt-[20px]">XBOZ 是 XBOZ.FUN 平台的治理代币，致力于在 X Layer 上构建真正的 Meme 文化。</div>
			<div className="flex items-center gap-[12px] mt-[20px]">
				<div className="w-[40px] h-[40px] bg-[#29254F] rounded-[12px] flex flex-col items-center justify-center cursor-pointer">
					<Image src="/images/common/web.png" className="w-[16px] h-auto rounded-[0px]" disableSkeleton loading="eager" />
				</div>
				<div className="w-[40px] h-[40px] bg-[#29254F] rounded-[12px] flex flex-col items-center justify-center cursor-pointer">
					<Image src="/images/common/x.png" className="w-[14px] h-auto rounded-[0px]" disableSkeleton loading="eager" />
				</div>
				<div className="w-[40px] h-[40px] bg-[#29254F] rounded-[12px] flex flex-col items-center justify-center cursor-pointer">
					<Image src="/images/common/tg.png" className="w-[16px] h-auto rounded-[0px]" disableSkeleton loading="eager" />
				</div>
			</div>
		</div>
	)
}
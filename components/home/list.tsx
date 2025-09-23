"use client"

import React from "react";
import { Image } from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import ListItem from "@/components/home/item";
import { useTokenList } from "@/hooks/useTokenList";

export default function HomeList() {
	const [activeTab, setActiveTab] = useState(2);
	const router = useRouter();
	const { tokens, tokenMetadata, isLoading, getSortedTokenList } = useTokenList();

	// const [searchQuery, setSearchQuery] = useState('');
	//   const filteredTokens = getFilteredTokenList(tokens, searchQuery);

	// 根据当前tab获取排序后的tokens
	const sortedTokens = getSortedTokenList(tokens, activeTab - 1); // activeTab是1,2,3，函数需要0,1,2
	console.log('sortedTokens', sortedTokens);
	const handleSearchClick = () => {
		router.push('/search');
	};
	return (
		<div className="mt-[-20px]">
			<div className="flex items-center gap-[20px]">
				<Image
					src="/images/home/tab1.png"
					className={`w-[40px] h-[40px] cursor-pointer ${activeTab !== 1 ? '!opacity-30' : ''}`}
					disableSkeleton
					loading="eager"
					onClick={() => setActiveTab(1)}
				/>
				<Image
					src="/images/home/tab2.png"
					className={`w-[40px] h-[40px] cursor-pointer ${activeTab !== 2 ? '!opacity-30' : ''}`}
					disableSkeleton
					loading="eager"
					onClick={() => setActiveTab(2)}
				/>
				<Image
					src="/images/home/tab3.png"
					className={`w-[40px] h-[40px] cursor-pointer ${activeTab !== 3 ? '!opacity-30' : ''}`}
					disableSkeleton
					loading="eager"
					onClick={() => setActiveTab(3)}
				/>
				<div className="flex-1"></div>
				<Image
					src="/images/home/search.png"
					className="w-[40px] h-[40px] cursor-pointer"
					disableSkeleton
					loading="eager"
					onClick={handleSearchClick}
				/>
			</div>
			<div className="mt-[20px]">
				{
					sortedTokens.length > 0 && sortedTokens.map((token) => (
						<ListItem
							key={token?.address}
							tokenAddress={token?.address}
							tokenMetadata={tokenMetadata[token?.address]}
							progress={token?.progressPercent || 0}
						/>
					))
				}
				{isLoading && (
					<div className="h-[300px] flex flex-col items-center justify-center">
						<Image src="/images/home/tab3.png" className="w-[80px] h-[80px] animate-bounce" disableSkeleton loading="eager" />
						<div className="text-[12px] text-[#6A6784] mt-[10px]">加载中...</div>
					</div>
				)}
				{sortedTokens.length === 0 && !isLoading && (
					<div className="h-[300px] flex flex-col items-center justify-center">
						<Image src="/images/home/search.png" className="w-[80px] h-[80px] !opacity-30" disableSkeleton loading="eager" />
						<div className="text-[12px] text-[#6A6784] mt-[10px]">什么都没有</div>
					</div>
				)}
			</div>
		</div>
	)
}
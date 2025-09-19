'use client';

import { Input, Image } from "@heroui/react";
import React, { useState, useMemo } from "react";
import ListItem from "@/components/home/item";
import { useTokenList } from "@/hooks/useTokenList";

export default function Search() {
	const [value, setValue] = useState("");
	const { tokens, tokenMetadata, isLoading, getFilteredTokenList } = useTokenList();

	const clearInput = () => {
		setValue("");
	};

	// 搜索结果
	const searchResults = useMemo(() => {
		if (!value.trim()) return [];

		// 扩展搜索逻辑：支持代币名称、symbol、地址搜索
		return tokens.filter(token => {
			const searchTerm = value.toLowerCase().trim();
			const metadata = tokenMetadata[token.address];

			// 搜索地址
			if (token.address.toLowerCase().includes(searchTerm)) {
				return true;
			}

			// 搜索代币名称和symbol
			if (metadata) {
				if (metadata.name?.toLowerCase().includes(searchTerm) ||
					metadata.symbol?.toLowerCase().includes(searchTerm)) {
					return true;
				}
			}

			return false;
		});
	}, [value, tokens, tokenMetadata]);

	// 搜索状态
	const isSearching = value.trim() !== '';
	const hasResults = searchResults.length > 0;

	return (
		<section className="flex flex-col items-center justify-center pt-[56px] px-[16px] max-w-[450px] mx-auto">
			<div className="relative w-full">
				<Input
					classNames={{
						inputWrapper: "h-[48px] rounded-[12px] border-0 bg-[rgba(255,255,255,0.05)]",
						input: "f600 text-[14px] text-[#fff] placeholder:text-[#808C92] pr-[40px]",
					}}
					name="name"
					placeholder='搜索代币名称/合约地址'
					variant="bordered"
					value={value}
					onChange={(e) => setValue(e.target.value)}
				/>
				{value && (
					<button
						className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-pointer"
						onClick={clearInput}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M12 4L4 12M4 4L12 12"
								stroke="#808C92"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				)}
			</div>
			<div className="w-full h-[calc(100vh-[104px])] pt-[16px] overflow-y-auto">
				{/* 加载状态 */}
				{isLoading && (
					<div className="h-[300px] flex flex-col items-center justify-center">
						<Image src="/images/home/tab3.png" className="w-[80px] h-[80px] animate-bounce" disableSkeleton loading="eager" />
						<div className="text-[12px] text-[#6A6784] mt-[10px]">加载中...</div>
					</div>
				)}

				{/* 搜索结果 */}
				{!isLoading && isSearching && hasResults && (
					<div className="space-y-[8px]">
						<div className="text-[12px] text-[#6A6784] mb-[12px]">
							找到 {searchResults.length} 个结果
						</div>
						{searchResults.map((token) => (
							<ListItem
								key={token.address}
								tokenAddress={token.address}
								tokenMetadata={tokenMetadata[token.address]}
								progress={token.progressPercent || 0}
							/>
						))}
					</div>
				)}

				{/* 无搜索结果 */}
				{!isLoading && isSearching && !hasResults && (
					<div className="h-[300px] flex flex-col items-center justify-center">
						<Image src="/images/home/search.png" className="w-[80px] h-[80px] !opacity-30" disableSkeleton loading="eager" />
						<div className="text-[12px] text-[#6A6784] mt-[10px]">未找到相关代币</div>
					</div>
				)}

				{/* 默认状态（未搜索） */}
				{!isLoading && !isSearching && (
					<div className="h-[300px] flex flex-col items-center justify-center">
						<Image src="/images/home/search.png" className="w-[80px] h-[80px] !opacity-30" disableSkeleton loading="eager" />
						<div className="text-[12px] text-[#6A6784] mt-[10px]">搜索代币名称或合约地址</div>
					</div>
				)}
			</div>
		</section>
	);
}

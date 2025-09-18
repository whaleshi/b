'use client';

import { Input, Image } from "@heroui/react";
import React, { useState } from "react";
import ListItem from "@/components/home/item";

export default function Search() {
	const [value, setValue] = useState("");

	const clearInput = () => {
		setValue("");
	};

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
			<div className="w-full h-[cala(100vh-[104px])] pt-[16px] overflow-y-auto">
				<ListItem />
				<div className="h-[300px] flex flex-col items-center justify-center">
					<Image src="/images/home/search.png" className="w-[80px] h-[80px] !opacity-30" disableSkeleton loading="eager" />
					<div className="text-[12px] text-[#6A6784] mt-[10px]">什么都没有</div>
				</div>
			</div>
		</section>
	);
}

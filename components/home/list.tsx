"use client"

import { Image } from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import ListItem from "@/components/home/item";

export default function HomeList() {
	const [activeTab, setActiveTab] = useState(1);
	const router = useRouter();

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
				<ListItem />
			</div>
			<div className="h-[300px] flex flex-col items-center justify-center">
				<Image src="/images/home/search.png" className="w-[80px] h-[80px] !opacity-30" disableSkeleton loading="eager" />
				<div className="text-[12px] text-[#6A6784] mt-[10px]">什么都没有</div>
			</div>
		</div>
	)
}
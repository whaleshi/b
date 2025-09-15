"use client"

import { CircularProgress, Button, Pagination } from "@heroui/react";
import { useState } from "react";
import { useRouter } from 'next/navigation';

import { SearchIcon } from '@/components/icons'

import CustomImage from "@/components/customImage";

export default function HomeList() {
	const [activeTab, setActiveTab] = useState(1);
	const router = useRouter();

	// TODO: 后续改为真实接口数据
	const tokens = [
		{ id: '0x1111111111111111111111111111111111111111', name: 'OKO', symbol: 'OKO', progress: 70, amount: '202.5 OKB', status: 'ongoing', timeLabel: '8:59:59' },
		{ id: '0x2222222222222222222222222222222222222222', name: 'OKO', symbol: 'OKO', progress: 100, amount: '202.5 OKB', status: 'finished', timeLabel: '募集完成' },
	];

	const handleClick = (addr: string) => {
		router.push(`/token/${addr}`);
	};

	const tabs = [
		{ id: 1, name: "新创建" },
		{ id: 2, name: "飙升" },
		{ id: 3, name: "已发射" }
	];

	return (
		<section className="flex flex-col items-center justify-center w-full max-w-[450px] mt-[32px]">
			<div className="w-full h-[52px] flex items-center justify-between">
				<div className="flex gap-[16px]">
					{tabs.map((tab) => (
						<div
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`text-[16px] cursor-pointer transition-colors ${activeTab === tab.id ? "text-[#fff]" : "text-[#909090]"}`}
						>
							{tab.name}
						</div>
					))}
				</div>
				<div className="h-[28px] bg-[#1E1E1E] rounded-[18px] px-[12px] flex items-center justify-center gap-[4px] text-[13px] text-[#5B5B5B] cursor-pointer">
					<SearchIcon />搜索
				</div>
			</div>
			<div className="w-full">
				{tokens.map(t => {
					const finished = t.status === 'finished';
					return (
						<div
							key={t.id}
							onClick={() => handleClick(t.id)}
							role="button"
							aria-label={`查看 ${t.name} 详情`}
							className="w-full h-[72px] rounded-[8px] bg-[#0E0E0E] mt-[8px] flex items-center px-[16px] gap-[7px] cursor-pointer hover:bg-[#161616] transition-colors"
						>
							<div className="relative">
								{!finished && (
									<CircularProgress
										classNames={{
											svg: "w-[50px] h-[50px]",
											indicator: "stroke-[#9AED2C]",
											track: "stroke-[#383838]",
										}}
										strokeWidth={2}
										value={t.progress}
									/>
								)}
								{finished && <div className="w-[50px] h-[50px]" />}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="border-[#0E0E0E] border-[1px] rounded-full">
										<CustomImage src="/test.jpg" alt={t.symbol} width={40} height={40} radius="full" />
									</div>
								</div>
							</div>
							<div className="flex-1 flex flex-col justify-center h-full gap-[6px]">
								<div className="text-[14px] text-[#fff] font-bold flex items-center justify-between w-full">
									<div>{t.name}</div>
									<div className={finished ? "text-[#FFA726]" : undefined}>{t.amount}</div>
								</div>
								<div className="flex items-center justify-between w-full text-[12px]">
									<div className="text-[#9AED2C] flex items-center gap-[4px]">
										{finished ? <Time1Icon /> : <TimeIcon />}{t.timeLabel}
									</div>
									<div className="text-[#5B5B5B]">已募集</div>
								</div>
							</div>
						</div>
					);
				})}
				<div className="mt-[32px] flex justify-center">
					<Pagination
						showControls
						page={1}
						total={20}
						color="success"
						classNames={{
							item: "data-[active=true]:text-[#0E0E0E] data-[selected=true]:text-[#0E0E0E]",
							cursor: "bg-[#fff]",
						}}
					/>
				</div>
			</div>
		</section>
	);
}

const TimeIcon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
		<path d="M6 0C9.31371 0 12 2.68629 12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6C0 2.68629 2.68629 0 6 0ZM5.25 2.5V6.5C5.25 6.69891 5.32908 6.88962 5.46973 7.03027L7.46973 9.03027L8.53027 7.96973L6.75 6.18945V2.5H5.25Z" fill="#9AED2C" />
	</svg>
)
const Time1Icon = () => (
	<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
		<path d="M6 0C9.31371 0 12 2.68629 12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6C0 2.68629 2.68629 0 6 0ZM5.5 6.43945L4.03027 4.96973L2.96973 6.03027L5.5 8.56055L9.53027 4.53027L8.46973 3.46973L5.5 6.43945Z" fill="#9AED2C" />
	</svg>
)
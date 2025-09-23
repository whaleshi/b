"use client"

import { Image } from "@heroui/react";
import useClipboard from '@/hooks/useClipboard';
import { formatBigNumber } from '@/utils/formatBigNumber';
import BigNumber from "bignumber.js";
import useOkxPrice from "@/hooks/useOkxPrice";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { config } from "@/config/wagmi";
import { formatEther, parseEther } from "viem";
import { CONTRACT_CONFIG } from "@/config/chains";
import swapABI from "@/constant/Swap.json";

export default function TokenAbout({ data }: any) {
	const circumference = 248;
	const strokeDashoffset = circumference - (data?.progress / 100) * circumference;
	console.log(data)
	const { copy } = useClipboard();
	const { price } = useOkxPrice();

	// 获取外盘价格 - 用 1 个代币换取多少 ETH
	const { data: swapPrice = "0" } = useQuery({
		queryKey: ["swapPrice", data?.address],
		queryFn: async () => {
			if (!data?.address || data?.progress < 100) {
				return "0";
			}

			try {
				// Token -> ETH 的交易路径
				const path = [data.address, CONTRACT_CONFIG.WETH_ADDRESS];
				const amountIn = parseEther("1"); // 1 个代币

				const amounts = (await readContract(config, {
					address: CONTRACT_CONFIG.ROUTER_CONTRACT as `0x${string}`,
					abi: swapABI,
					functionName: "getAmountsOut",
					args: [amountIn, path],
				})) as bigint[];

				// amounts[1] 是能换到的 ETH 数量
				return formatEther(amounts[1]);
			} catch (error) {
				console.error("获取外盘价格失败:", error);
				return "0";
			}
		},
		enabled: !!(data?.address && data?.progress >= 100),
		refetchInterval: 10000, // 每10秒刷新一次
		staleTime: 5000,
		retry: 1,
	});

	console.log("OKB price:", price);
	console.log("Swap price (1 token -> ETH):", swapPrice);
	return (
		<div>
			<div className="h-[64px] w-full flex items-center gap-[12px]">
				<div className="relative w-[64px] h-[64px]">
					<div className="absolute top-[2px] left-[2px] right-[2px] bottom-[2px] border-[2px] border-[#29254F] rounded-[8px] z-10">
						{data?.tokenImage ? (
							<Image
								src={data.tokenImage}
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
				<div className="flex-1 flex flex-col justify-around h-full">
					<div className="text-[14px] text-[#FFFFFF] flex items-center justify-between">{data?.symbol}
						<span>${
							data?.progress >= 100
								? BigNumber(swapPrice || 0).times(1250000000).times(price || 0).dp(2).toString() || '--'
								: BigNumber(data?.lastPrice ?? 0).div(1e18).times(1250000000).times(price ?? 0).dp(2).toString() || '--'
						}</span>
					</div>
					<div className="text-[12px] text-[#6A6784] flex items-center justify-between">
						{data?.name} <span>{data?.progress >= 100 ? '外盘市值' : '内盘市值'}</span>
					</div>
					<div className="text-[12px] text-[#6A6784] flex items-center justify-between"><div></div><div>CA<span className="text-[#fff] underline mx-[4px] cursor-pointer" onClick={() => { window.open(`https://www.oklink.com/x-layer/address/${data?.address}`, "_blank") }}>{data?.address?.slice(0, 6)}...{data?.address?.slice(-4)}</span><span className="cursor-pointer"
						onClick={() => copy(data?.address!)}>复制</span></div></div>
				</div>
			</div>
			<div className="flex mt-[24px] gap-[12px]">
				<div className="flex-1 h-[54px] bg-[#29254F] rounded-[12px] flex flex-col items-center justify-center gap-[2px]">
					<div className="text-[12px] text-[#fff]">{formatBigNumber(1250000000)}</div>
					<div className="text-[10px] text-[#6A6784]">代币总量</div>
				</div>
				<div className="flex-1 h-[54px] bg-[#29254F] rounded-[12px] flex flex-col items-center justify-center gap-[2px]">
					<div className="text-[12px] text-[#fff]">{formatBigNumber(1000000000)}</div>
					<div className="text-[10px] text-[#6A6784]">内盘总量</div>
				</div>
				<div className="flex-1 h-[54px] bg-[#29254F] rounded-[12px] flex flex-col items-center justify-center gap-[2px]">
					<div className="text-[12px] text-[#fff]">{data?.progress}%</div>
					<div className="text-[10px] text-[#6A6784]">内盘进度</div>
				</div>
			</div>
			<div className="w-full h-[54px] bg-[#29254F] rounded-[12px] flex flex-col items-center justify-center gap-[2px] mt-[12px] cursor-pointer"
				onClick={() => { window.open(`https://www.oklink.com/x-layer/address/${data?.creator}`, "_blank") }}
			>
				<div className="text-[12px] text-[#fff]">{data?.creator?.slice(0, 6)}...{data?.creator?.slice(-4)}</div>
				<div className="text-[10px] text-[#6A6784]">创建者地址</div>
			</div>
			<div className="text-[16px] text-[#fff] mt-[40px]">代币详情</div>
			{
				data?.description && <div className="text-[12px] text-[#6A6784] mt-[20px]">{data?.description}</div>
			}
			<div className="flex items-center gap-[12px] mt-[20px]">
				{
					data?.website && <div className="w-[40px] h-[40px] bg-[#29254F] rounded-[12px] flex flex-col items-center justify-center cursor-pointer"
						onClick={() => { window.open(data?.website, "_blank") }}
					>
						<Image src="/images/common/web.png" className="w-[16px] h-auto rounded-[0px]" disableSkeleton loading="eager" />
					</div>
				}
				{
					data?.x && <div className="w-[40px] h-[40px] bg-[#29254F] rounded-[12px] flex flex-col items-center justify-center cursor-pointer"
						onClick={() => { window.open(data?.x, "_blank") }}
					>
						<Image src="/images/common/x.png" className="w-[14px] h-auto rounded-[0px]" disableSkeleton loading="eager" />
					</div>
				}
				{
					data?.telegram && <div className="w-[40px] h-[40px] bg-[#29254F] rounded-[12px] flex flex-col items-center justify-center cursor-pointer"
						onClick={() => { window.open(data?.telegram, "_blank") }}
					>
						<Image src="/images/common/tg.png" className="w-[16px] h-auto rounded-[0px]" disableSkeleton loading="eager" />
					</div>
				}
			</div>
		</div>
	)
}
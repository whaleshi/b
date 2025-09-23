"use client"
import { useState } from "react";
import { Button, Image } from "@heroui/react";
import TradePopup from "@/components/trade/tradePopup";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { config } from "@/config/wagmi";
import { formatEther } from "viem";

export default function TokenTrade({ data }: any) {
	const [isTradePopupOpen, setIsTradePopupOpen] = useState(false);
	const [tradeMode, setTradeMode] = useState(true); // true for buy, false for sell
	const { isConnected, address } = useAccount();

	const tokenABI = [
		{
			"constant": true,
			"inputs": [{ "name": "_owner", "type": "address" }],
			"name": "balanceOf",
			"outputs": [{ "name": "balance", "type": "uint256" }],
			"type": "function"
		}
	];

	// 使用 useQuery 获取代币余额，每3秒刷新一次
	const { data: tokenBalance = "0" } = useQuery({
		queryKey: ["tokenBalance", data?.address, address],
		queryFn: async () => {
			if (!isConnected || !address || !data?.address) {
				return "0";
			}

			try {
				const balance = (await readContract(config, {
					address: data.address as `0x${string}`,
					abi: tokenABI,
					functionName: "balanceOf",
					args: [address],
				})) as bigint;

				return formatEther(balance);
			} catch (error) {
				console.error("获取代币余额失败:", error);
				return "0";
			}
		},
		enabled: !!(isConnected && address && data?.address),
		refetchInterval: 3000, // 每3秒刷新一次
		refetchIntervalInBackground: true, // 后台也刷新
	});

	// 是否有代币余额
	const hasTokens = parseFloat(tokenBalance) > 0;

	return (
		<div className="w-full select-none flex-1 flex flex-col justify-end pb-[30px] gap-[12px]">
			<div className="flex w-full gap-[12px]">
				{hasTokens && (
					<Button
						className="flex-1 h-[48px] rounded-[12px] bg-[#29254F] text-[14px] text-white"
						onPress={() => {
							setTradeMode(false); // 设置为卖出模式
							setIsTradePopupOpen(true);
						}}
					>
						<Image src="/images/common/sell.png" className="w-[20px] h-[20px]" disableSkeleton loading="eager" />
						立即卖出
					</Button>
				)}
				<Button className="flex-1 h-[48px] rounded-[12px] bg-[#fff] text-[14px]"
					onPress={() => {
						setTradeMode(true); // 设置为买入模式
						setIsTradePopupOpen(true);
					}}
				>
					<Image src="/images/home/tab3.png" className="w-[20px] h-[20px]" disableSkeleton loading="eager" />
					立即买入
				</Button>
			</div>
			<TradePopup
				isOpen={isTradePopupOpen}
				onOpenChange={setIsTradePopupOpen}
				initialMode={tradeMode}
				tokenAddress={data?.address as string}
				// balances={balances}
				metaData={data}
			/>
		</div>
	)
}
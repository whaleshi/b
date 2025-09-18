"use client"
import { useEffect, useState } from "react";
import { Button, Image } from "@heroui/react";
import TradePopup from "@/components/trade/tradePopup";

export default function TokenTrade({ metaData, data }: any) {
	const [isTradePopupOpen, setIsTradePopupOpen] = useState(false);
	const [tradeMode, setTradeMode] = useState(true); // true for buy, false for sell

	return (
		<div className="w-full select-none flex-1 flex flex-col justify-end pb-[30px]">
			<Button className="h-[48px] rounded-[12px] bg-[#fff] text-[14px]"
				onPress={() => {
					setTradeMode(true); // 设置为买入模式
					setIsTradePopupOpen(true);
				}}
			>
				<Image src="/images/home/tab3.png" className="w-[20px] h-[20px]" disableSkeleton loading="eager" />
				立即买入
			</Button>
			<TradePopup
				isOpen={isTradePopupOpen}
				onOpenChange={setIsTradePopupOpen}
				initialMode={tradeMode}
				tokenAddress={data?.addr as string}
				// balances={balances}
				metaData={metaData}
			/>
		</div>
	)
}
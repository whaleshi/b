'use client';

import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { config } from "@/config/wagmi";
import { CONTRACT_CONFIG } from "@/config/chains";
import contractABI from "@/constant/TM.json";
import _bignumber from "bignumber.js";
import { Image } from "@heroui/react";
import { useCallback, useState, useEffect } from "react";

import TokenAbout from '@/components/token/about';
import TokenTrade from '@/components/token/trade';
import TokenHeader from '@/components/token/header';

interface TokenDetailClientProps {
	address: string;
}

export default function TokenDetailClient({ address }: TokenDetailClientProps) {
	const [tokenMetadata, setTokenMetadata] = useState<any>(null);

	// 黑名单检查
	const blacklist = ["0x2f4AbA8A2C5B05eBEde0f1A4bC6BDEA9d033b00C", "0x4cF7dEE78f01Af5ba6581A2B7A4b825E6F9d1c9f", "0xEf53B53EC0b02470C60Aa5C800318156E9Db769A"];
	const isBlacklisted = blacklist.includes(address);

	// 如果是黑名单地址，直接返回不存在页面
	if (isBlacklisted) {
		return (
			<div className="w-full max-w-[450px] h-full pt-[56px] px-[16px]">
				<div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center">
					<Image
						src="/images/home/search.png"
						className="w-[80px] h-[80px] !opacity-30"
						disableSkeleton
						loading="eager"
					/>
					<div className="text-[14px] text-[#fff] mt-[16px] mb-[8px]">代币不存在</div>
					<div className="text-[12px] text-[#6A6784] text-center">
						未找到该代币信息
					</div>
				</div>
			</div>
		);
	}

	// 获取 token 链上数据（3秒轮询）
	const { data: tokenData, isLoading, error } = useQuery({
		queryKey: ['tokenDetail', address],
		queryFn: async () => {
			try {
				// 获取 URI 和 coinInfo
				const [uri, tokenInfoResult] = await Promise.all([
					readContract(config, {
						address: CONTRACT_CONFIG.FACTORY_CONTRACT as `0x${string}`,
						abi: contractABI,
						functionName: "uri",
						args: [address],
					}) as Promise<string>,
					readContract(config, {
						address: CONTRACT_CONFIG.FACTORY_CONTRACT as `0x${string}`,
						abi: contractABI,
						functionName: "coinInfo",
						args: [address],
					}) as Promise<any[]>
				]);

				const tokenInfo = {
					base: tokenInfoResult[0],
					quote: tokenInfoResult[1],
					reserve0: tokenInfoResult[2],
					reserve1: tokenInfoResult[3],
					vReserve0: tokenInfoResult[4],
					vReserve1: tokenInfoResult[5],
					maxOffers: tokenInfoResult[6],
					totalSupply: tokenInfoResult[7],
					lastPrice: tokenInfoResult[8],
					target: tokenInfoResult[9],
					creator: tokenInfoResult[10],
					launched: tokenInfoResult[11]
				};

				// 计算进度
				let progress = 0;
				if (tokenInfo.reserve1 && tokenInfo.target) {
					const reserve = _bignumber(tokenInfo.reserve1.toString());
					const target = _bignumber(tokenInfo.target.toString());
					if (!target.isZero()) {
						progress = reserve.div(target).times(100).dp(2).toNumber();
						progress = Math.min(progress, 100);
					}
				}

				return {
					address,
					uri,
					tokenInfo,
					progress,
					totalSupply: tokenInfo.totalSupply ? Number(tokenInfo.totalSupply) / 1e18 : 0,
					distributionProgress: progress,
					distributionRemaining: tokenInfo.target ? Number(tokenInfo.target) / 1e18 : 0,
					raised: tokenInfo.reserve1 ? Number(tokenInfo.reserve1) / 1e18 : 0,
					currency: 'OKB',
					creator: tokenInfo.creator || 'Unknown',
					beneficiary: tokenInfo.creator || 'Unknown',
					participants: 0,
					launched: tokenInfo.launched,
					lastPrice: tokenInfo.lastPrice ? tokenInfo.lastPrice : 0,
					info: tokenInfo,
				};
			} catch (error) {
				console.error('Failed to fetch token data:', error);
				throw error;
			}
		},
		refetchInterval: 3000, // 3秒轮询
		staleTime: 0,
		gcTime: 30000,
		placeholderData: (previousData) => previousData,
		retry: 3,
		retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
		networkMode: 'online',
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
	});

	// 获取 metadata（只获取一次）
	const fetchTokenMetadata = useCallback(async (uri: string) => {
		if (!uri || uri === '' || tokenMetadata) return;

		try {
			// 处理IPFS URI
			let fetchUrl = uri;
			if (uri.startsWith('Qm') || uri.startsWith('bafy')) {
				fetchUrl = `https://ipfs.io/ipfs/${uri}`;
			} else if (uri.startsWith('ipfs://')) {
				fetchUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
			}

			console.log(`Fetching metadata for token ${address}:`, fetchUrl);

			const response = await fetch(fetchUrl);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const metadata = await response.json();
			console.log(metadata)
			setTokenMetadata({
				name: metadata.name || `Token ${address.slice(0, 6)}...${address.slice(-4)}`,
				symbol: metadata.symbol || 'UNKNOWN',
				description: metadata.description,
				image: metadata.image || '/images/common/default.png',
				website: metadata.website || '',
				x: metadata.x || '',
				telegram: metadata.telegram || ''
			});
		} catch (error) {
			console.warn('Failed to fetch token metadata:', error);
			setTokenMetadata({
				name: `Token ${address.slice(0, 6)}...${address.slice(-4)}`,
				symbol: 'UNKNOWN',
				description: 'Token Description',
				image: '/images/common/default.png',
			});
		}
	}, [address, tokenMetadata]);

	// 当有 URI 时获取 metadata
	useEffect(() => {
		if (tokenData?.uri && !tokenMetadata) {
			fetchTokenMetadata(tokenData.uri);
		}
	}, [tokenData?.uri, tokenMetadata, fetchTokenMetadata]);

	// Loading 状态
	if (isLoading || !tokenData) {
		return (
			<div className="w-full max-w-[450px] h-full pt-[56px] px-[16px]">
				<div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center">
					<Image
						src="/images/home/tab3.png"
						className="w-[80px] h-[80px] animate-bounce"
						disableSkeleton
						loading="eager"
					/>
					<div className="text-[12px] text-[#6A6784] mt-[10px]">加载代币信息中...</div>
				</div>
			</div>
		);
	}

	// Error 状态
	if (error) {
		return (
			<div className="w-full max-w-[450px] h-full pt-[56px] px-[16px]">
				<div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center">
					<Image
						src="/images/home/search.png"
						className="w-[80px] h-[80px] !opacity-30"
						disableSkeleton
						loading="eager"
					/>
					<div className="text-[14px] text-[#fff] mt-[16px] mb-[8px]">加载失败</div>
					<div className="text-[12px] text-[#6A6784] text-center">
						无法获取代币信息，请检查地址是否正确
					</div>
				</div>
			</div>
		);
	}

	// 合并数据
	const combinedData = {
		...tokenData,
		name: tokenMetadata?.name || `Token ${address.slice(0, 6)}...${address.slice(-4)}`,
		symbol: tokenMetadata?.symbol || 'UNKNOWN',
		description: tokenMetadata?.description,
		image: tokenMetadata?.image || '/images/common/default.png',
		tokenImage: tokenMetadata?.image || '/images/common/default.png',
		website: tokenMetadata?.website || '',
		x: tokenMetadata?.x || '',
		telegram: tokenMetadata?.telegram || ''
	};

	return (
		<div className="w-full max-w-[450px] h-full pt-[56px] px-[16px]">
			{/* Header */}
			<TokenHeader data={combinedData} />
			<div className="min-h-[calc(100vh-124px)] flex flex-col">
				<div>
					<TokenAbout data={combinedData} />
				</div>
				<div className='min-h-[100px]'></div>
				<TokenTrade data={combinedData} />
			</div>
		</div>
	);
}
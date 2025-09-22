import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { readContract } from "@wagmi/core";
import { encodeFunctionData, decodeFunctionResult } from "viem";
import _bignumber from "bignumber.js";
import {
    CONTRACT_CONFIG,
    MULTICALL3_ADDRESS,
    MULTICALL3_ABI,
} from "@/config/chains";
import { config } from "@/config/wagmi";
import contractABI from "@/constant/abi.json";

interface TokenInfo {
    base: string;
    quote: string;
    reserve0: bigint;
    reserve1: bigint;
    vReserve0: bigint;
    vReserve1: bigint;
    maxOffers: bigint;
    totalSupply: bigint;
    lastPrice: bigint;
    target: bigint;
    creator: string;
    launched: boolean;
}

interface TokenData {
    id: string;
    address: string;
    uri: string;
    info: TokenInfo | null;
    launched: boolean;
    progress: string;
    progressPercent: number;
}

interface TokenMetadata {
    address: string;
    metadata: any;
    name: string;
    symbol: string;
    description: string;
    image: string | null;
    website?: string;
    x?: string;
    telegram?: string;
}

export const useTokenList = () => {
    const [tokenMetadata, setTokenMetadata] = useState<{
        [address: string]: TokenMetadata;
    }>({});
    const fetchedTokens = useRef(new Set<string>());

    // 先获取 tokenCount
    const { data: tokenCountData } = useQuery({
        queryKey: ["tokenCount"],
        queryFn: async () => {
            console.log("Calling allTokens method...");
            const count = (await readContract(config, {
                address: CONTRACT_CONFIG.FACTORY_CONTRACT as `0x${string}`,
                abi: contractABI,
                functionName: "allTokens",
            })) as bigint;

            const tokenCount = Number(count);
            console.log("Token count from allTokens:", tokenCount);
            return tokenCount;
        },
        refetchInterval: 3000,
        staleTime: 0,
        gcTime: 30000,
        placeholderData: (previousData) => previousData,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        networkMode: "online",
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });

    // 只有当 tokenCount 变化时才获取完整的合约数据
    const {
        data: contractData,
        isLoading,
        isFetching,
        error,
    } = useQuery({
        queryKey: ["tokenContractData", tokenCountData],
        queryFn: async () => {
            const tokenCount = tokenCountData || 0;
            console.log("Fetching full token data for count:", tokenCount);

            if (tokenCount === 0) {
                return { tokenCount: 0, tokens: [] };
            }

            // 使用 Multicall 批量获取所有代币地址

            // 准备获取地址的 multicall 调用
            const addressCalls = [];
            for (let i = 0; i < tokenCount; i++) {
                addressCalls.push({
                    target: CONTRACT_CONFIG.FACTORY_CONTRACT,
                    allowFailure: true,
                    callData: encodeFunctionData({
                        abi: contractABI,
                        functionName: "tokens",
                        args: [i],
                    }),
                });
            }

            console.log(
                `Executing Multicall for ${tokenCount} token addresses...`
            );

            // 执行 multicall 获取地址
            const addressResults = (await readContract(config, {
                address: MULTICALL3_ADDRESS as `0x${string}`,
                abi: MULTICALL3_ABI,
                functionName: "aggregate3",
                args: [addressCalls],
            })) as any[];

            // 解析地址结果
            const addresses: string[] = [];
            addressResults.forEach((result: any, index: number) => {
                if (result.success) {
                    try {
                        const tokenAddress = decodeFunctionResult({
                            abi: contractABI,
                            functionName: "tokens",
                            data: result.returnData,
                        }) as string;
                        addresses.push(tokenAddress);
                        console.log(`Token ${index}: ${tokenAddress}`);
                    } catch (error) {
                        console.warn(
                            `Failed to decode token address at index ${index}:`,
                            error
                        );
                        addresses.push("");
                    }
                } else {
                    console.warn(
                        `Failed to get token address at index ${index}`
                    );
                    addresses.push("");
                }
            });

            const validAddresses = addresses.filter(
                (addr) => addr && addr !== ""
            );
            if (validAddresses.length === 0) {
                return { tokenCount, tokens: [] };
            }

            // 批量获取 URI 和 tokensInfo
            const dataCalls = [];
            for (const address of validAddresses) {
                // URI 调用
                dataCalls.push({
                    target: CONTRACT_CONFIG.FACTORY_CONTRACT,
                    allowFailure: true,
                    callData: encodeFunctionData({
                        abi: contractABI,
                        functionName: "uri",
                        args: [address],
                    }),
                });
                // tokensInfo 调用
                dataCalls.push({
                    target: CONTRACT_CONFIG.FACTORY_CONTRACT,
                    allowFailure: true,
                    callData: encodeFunctionData({
                        abi: contractABI,
                        functionName: "tokensInfo",
                        args: [address],
                    }),
                });
            }

            console.log(
                `Executing Multicall for ${validAddresses.length} tokens data...`
            );

            // 执行 multicall 获取数据
            const dataResults = (await readContract(config, {
                address: MULTICALL3_ADDRESS as `0x${string}`,
                abi: MULTICALL3_ABI,
                functionName: "aggregate3",
                args: [dataCalls],
            })) as any[];

            // 解析结果并组合成完整的token数组
            const tokens = validAddresses.map((address, index) => {
                const uriIndex = index * 2;
                const infoIndex = index * 2 + 1;

                // 解析 URI
                let uri = "";
                if (dataResults[uriIndex]?.success) {
                    try {
                        const tokenUri = decodeFunctionResult({
                            abi: contractABI,
                            functionName: "uri",
                            data: dataResults[uriIndex].returnData,
                        }) as string;
                        uri = tokenUri;
                    } catch (error) {
                        console.warn(
                            `Failed to decode URI for token ${address}:`,
                            error
                        );
                    }
                }

                // 解析 tokensInfo
                let tokenInfo = null;
                if (dataResults[infoIndex]?.success) {
                    try {
                        const tokenInfoResult = decodeFunctionResult({
                            abi: contractABI,
                            functionName: "tokensInfo",
                            data: dataResults[infoIndex].returnData,
                        }) as any[];
                        tokenInfo = {
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
                            launched: tokenInfoResult[11],
                        };
                    } catch (error) {
                        console.warn(
                            `Failed to decode tokensInfo for token ${address}:`,
                            error
                        );
                    }
                }

                // 计算进度
                let progress = 0;
                if (tokenInfo && tokenInfo.reserve1 && tokenInfo.target) {
                    const reserve = _bignumber(tokenInfo.reserve1.toString());
                    const target = _bignumber(tokenInfo.target.toString());
                    if (!target.isZero()) {
                        progress = reserve
                            .div(target)
                            .times(100)
                            .dp(2)
                            .toNumber();
                        progress = Math.min(progress, 100);
                    }
                }

                return {
                    id: address,
                    address: address,
                    uri: uri,
                    info: tokenInfo,
                    launched: tokenInfo?.launched || false,
                    progress: progress.toFixed(2),
                    progressPercent: progress,
                };
            });

            return { tokenCount, tokens };
        },
        enabled: !!(tokenCountData && tokenCountData > 0), // 只有当有 tokenCount 且大于0时才执行
        staleTime: 60000, // 60秒内数据新鲜
        gcTime: 300000, // 5分钟缓存
        placeholderData: (previousData) => previousData,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        networkMode: "online",
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });

    // 获取token metadata
    const fetchTokenMetadata = useCallback(async (tokens: TokenData[]) => {
        try {
            console.log("Fetching token metadata from URIs...");

            const BATCH_SIZE = 10;
            const allMetadata: { [address: string]: TokenMetadata } = {};

            for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
                const batch = tokens.slice(i, i + BATCH_SIZE);
                console.log(
                    `Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(tokens.length / BATCH_SIZE)}`
                );

                const batchPromises = batch.map(async (token) => {
                    if (!token.uri || token.uri === "") {
                        return {
                            address: token.address,
                            metadata: null,
                            name: `Token ${token.address.slice(0, 6)}...${token.address.slice(-4)}`,
                            symbol: "UNKNOWN",
                            description: "",
                            image: null,
                        };
                    }

                    try {
                        // 处理IPFS URI
                        let fetchUrl = token.uri;
                        if (
                            token.uri.startsWith("Qm") ||
                            token.uri.startsWith("bafy")
                        ) {
                            fetchUrl = `https://ipfs.io/ipfs/${token.uri}`;
                        } else if (token.uri.startsWith("ipfs://")) {
                            fetchUrl = token.uri.replace(
                                "ipfs://",
                                "https://ipfs.io/ipfs/"
                            );
                        }

                        console.log(
                            `Fetching metadata for token ${token.address}:`,
                            fetchUrl
                        );

                        const response = await fetch(fetchUrl);
                        if (!response.ok) {
                            throw new Error(`HTTP ${response.status}`);
                        }

                        const metadata = await response.json();

                        return {
                            address: token.address,
                            metadata,
                            name:
                                metadata.name ||
                                `Token ${token.address.slice(0, 6)}...${token.address.slice(-4)}`,
                            symbol: metadata.symbol || "UNKNOWN",
                            description: metadata.description || "",
                            image: metadata.image || null,
                            website: metadata.website || "",
                            x: metadata.x || "",
                            telegram: metadata.telegram || "",
                        };
                    } catch (error) {
                        console.warn(
                            `Failed to fetch metadata for token ${token.address}:`,
                            error
                        );
                        return {
                            address: token.address,
                            metadata: null,
                            name: `Token ${token.address.slice(0, 6)}...${token.address.slice(-4)}`,
                            symbol: "UNKNOWN",
                            description: "",
                            image: null,
                        };
                    }
                });

                const batchResults = await Promise.allSettled(batchPromises);
                batchResults.forEach((result, batchIndex) => {
                    const token = batch[batchIndex];
                    if (result.status === "fulfilled") {
                        allMetadata[token.address] = result.value;
                    } else {
                        console.warn(
                            `Failed to process metadata for token ${token.address}:`,
                            result.reason
                        );
                        allMetadata[token.address] = {
                            address: token.address,
                            metadata: null,
                            name: `Token ${token.address.slice(0, 6)}...${token.address.slice(-4)}`,
                            symbol: "UNKNOWN",
                            description: "",
                            image: null,
                        };
                    }
                });

                if (i + BATCH_SIZE < tokens.length) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
            }

            setTokenMetadata((prev) => ({ ...prev, ...allMetadata }));
            console.log("Token metadata fetched:", allMetadata);

            tokens.forEach((token) => {
                fetchedTokens.current.add(token.address);
            });
        } catch (error) {
            console.error("Error fetching token metadata:", error);
        }
    }, []);

    // 获取metadata
    useEffect(() => {
        if (contractData?.tokens) {
            const tokensWithUri = contractData.tokens.filter(
                (token: TokenData) => token.uri && token.uri !== ""
            );
            if (tokensWithUri.length > 0) {
                const newTokens = tokensWithUri.filter(
                    (token: TokenData) =>
                        !fetchedTokens.current.has(token.address)
                );
                if (newTokens.length > 0) {
                    console.log(
                        "Fetching metadata for new tokens:",
                        newTokens.map((t) => t.address)
                    );
                    fetchTokenMetadata(newTokens);
                }
            }
        }
    }, [contractData, fetchTokenMetadata]);

    // 过滤和排序函数
    const getFilteredTokenList = useCallback(
        (tokens: TokenData[], query: string) => {
            if (!query || query.trim() === "") return tokens;
            return tokens.filter(
                (token) =>
                    token.address &&
                    token.address
                        .toLowerCase()
                        .includes(query.toLowerCase().trim())
            );
        },
        []
    );

    const getSortedTokenList = useCallback(
        (tokens: TokenData[], activeTab: number) => {
            if (!tokens || tokens.length === 0) return tokens;

            const sortedTokens = [...tokens];

            switch (activeTab) {
                case 0: // 新创建 - 倒序，过滤掉100%进度的
                    return sortedTokens
                        .filter(
                            (token) => parseFloat(token.progress || "0") < 100
                        )
                        .reverse();

                case 1: // 飙升 - 按进度最高排序，过滤掉100%进度的
                    return sortedTokens
                        .filter(
                            (token) => parseFloat(token.progress || "0") < 100
                        )
                        .sort((a, b) => {
                            const progressA = parseFloat(a.progress || "0");
                            const progressB = parseFloat(b.progress || "0");
                            return progressB - progressA;
                        });

                case 2: // 新开盘 - 只显示launched=true的token
                    const launchedTokens = sortedTokens.filter(
                        (token) => token.launched === true
                    );
                    return launchedTokens.sort((a, b) => {
                        const progressA = parseFloat(a.progress || "0");
                        const progressB = parseFloat(b.progress || "0");
                        return progressB - progressA;
                    });

                default:
                    return sortedTokens;
            }
        },
        []
    );

    return {
        // 数据
        tokens: contractData?.tokens || [],
        tokenCount: contractData?.tokenCount || 0,
        tokenMetadata,

        // 状态
        isLoading,
        isFetching,
        error,

        // 工具函数
        getFilteredTokenList,
        getSortedTokenList,
    };
};

//   使用方式：
//   const {
//       tokens,
//       tokenMetadata,
//       isLoading,
//       getFilteredTokenList,
//       getSortedTokenList
//   } = useTokenList();

//   // 使用示例
//   const filteredTokens = getFilteredTokenList(tokens, searchQuery);
//   const sortedTokens = getSortedTokenList(filteredTokens, activeTab);

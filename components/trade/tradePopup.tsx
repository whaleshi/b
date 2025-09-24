import React, { useState, useEffect } from "react";
import { Input, Button, useDisclosure } from "@heroui/react";
import { toast } from "sonner";
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import Slippage from "@/components/trade/slippagePopup";
import { useTokenTrading } from "@/hooks/useTokenTrading";
import ResponsiveDialog from "../modal";
import { formatBigNumber } from '@/utils/formatBigNumber';
import _bignumber from "bignumber.js";
import { useSlippageStore } from "@/stores/useSlippageStore";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { readContract, getBalance } from "@wagmi/core";
import { parseEther, formatEther } from "viem";
import { CONTRACT_CONFIG } from "@/config/chains";
import { config } from "@/config/wagmi";
import contractABI from "@/constant/TM.json";
import swapABI from "@/constant/Swap.json";

interface TradeProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialMode?: boolean; // true for buy, false for sell
    tokenAddress?: string; // token address for trading
    balances?: any; // user's token balance
    metaData?: any; // token metadata
    embedded?: boolean; // 新增：是否为嵌入模式（不使用弹窗）
}

export default function Trade({ isOpen = false, onOpenChange, initialMode = true, tokenAddress, balances, metaData, embedded = false }: TradeProps) {
    const [isBuy, setIsBuy] = useState(initialMode);
    const [isSlippageOpen, setIsSlippageOpen] = useState(false);
    const [inputAmount, setInputAmount] = useState("");
    const [outputAmount, setOutputAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // AppKit hooks
    const { address, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();
    const queryClient = useQueryClient();

    // 使用自定义trading hooks
    const { handleBuy, handleSell, handleSwapBuy, handleSwapSell } = useTokenTrading();

    // 根据 progress 判断使用内盘还是外盘
    const isSwapMode = metaData?.progress >= 100;
    const { slippage } = useSlippageStore();

    // 如果没有传入balances，则自己查询余额
    const { data: currentBalances, isLoading: balanceLoading } = useQuery({
        queryKey: ['userBalances', tokenAddress, address],
        queryFn: async () => {
            if (!isConnected || !address) {
                return { tokenBalance: '0', walletBalance: '0' };
            }

            try {
                // 获取原生代币余额（OKB）
                const walletBalance = await getBalance(config, {
                    address: address as `0x${string}`,
                });
                let tokenBalance = BigInt(0);

                // 如果有代币地址，获取代币余额
                if (tokenAddress) {
                    const tokenABI = [
                        {
                            name: "balanceOf",
                            type: "function",
                            stateMutability: "view",
                            inputs: [{ name: "owner", type: "address" }],
                            outputs: [{ name: "", type: "uint256" }],
                        },
                    ];
                    tokenBalance = await readContract(config, {
                        address: tokenAddress as `0x${string}`,
                        abi: tokenABI,
                        functionName: "balanceOf",
                        args: [address],
                    }) as bigint;
                }

                return {
                    walletBalance: formatEther(walletBalance.value), // OKB余额
                    tokenBalance: formatEther(tokenBalance) // 代币余额
                };
            } catch (error) {
                console.log('Failed to fetch balances:', error);
                return { tokenBalance: '0', walletBalance: '0' };
            }
        },
        enabled: !!(isConnected && address), // 只有在没有传入balances且钱包连接时才查询
        refetchInterval: 3000, // 每3秒刷新一次余额
        staleTime: 2000, // 2秒内的数据认为是新鲜的
        retry: 2, // 失败时重试2次
    });


    // 预估输出金额 - 当输入框有值时每3秒调用一次，支持内盘和外盘
    const { data: estimatedOutput } = useQuery({
        queryKey: ['estimateOutput', tokenAddress, inputAmount, isBuy, address, isSwapMode],
        queryFn: async () => {
            if (!inputAmount || !tokenAddress || !isConnected || !address || parseFloat(inputAmount) <= 0) {
                return '0';
            }

            try {
                if (isSwapMode) {
                    // 外盘 Swap 预估
                    if (isBuy) {
                        // ETH -> Token：调用 getAmountsOut
                        const path = [CONTRACT_CONFIG.WETH_ADDRESS, tokenAddress];
                        const amountIn = parseEther(inputAmount);

                        const amounts = await readContract(config, {
                            address: CONTRACT_CONFIG.ROUTER_CONTRACT as `0x${string}`,
                            abi: swapABI,
                            functionName: "getAmountsOut",
                            args: [amountIn, path],
                        }) as bigint[];

                        // amounts[1] 是输出的代币数量
                        return formatEther(amounts[1]);
                    } else {
                        // Token -> ETH：调用 getAmountsOut
                        const path = [tokenAddress, CONTRACT_CONFIG.WETH_ADDRESS];
                        const amountIn = parseEther(inputAmount);

                        const amounts = await readContract(config, {
                            address: CONTRACT_CONFIG.ROUTER_CONTRACT as `0x${string}`,
                            abi: swapABI,
                            functionName: "getAmountsOut",
                            args: [amountIn, path],
                        }) as bigint[];

                        // amounts[1] 是输出的 ETH 数量
                        return formatEther(amounts[1]);
                    }
                } else {
                    // 内盘预估（原有逻辑）
                    if (isBuy) {
                        // 调用 tryBuy 获取预期代币输出
                        const result = await readContract(config, {
                            address: CONTRACT_CONFIG.FACTORY_CONTRACT as `0x${string}`,
                            abi: contractABI,
                            functionName: "tryBuy",
                            args: [tokenAddress, parseEther(inputAmount)],
                        }) as any[];
                        const tokenAmountOut = result[0];
                        return formatEther(tokenAmountOut);
                    } else {
                        // 调用 trySell 获取预期ETH输出
                        const sellAmount = parseEther(inputAmount);
                        const result = await readContract(config, {
                            address: CONTRACT_CONFIG.FACTORY_CONTRACT as `0x${string}`,
                            abi: contractABI,
                            functionName: "trySell",
                            args: [tokenAddress, sellAmount],
                        }) as bigint;
                        return formatEther(result);
                    }
                }
            } catch (error) {
                console.error('预估输出失败:', error);
                return '0';
            }
        },
        enabled: !!(inputAmount && tokenAddress && isConnected && address && parseFloat(inputAmount) > 0),
        refetchInterval: 3000, // 每3秒刷新一次
        staleTime: 2000,
        retry: 1,
    });

    const buyAmounts = [
        { label: "0.5 OKB", value: 0.5 },
        { label: "1 OKB", value: 1 },
        { label: "2 OKB", value: 2 },
        { label: "5 OKB", value: 5 }
    ];

    const sellAmounts = [
        { label: "25%", value: 0.25 },
        { label: "50%", value: 0.5 },
        { label: "75%", value: 0.75 },
        { label: "100%", value: 1.0 }
    ];

    const tabs = [
        { id: true, label: "买入" },
        { id: false, label: "卖出" }
    ];

    // 监听initialMode变化，在弹窗打开时设置对应的模式
    useEffect(() => {
        if (isOpen) {
            setIsBuy(initialMode);
            setInputAmount(""); // 清空输入框
        }
    }, [isOpen, initialMode]);

    // 监听买入/卖出模式切换，清空输入框
    useEffect(() => {
        setInputAmount("");
        setOutputAmount("");
    }, [isBuy]);

    // 监听预估输出变化，更新输出框
    useEffect(() => {
        if (estimatedOutput) {
            // 格式化输出，去除多余的小数位
            const formatted = parseFloat(estimatedOutput).toFixed(6).replace(/\.?0+$/, '');
            setOutputAmount(formatted);
        } else {
            setOutputAmount("");
        }
    }, [estimatedOutput]);

    const handleAmountClick = (amount: { label: string; value: number | null }) => {
        if (isLoading) return; // 加载中禁用点击

        if (amount.value === null) {
            // 处理"更多"按钮逻辑
            return;
        }

        if (isBuy) {
            // 买入时直接设置金额
            setInputAmount(amount.value.toString());
        } else {
            // 卖出时按百分比计算，基于实际的token余额，使用bignumber确保精度
            if (currentBalances?.tokenBalance && _bignumber(currentBalances?.tokenBalance).gt(0)) {
                try {
                    const userBalance = _bignumber(currentBalances?.tokenBalance);
                    const percentage = _bignumber(amount.value);
                    const sellAmount = userBalance.times(percentage);

                    // 格式化结果，去除尾随零
                    const formattedAmount = sellAmount.dp(18, _bignumber.ROUND_DOWN).toFixed();
                    setInputAmount(formattedAmount.replace(/\.?0+$/, ''));
                } catch (error) {
                    console.error('try fail:', error);
                    setInputAmount('0');
                }
            } else {
                // 如果没有余额，设置为0
                setInputAmount('0');
            }
        }
    };


    const handleTradeSubmit = async () => {
        if (!isConnected) {
            if (openConnectModal) openConnectModal();
            return;
        }

        // 验证输入金额
        if (!inputAmount || parseFloat(inputAmount) <= 0) {
            toast.error('请输入有效金额', { icon: null });
            return;
        }

        setIsLoading(true);

        try {
            // 使用传入的tokenAddress，如果没有则使用默认地址
            const currentTokenAddress = tokenAddress as string;

            if (isBuy) {
                if (isSwapMode) {
                    // 外盘 Swap 买入
                    await handleSwapBuy(currentTokenAddress, inputAmount);
                    toast.success(`外盘买入成功`, { icon: null });
                } else {
                    // 内盘买入
                    await handleBuy(currentTokenAddress, inputAmount);
                    toast.success(`内盘买入成功`, { icon: null });
                }
            } else {
                if (isSwapMode) {
                    // 外盘 Swap 卖出
                    await handleSwapSell(currentTokenAddress, inputAmount);
                    toast.success(`外盘卖出成功`, { icon: null });
                } else {
                    // 内盘卖出
                    await handleSell(currentTokenAddress, inputAmount);
                    toast.success(`内盘卖出成功`, { icon: null });
                }
            }

            await queryClient.invalidateQueries({
                queryKey: ['userBalances']
            });
            await queryClient.invalidateQueries({
                queryKey: ['walletBalance']
            });

            // 重置状态
            setInputAmount("");
            setOutputAmount("");
        } catch (error: any) {
            toast.error(`${isBuy ? '买入失败，请重试' : '卖出失败，请重试'}`, { icon: null });
        } finally {
            setIsLoading(false);
        }
    };

    // 交易界面内容
    const tradeContent = (
        <div className="space-y-4">
            {/* 只在嵌入模式显示标签选择 */}
            {embedded && (
                <div className="flex gap-[16px] text-[16px] mb-4">
                    {tabs.map((tab) => (
                        <div
                            key={String(tab.id)}
                            className={
                                isBuy === tab.id
                                    ? "text-[#FFF] cursor-pointer"
                                    : "cursor-pointer text-[#808C92]"
                            }
                            onClick={() => setIsBuy(tab.id)}
                        >
                            {tab.label}
                        </div>
                    ))}
                </div>
            )}

            <div>
                <Input
                    classNames={{
                        inputWrapper:
                            "px-[18px] py-3.5 bg-[rgba(255,255,255,0.05)] border-0 rounded-[12px] h-[52]",
                        input: "text-[14px] text-[#fff] placeholder:text-[#999] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    }}
                    labelPlacement="outside"
                    placeholder={isBuy ? "0.00" : "0.00"}
                    variant="bordered"
                    type="text"
                    inputMode="decimal"
                    value={inputAmount}
                    onChange={(e) => {
                        const value = e.target.value;
                        // 只允许数字和小数点
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            setInputAmount(value);
                        }
                    }}
                    onKeyDown={(e) => {
                        // 阻止上下箭头键
                        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault();
                        }
                    }}
                    disabled={isLoading}
                    endContent={
                        <span className="text-sm font-medium text-[#FFF]">{!isBuy ? metaData?.symbol : 'OKB'}</span>
                    }
                />
            </div>
            <div className="flex items-center justify-between gap-[12px]">
                {(isBuy ? buyAmounts : sellAmounts).map((amount) => (
                    <Button
                        key={amount.label}
                        radius="none"
                        // fullWidth
                        className="bg-[rgba(255,255,255,0.05)] min-w-[10px] flex-1 text-[#FFF] rounded-[12px] text-[12px]"
                        disabled={isLoading}
                        onPress={() => handleAmountClick(amount)}
                    >
                        {amount.label}
                    </Button>
                ))}
            </div>
            <div className="flex items-center justify-end">
                <span className="text-[#808C92] text-xs">
                    余额 <i className="text-[#FFF]  not-italic">{isConnected ? formatBigNumber(isBuy ? currentBalances?.walletBalance as string : currentBalances?.tokenBalance as string) : '-'}</i>
                </span>
            </div>
            <div>
                <div className="text-[16px] text-[#808C92] mb-[12px]">预计获得</div>
                <Input
                    classNames={{
                        inputWrapper:
                            "px-[18px] py-3.5 bg-[rgba(255,255,255,0.05)] border-0 rounded-[12px] h-[52]",
                        input: "text-[14px] text-[#fff] placeholder:text-[#999]",
                    }}
                    placeholder="0.00"
                    variant="bordered"
                    value={outputAmount}
                    readOnly
                    endContent={
                        <span className="text-sm font-medium text-[#fff]">{isBuy ? metaData?.symbol : 'OKB'}</span>
                    }
                />
            </div>
            <Button
                className={`text-[#101010] h-[48px] rounded-[12px] w-full ${isBuy ? "bg-[#0F9]" : "bg-[#EE2E76]"
                    }`}
                disabled={isLoading}
                isLoading={isLoading}
                onPress={handleTradeSubmit}
            >
                {isLoading ? "交易中..." : !isConnected ? "连接钱包" : (isBuy ? "立即买入" : "立即卖出")}
            </Button>

            <div className="p-4 bg-[rgba(255,255,255,0.05)] rounded-[12px]">
                <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#808C92]">滑点</span>
                    <span className="text-[#999]">
                        <span className="underline text-[#FFF]">{slippage}%</span>
                        <span
                            className="cursor-pointer text-[#808C92] ml-[4px]"
                            onClick={() => setIsSlippageOpen(true)}
                        >
                            设置
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <Slippage isOpen={isSlippageOpen} onOpenChange={setIsSlippageOpen} />

            {embedded ? (
                // 嵌入模式：直接显示内容，带背景卡片
                <div className="bg-[rgba(255,255,255,0.03)] rounded-[20px] p-[24px] border border-[rgba(255,255,255,0.08)]">
                    <h3 className="text-[18px] text-[#FFF] font-semibold mb-[20px]">交易</h3>
                    {tradeContent}
                </div>
            ) : (
                // 弹窗模式：原有逻辑
                <ResponsiveDialog
                    isOpen={isOpen}
                    onOpenChange={onOpenChange ?? (() => { })}
                    maxVH={70}
                    size="md"
                    classNames={{ body: "text-[#fff]", header: "justify-start" }}
                    title={
                        <div className="flex gap-[16px] text-[16px]">
                            {tabs.map((tab) => (
                                <div
                                    key={String(tab.id)}
                                    className={
                                        isBuy === tab.id
                                            ? "text-[#FFF] cursor-pointer"
                                            : "cursor-pointer text-[#808C92]"
                                    }
                                    onClick={() => setIsBuy(tab.id)}
                                >
                                    {tab.label}
                                </div>
                            ))}
                        </div>
                    }
                >
                    {tradeContent}
                </ResponsiveDialog>
            )}
        </div>
    );
}


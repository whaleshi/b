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
import { ethers } from "ethers";
import { DEFAULT_CHAIN_CONFIG, CONTRACT_CONFIG } from "@/config/chains";

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
    const { handleBuy, handleSell } = useTokenTrading();
    const { slippage } = useSlippageStore();

    // 如果没有传入balances，则自己查询余额
    const { data: internalBalances, isLoading: balanceLoading } = useQuery({
        queryKey: ['userBalances', tokenAddress, address],
        queryFn: async () => {
            if (!isConnected || !address) {
                return { tokenBalance: '0', walletBalance: '0' };
            }

            try {
                const provider = new ethers.JsonRpcProvider(DEFAULT_CHAIN_CONFIG.rpcUrl);

                // 同时获取OKB余额和代币余额
                const promises = [
                    // 获取OKB余额
                    provider.getBalance(address)
                ];

                // 如果有代币地址，添加代币余额查询
                if (tokenAddress) {
                    const tokenABI = ["function balanceOf(address owner) view returns (uint256)"];
                    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
                    promises.push(tokenContract.balanceOf(address));
                }

                const results = await Promise.all(promises);

                return {
                    walletBalance: ethers.formatEther(results[0]), // OKB余额
                    tokenBalance: tokenAddress && results[1] ? ethers.formatEther(results[1]) : '0' // 代币余额
                };
            } catch (error) {
                return { tokenBalance: '0', walletBalance: '0' };
            }
        },
        enabled: !!(isConnected && address && !balances), // 只有在没有传入balances且钱包连接时才查询
        refetchInterval: 3000, // 每3秒刷新一次余额
        staleTime: 2000, // 2秒内的数据认为是新鲜的
        retry: 2, // 失败时重试2次
    });

    // 使用传入的balances或查询到的internalBalances
    const currentBalances = balances || internalBalances;

    // 预估输出金额 - 当输入框有值时每3秒调用一次
    const { data: estimatedOutput } = useQuery({
        queryKey: ['estimateOutput', tokenAddress, inputAmount, isBuy, address],
        queryFn: async () => {
            if (!inputAmount || !tokenAddress || !isConnected || !address || parseFloat(inputAmount) <= 0) {
                return '0';
            }

            try {
                const contractABI = (await import('@/constant/abi.json')).default;
                const provider = new ethers.JsonRpcProvider(DEFAULT_CHAIN_CONFIG.rpcUrl);
                const readOnlyContract = new ethers.Contract(CONTRACT_CONFIG.FACTORY_CONTRACT, contractABI, provider);

                if (isBuy) {
                    // 调用 tryBuy 获取预期代币输出
                    const result = await readOnlyContract.tryBuy(tokenAddress, ethers.parseEther(inputAmount));
                    const tokenAmountOut = result[0];
                    return ethers.formatEther(tokenAmountOut);
                } else {
                    // 调用 trySell 获取预期ETH输出
                    const sellAmount = ethers.parseEther(inputAmount);
                    const result = await readOnlyContract.trySell(tokenAddress, sellAmount);
                    return ethers.formatEther(result);
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
        { id: true, label: "Buy" },
        { id: false, label: "Sell" }
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
            // 买入时直接设置金额，确保不超过1
            const finalAmount = Math.min(amount.value, 1);
            setInputAmount(finalAmount.toString());
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
            toast.error('Please enter a valid amount', { icon: null });
            return;
        }

        setIsLoading(true);

        try {
            // 使用传入的tokenAddress，如果没有则使用默认地址
            const currentTokenAddress = tokenAddress as string;

            if (isBuy) {
                const result = await handleBuy(currentTokenAddress, inputAmount);
                toast.success(`Buy Successful`, { icon: null });
            } else {
                const result = await handleSell(currentTokenAddress, inputAmount);
                toast.success(`Sell Successful`, { icon: null });
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
            toast.error(`${isBuy ? 'Launch Failed. Please Try Again' : 'Sell Failed. Please Try Again'}`, { icon: null });
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
                            if (isBuy) {
                                // 买入时限制最大值为1
                                const numValue = parseFloat(value);
                                if (value === '' || (!isNaN(numValue) && numValue <= 2)) {
                                    setInputAmount(value);
                                }
                            } else {
                                // 卖出时不限制
                                setInputAmount(value);
                            }
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
                        fullWidth
                        className="bg-[rgba(255,255,255,0.05)] text-[#FFF] rounded-[12px] text-[12px]"
                        disabled={isLoading}
                        onClick={() => handleAmountClick(amount)}
                    >
                        {amount.label}
                    </Button>
                ))}
            </div>
            <div className="flex items-center justify-end">
                <span className="text-[#808C92] text-xs">
                    Balaunce <i className="text-[#FFF]  not-italic">{isConnected ? formatBigNumber(isBuy ? currentBalances?.walletBalance : currentBalances?.tokenBalance) : '-'}</i>
                </span>
            </div>
            <div>
                <div className="text-[16px] text-[#808C92] mb-[12px]">Receive</div>
                <Input
                    classNames={{
                        inputWrapper:
                            "px-[18px] py-3.5 bg-[rgba(255,255,255,0.05)] border-0 rounded-[12px] h-[52]",
                        input: "text-[14px] text-[#fff] placeholder:text-[#999]",
                    }}
                    labelPlacement="outside"
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
                {isLoading ? "Trading..." : !isConnected ? "Connect" : (isBuy ? "Buy" : "Sell")}
            </Button>

            <div className="p-4 bg-[rgba(255,255,255,0.05)] rounded-[12px]">
                <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#808C92]">Slippage</span>
                    <span className="text-[#999]">
                        <span className="underline text-[#FFF]">{slippage}%</span>
                        <span
                            className="cursor-pointer text-[#808C92] ml-[4px]"
                            onClick={() => setIsSlippageOpen(true)}
                        >
                            Setting
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
                    <h3 className="text-[18px] text-[#FFF] font-semibold mb-[20px]">Trade</h3>
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


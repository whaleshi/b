"use client";

import { useQuery } from "@tanstack/react-query";

interface OkxTickerResponse {
    code: string;
    data: Array<{
        instId: string;
        last: string;
        lastSz: string;
        askPx: string;
        bidPx: string;
        open24h: string;
        high24h: string;
        low24h: string;
        volCcy24h: string;
        vol24h: string;
        sodUtc0: string;
        sodUtc8: string;
        ts: string;
    }>;
    msg: string;
}

interface UseOkxPriceOptions {
    instId?: string;
    refetchInterval?: number;
    enabled?: boolean;
}

export default function useOkxPrice(options: UseOkxPriceOptions = {}) {
    const {
        instId = "OKB-USDT",
        refetchInterval = 10000,
        enabled = true
    } = options;

    const { data, isLoading, error, isError } = useQuery<OkxTickerResponse>({
        queryKey: ['okxPrice', instId],
        queryFn: async () => {
            const response = await fetch(`https://www.okx.com/api/v5/market/ticker?instId=${instId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.code !== "0") {
                throw new Error(data.msg || 'Failed to fetch price data');
            }

            return data;
        },
        refetchInterval,
        enabled,
        staleTime: 5000,
        retry: 3,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        networkMode: 'online',
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    });

    const ticker = data?.data?.[0];

    return {
        data,
        ticker,
        price: ticker?.last ? parseFloat(ticker.last) : null,
        change24h: ticker?.open24h && ticker?.last ? 
            ((parseFloat(ticker.last) - parseFloat(ticker.open24h)) / parseFloat(ticker.open24h) * 100) : null,
        volume24h: ticker?.vol24h ? parseFloat(ticker.vol24h) : null,
        high24h: ticker?.high24h ? parseFloat(ticker.high24h) : null,
        low24h: ticker?.low24h ? parseFloat(ticker.low24h) : null,
        isLoading,
        error,
        isError,
    } as const;
}
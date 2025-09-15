export const getApiBaseUrl = (): string => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "";
    return `${base}/v1`;
};

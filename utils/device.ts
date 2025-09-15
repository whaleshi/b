/**
 * 设备与环境相关的工具函数
 */

export type IsMobileOptions = {
    /** 自定义 UA（如在 Next.js 服务端可从请求头传入） */
    userAgent?: string;
    /** 平板是否视为移动端，默认 true */
    tabletIsMobile?: boolean;
    /** 当 UA 不可用时，是否回退到视口宽度判断，默认 true */
    fallbackToViewport?: boolean;
    /** 视口宽度阈值，默认 767 */
    mobileMaxWidth?: number;
};

/**
 * 判断是否为移动端设备（SSR 安全）。
 *
 * 逻辑：
 * 1) 优先使用提供的 userAgent 或浏览器的 navigator.userAgent 做 UA 检测；
 * 2) 如果 UA 不可用（如在服务端渲染期间），可选地回退到视口宽度判断。
 */
export function isMobile(options: IsMobileOptions = {}): boolean {
    const {
        userAgent,
        tabletIsMobile = true,
        fallbackToViewport = true,
        mobileMaxWidth = 767,
    } = options;

    const uaSource =
        userAgent ??
        (typeof navigator !== "undefined" ? navigator.userAgent : "");

    if (uaSource) {
        const ua = uaSource.toLowerCase();
        const phonePattern =
            /(iphone|ipod|windows phone|blackberry|bb10|opera mini|mobi|mobile)/i;
        const androidPhonePattern = /(android).*(mobile)/i; // 仅匹配安卓手机
        const tabletPattern = /(ipad|tablet|kindle|silk|playbook)/i;
        const androidTabletPattern = /(android)(?!.*mobile)/i; // 安卓平板

        const isPhone = phonePattern.test(ua) || androidPhonePattern.test(ua);
        const isTablet =
            tabletPattern.test(ua) || androidTabletPattern.test(ua);

        if (isPhone) return true;
        if (isTablet) return !!tabletIsMobile;
        return false;
    }

    // UA 不可用（如 SSR）时的回退逻辑
    if (fallbackToViewport && typeof window !== "undefined") {
        try {
            if (window.matchMedia) {
                return window.matchMedia(`(max-width: ${mobileMaxWidth}px)`)
                    .matches;
            }
            return window.innerWidth <= mobileMaxWidth;
        } catch {
            return false;
        }
    }

    return false;
}

/**
 * 是否支持触摸（可用于进一步辅助判断）。
 */
export function isTouchDevice(): boolean {
    if (typeof window === "undefined") return false;
    return (
        "ontouchstart" in window ||
        (navigator as any)?.maxTouchPoints > 0 ||
        (navigator as any)?.msMaxTouchPoints > 0
    );
}

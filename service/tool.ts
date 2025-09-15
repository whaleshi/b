import QS from "qs";
import http from "./http";
import { hex_md5 } from "./md5";
import { baseString } from "./sort";
import Cookies from "js-cookie";
import { useAuthStore } from "@/stores/auth";
import Router from "next/router";

type AnyObject = Record<string, any>;

export function get<T = any>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
        http.get<T>(url)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err?.data));
    });
}

export function post<T = any>(url: string, params?: AnyObject): Promise<T> {
    return new Promise((resolve, reject) => {
        http.post<T>(url, QS.stringify(params ?? {}))
            .then((res) => resolve(res.data))
            .catch((err) => reject(err?.data));
    });
}

export async function _post<T = any>(
    url: string,
    params: AnyObject = {}
): Promise<T> {
    const token = Cookies.get("login_token");
    const secret = Cookies.get("login_secret");
    if (!token || !secret) {
        Cookies.remove("login_token");
        Cookies.remove("login_secret");
        try {
            useAuthStore.getState().clearAuthState();
        } catch {}
        Router.replace("/");
        return Promise.reject(new Error("Not logged in or login has expired"));
    }

    const data_base: AnyObject = {};
    const data: AnyObject = params;
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = hex_md5(String(timestamp));

    const app_secret = process.env.NEXT_PUBLIC_APP_SECRET ?? "";
    const name = process.env.NEXT_PUBLIC_API_URL ?? "";

    const routeName = url.split(name)[1];
    const access_secret = Cookies.get("login_secret") || "我的天哪噜";
    const access_token = Cookies.get("login_token") || "我的天哪噜";
    data.app_id = process.env.NEXT_PUBLIC_APP_ID;
    data.timestamp = timestamp;
    data.access_token = access_token;
    data.lang = "en-US";
    data.nonce = nonce;

    data_base.timestamp = timestamp;
    data_base.nonce = nonce;

    const baseString1 = baseString(data_base, routeName, "POST", url);
    data.sign = hex_md5(baseString1 + app_secret + access_secret);

    return new Promise((resolve, reject) => {
        http.post<T>(url, QS.stringify(data))
            .then((res) => resolve(res.data))
            .catch((err) => reject(err?.data));
    });
}

export function post2<T = any>(url: string, params?: AnyObject): Promise<T> {
    return new Promise((resolve, reject) => {
        http
            // Note: this route expects JSON or raw body; keeping signature for compatibility
            .post<T>(url, params as any)
            .then((res) => resolve(res.data))
            .catch((err) => reject(err?.data));
    });
}

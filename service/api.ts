import { getApiBaseUrl } from "./base";
import { post, _post } from "./tool";

type Params = Record<string, any>;

export const getCoinList = (params: Params) =>
    post(`${getApiBaseUrl()}/okx/coin_list`, params);
export const getCoinDetails = (params: Params) =>
    post(`${getApiBaseUrl()}/okx/coin_show`, params);
export const getCheckData = (params: Params) =>
    post(`${getApiBaseUrl()}/okx/check_data`, params);
export const getAddr = (params: Params) =>
    post(`${getApiBaseUrl()}/okx/query_by_user_name`, params);
export const getRewardList = (params: Params) =>
    post(`${getApiBaseUrl()}/okx/reward_list`, params);
export const getLuckyToken = (params: Params) =>
    post(`${getApiBaseUrl()}/okx/lucky_token`, params);

export const getLoginin = (params: Params) =>
    post(`${getApiBaseUrl()}/origin/privy/login`, params);

export const setCode = (params: Params) =>
    _post(`${getApiBaseUrl()}/mmm/invite/set`, params);

export const createCoin = (params: Params) =>
    _post(`${getApiBaseUrl()}/mmm/coin_create`, params);
export const getCreateMint = (params: Params) =>
    _post(`${getApiBaseUrl()}/mmm/query_mint`, params);
export const getFeeSign = (params: Params) =>
    _post(`${getApiBaseUrl()}/mmm/redpacket/sign`, params);
export const getPaidSign = (params: Params) =>
    _post(`${getApiBaseUrl()}/mmm/redpacket/sing_paid`, params);

export const getChainConfig = (params: Params) =>
    post(`${getApiBaseUrl()}/mmm/query/chain_asset_config`, params);
export const getNumConfig = (params: Params) =>
    post(`${getApiBaseUrl()}/mmm/config`, params);

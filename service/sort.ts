import QS from "qs";

function getObjectKey(obj: Record<string, unknown>) {
    return Object.keys(obj);
}

function getKeySort(strArr: string[]) {
    let compareInt = 0;
    for (let i = 0; i < strArr.length; i++) {
        for (let j = 0; j < strArr.length - 1 - i; j++) {
            compareToIndexValue(strArr, compareInt, j);
        }
    }
    return strArr;
}

function compareToIndexValue(arr: string[], int: number, arrIndex: number) {
    if (
        arr[arrIndex].substring(int, int + 1) ==
        arr[arrIndex + 1].substring(int, int + 1)
    )
        compareToIndexValue(arr, int + 1, arrIndex);
    else if (
        arr[arrIndex].substring(int, int + 1) >
        arr[arrIndex + 1].substring(int, int + 1)
    ) {
        const temp = arr[arrIndex + 1];
        arr[arrIndex + 1] = arr[arrIndex];
        arr[arrIndex] = temp;
    }
    return;
}

function getKeyValueSortStr(strArr: string[]) {
    return strArr.join("&");
}

export const baseString = (
    data_sign: Record<string, unknown>,
    funName: string,
    method: string,
    url: string
) => {
    const data = QS.stringify(data_sign as any);
    const paraArr = data.split("&");
    for (let i = 0; i < paraArr.length; i++) {
        if (paraArr[i].indexOf("=") + 2 > paraArr[i].length) {
            paraArr.splice(i, 1);
            i--;
        }
    }
    const sortParaArr = getKeySort(paraArr);
    const paraStr = getKeyValueSortStr(sortParaArr)
        .replace(/\+/g, " ")
        .replace(/%3A/g, ":");
    const http = url.split(funName)[0];
    const base = method + "&" + http + funName + "&" + paraStr;
    return base;
};

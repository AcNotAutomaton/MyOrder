"use strict";
const common_vendor = require("../common/vendor.js");
const BASE_URL = "http://localhost:8081/api";
const TIMEOUT = 15e3;
const request = (options) => {
  let url = options.url;
  if (!url.startsWith("http")) {
    url = BASE_URL + url;
  }
  if (options.params) {
    const queryString = Object.entries(options.params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&");
    url += `?${queryString}`;
  }
  return new Promise((resolve, reject) => {
    const token = common_vendor.index.getStorageSync("token");
    const header = {
      "Content-Type": "application/json"
    };
    if (token) {
      header["Authorization"] = `Bearer ${token}`;
    }
    common_vendor.index.request({
      ...options,
      url,
      header,
      timeout: TIMEOUT,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          common_vendor.index.removeStorageSync("token");
          common_vendor.index.removeStorageSync("userInfo");
          common_vendor.index.showToast({
            title: "请重新登录",
            icon: "none"
          });
          reject(new Error("未授权"));
        } else {
          reject(new Error(res.data.message || "请求失败"));
        }
      },
      fail: (err) => {
        common_vendor.index.__f__("error", "at utils/request.js:56", "请求失败:", err);
        common_vendor.index.__f__("error", "at utils/request.js:57", "请求URL:", url);
        common_vendor.index.__f__("error", "at utils/request.js:58", "请求方法:", options.method);
        common_vendor.index.__f__("error", "at utils/request.js:59", "请求参数:", options.data);
        reject(new Error(`网络请求失败: ${err.errMsg || err.message || "未知错误"}`));
      }
    });
  });
};
const request$1 = {
  get(url, data = {}, params = {}) {
    return request({
      url,
      method: "GET",
      data,
      params
    });
  },
  post(url, data = {}, params = {}) {
    return request({
      url,
      method: "POST",
      data,
      params
    });
  },
  put(url, data = {}) {
    return request({
      url,
      method: "PUT",
      data
    });
  },
  delete(url, data = {}) {
    return request({
      url,
      method: "DELETE",
      data
    });
  }
};
exports.request = request$1;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map

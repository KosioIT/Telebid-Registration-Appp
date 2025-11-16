export const TokenManager = {
  getAccessToken() {
    return localStorage.getItem("accessToken");
  },
  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  },
  setTokens({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  },
  clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};

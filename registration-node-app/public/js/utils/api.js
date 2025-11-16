import { TokenManager } from "./tokenManager.js";

export async function apiFetch(url, options = {}, useRefresh = false) {
  const headers = options.headers || {};

  if (!useRefresh) {
    const accessToken = TokenManager.getAccessToken();
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  const finalOptions = { ...options, headers };

  try {
    let res = await fetch(url, finalOptions);

    // Attempt to refresh token if expired
    if (res.status === 403 && !useRefresh) {
      const refreshToken = TokenManager.getRefreshToken();
      if (refreshToken) {
        const refreshRes = await fetch("/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken })
        });
        const refreshData = await refreshRes.json();

        if (refreshData.success && refreshData.accessToken) {
          TokenManager.setTokens({ accessToken: refreshData.accessToken });
          // Repeat the original request with the new access token
          headers["Authorization"] = `Bearer ${refreshData.accessToken}`;
          res = await fetch(url, { ...options, headers });
        } else {
          throw new Error("Unable to refresh token");
        }
      }
    }

    if (!res.ok) {
      let errorMessage = `HTTP error ${res.status}`;
      try {
        const errData = await res.json();
        errorMessage = errData.message || errorMessage;
      } catch (_) {}
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (err) {
    console.error("API fetch error:", err);
    throw err;
  }
}

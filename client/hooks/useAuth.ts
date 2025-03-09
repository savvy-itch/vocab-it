import { useAuthStore } from "@/lib/authStore";
import useRefreshToken from "./useRefreshToken"

type FetchOptions = {
  headers?: Record<string, string>;
  [key: string]: any;
}

const useAuth = () => {
  const refresh = useRefreshToken();
  const {accessToken} = useAuthStore(state => state);
  
  async function fetchWithAuth(url: string, options: FetchOptions = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    let res = await fetch(url, config);

    if (res.status === 403 || res.status === 401) {
      const newAccessToken = await refresh();
      if (!newAccessToken) {
        console.warn("Refresh failed, user must authenticate again.");
        return res;
      }
      config.headers['Authorization'] = `Bearer ${newAccessToken}`;
      res = await fetch(url, config);

      if (res.status === 403 || res.status === 401) {
        console.warn("Token refresh didn't resolve the issue, logging out.");
        return res;
      }
    }
    return res;
  }
  return fetchWithAuth;
}

export default useAuth;

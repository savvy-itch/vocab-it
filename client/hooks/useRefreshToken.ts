import { useAuthStore } from "@/lib/authStore";
import { BASE_URL } from "@/lib/globals";
import { usePreferencesStore } from "@/lib/preferencesStore";
import { CustomPayload } from "@/lib/types";
import { jwtDecode } from 'jwt-decode';

const useRefreshToken = () => {
  const {setAccessToken} = useAuthStore(state => state);
  const {storedUsername, setStoredUsername} = usePreferencesStore(state => state);

  async function refresh() {
    try {
      const res = await fetch(`${BASE_URL}/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await res.json();
      setAccessToken(data.accessToken);
      const decoded = jwtDecode<CustomPayload>(data.accessToken);
      if (storedUsername !== decoded.UserInfo.username) {
        setStoredUsername(decoded.UserInfo.username);
      }
      return data.accessToken;
    } catch (error) {
      console.error(error);
      setAccessToken('');
    }
  }
  return refresh;
}

export default useRefreshToken;

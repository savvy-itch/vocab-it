import { useAuthStore } from "@/lib/authStore";
import useRefreshToken from "./useRefreshToken";
import { useCallback } from "react";

type FetchFn = () => Promise<void>;

function useCheckToken() {
  const { accessToken, setIsTokenChecked } = useAuthStore(state => state);
  const refresh = useRefreshToken();

  const checkToken = useCallback(async (fetchFn?: FetchFn) => {
    if (accessToken) {
      setIsTokenChecked(true);
      if (fetchFn) {
        await fetchFn();
      }
    } else {
      try {
        await refresh();
        if (fetchFn) {
          await fetchFn();
        }
        setIsTokenChecked(true);
      } catch (error) {
        setIsTokenChecked(false);
        console.error(error);
      }
    }
  }, [accessToken, refresh]);

  return { checkToken };
}

export default useCheckToken;

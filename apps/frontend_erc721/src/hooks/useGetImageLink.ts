import { useCallback } from "react";
import axios from 'axios';

export const useGetImageLink = () => {
    
    return useCallback(
      async (uri: string) => {
        try {
            const request = await axios.get(uri,
                {
                    headers: {}
                }
            )
            return request.data.image;
        } catch (error: any) {
            const errorMessage =
            error?.error?.message ||
            error?.message ||
            "Check console logs for error";
            console.error(error);
            console.error(errorMessage);
        }
      },
      []
    );
  };
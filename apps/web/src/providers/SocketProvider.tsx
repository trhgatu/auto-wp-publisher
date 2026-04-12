import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../hooks/useNotification";

import { SocketContext } from "../contexts/SocketContext";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api/v1", "") ||
  "http://localhost:3000";

export const SocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const { notify } = useNotification();

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
      setIsConnected(false);
    });

    newSocket.on(
      "jobStatusUpdated",
      (data: { productId: string; status: string; message?: string }) => {
        console.log("Job Update Received:", data);

        queryClient.invalidateQueries({ queryKey: ["jobs"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });

        if (data.status === "COMPLETED") {
          notify(
            "Thành công!",
            data.message || "Bài viết đã được đăng lên WordPress.",
            "success",
          );
        } else if (data.status === "FAILED") {
          notify(
            "Lỗi đăng bài",
            data.message ||
              "Đã có lỗi xảy ra trong quá trình xuất bản bài viết.",
            "error",
          );
        }
      },
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [queryClient, notify]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

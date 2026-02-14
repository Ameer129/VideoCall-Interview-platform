import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;

    const initCall = async () => {
      if (!session?.callId) return;
      if (!isHost && !isParticipant) return;
      if (session.status === "completed") return;

      try {
        // 1️⃣ Get Stream token
        const { token, userId, userName, userImage } =
          await sessionApi.getStreamToken();

        // 2️⃣ Init Stream VIDEO
        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        setStreamClient(client);

        // Use a real call type
        videoCall = client.call("livestream", session.callId);
        await videoCall.join({ create: true });
        setCall(videoCall);

        // 3️⃣ Init Stream CHAT
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        if (!apiKey) {
          console.error("VITE_STREAM_API_KEY missing");
          return;
        }

        chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel(
          "messaging",
          session.callId
        );

        await chatChannel.watch();
        setChannel(chatChannel);
      } catch (error) {
        // 🔴 LOG ONLY — NO UI SIDE EFFECTS
        console.error("Stream init failed:", error);
      } finally {
        setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) {
      initCall();
    }

    // Cleanup
    return () => {
      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, [session, loadingSession, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;

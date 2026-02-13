import { useMutation, useQuery } from "@tanstack/react-query";
import { sessionApi } from "../api/sessions";

/* CREATE SESSION */
export const useCreateSession = () =>
  useMutation({
    mutationKey: ["createSession"],
    mutationFn: sessionApi.createSession,
  });

/* ACTIVE SESSIONS */
export const useActiveSessions = () =>
  useQuery({
    queryKey: ["activeSessions"],
    queryFn: sessionApi.getActiveSessions,
  });

/* RECENT SESSIONS */
export const useMyRecentSessions = () =>
  useQuery({
    queryKey: ["myRecentSessions"],
    queryFn: sessionApi.getMyRecentSessions,
  });

/* SESSION BY ID */
export const useSessionById = (id) =>
  useQuery({
    queryKey: ["session", id],
    queryFn: () => sessionApi.getSessionById(id),
    enabled: !!id,
    refetchInterval: 5000,
  });

/* JOIN SESSION */
export const useJoinSession = () =>
  useMutation({
    mutationKey: ["joinSession"],
    mutationFn: sessionApi.joinSession,
  });

/* END SESSION */
export const useEndSession = () =>
  useMutation({
    mutationKey: ["endSession"],
    mutationFn: sessionApi.endSession,
  });

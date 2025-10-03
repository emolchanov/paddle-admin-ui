"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import * as MUI from "@mui/material";
import * as MUIcon from "@mui/icons-material";
import ky from "ky";
import { User } from "@/database/users/types";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { formatDate } from "date-fns";
import { memo, useCallback, useState, useEffect, useMemo } from "react";
import { useSSE } from "./useSSE";
import { USERS_API_STATUS } from "@/constants";

const columns: GridColDef<User[][number]>[] = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "user_id", headerName: "User ID", width: 100 },
  {
    field: "user_email",
    headerName: "Email",
    width: 350,
  },
  {
    field: "state",
    headerName: "State",
    width: 100,
  },
  {
    field: "signup_date",
    headerName: "Signup Date",
    width: 250,
  },
  {
    field: "next_payment_date",
    headerName: "Next Payment Date",
    width: 200,
    valueGetter: (value, row) => `${row.next_payment?.date ?? null}`,
  },
  {
    field: "next_payment_amount",
    headerName: "Next Payment Amount",
    width: 200,
    valueGetter: (value, row) => `${row.next_payment?.amount ?? null}`,
  },
];

export const PaddleUsers = memo(function PaddleUsers() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, messages } = useSSE("/api/paddle-users/status");

  const initMutation = useMutation({
    mutationKey: ["paddle-users", "init"],
    mutationFn: async () =>
      ky.post("/api/paddle-users", {
        timeout: false,
        hooks: {
          beforeError: [
            async (error) => {
              if (error.response) {
                try {
                  const body = await error.response.json<{
                    code: number;
                    message: string;
                  }>();
                  error.message = `Error:(${body.code}) ${body.message}`;
                } catch (e) {}
              }
              return error;
            },
          ],
        },
      }), // 5 minutes timeout
    onSuccess: () => setError(null),
    onError: (error: Error) => setError(error.message),
  });

  const deleteMutation = useMutation({
    mutationKey: ["paddle-users", "delete"],
    mutationFn: async () => ky.delete("/api/paddle-users"),
    onSuccess: () => setError(null),
  });

  const query = useQuery({
    queryKey: ["paddle-users", "list", startDate, endDate],
    queryFn: async () =>
      ky
        .get("/api/paddle-users", {
          searchParams: new URLSearchParams({
            start_date: startDate ? formatDate(startDate, "yyyy-MM-dd") : "",
            end_date: endDate ? formatDate(endDate, "yyyy-MM-dd") : "",
          }),
          timeout: false,
        })
        .json<User[]>(),
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  const { refetch } = query;

  const uploadClick = useCallback(() => {
    initMutation.mutate();
    refetch();
  }, [initMutation, refetch]);

  const deleteClick = useCallback(async () => {
    await deleteMutation.mutateAsync();
    refetch();
  }, [deleteMutation, refetch]);

  const state = useMemo<{ status: USERS_API_STATUS; message: string }>(() => {
    const lastMessage = messages[messages.length - 1] ?? null;
    return lastMessage
      ? lastMessage
      : { status: USERS_API_STATUS.Idle, message: "Idle" };
  }, [messages]);

  console.log("SSE connection status:", isConnected);

  useEffect(() => {
    if (state.message && state.status !== USERS_API_STATUS.Idle) {
      query.refetch();
    }
  }, [state.message, state.status]);

  return (
    <MUI.Card elevation={0} sx={{ mx: 1, mt: 0.5 }}>
      <MUI.CardHeader
        title={
          <MUI.Stack direction="row" gap={2}>
            <MUI.Button
              variant="outlined"
              loadingPosition="start"
              loading={
                initMutation.isPending ||
                state.status === USERS_API_STATUS.Uploading
              }
              onClick={uploadClick}
              sx={{ flexShrink: 0 }}
              startIcon={<MUIcon.Download />}
            >
              Upload users
            </MUI.Button>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                sx={{ width: "100%" }}
                label="Start SignUp Date"
                format="dd/MM/yyyy"
                value={startDate}
                onChange={setStartDate}
                disabled={
                  initMutation.isPending ||
                  state.status === USERS_API_STATUS.Uploading
                }
                slotProps={{ textField: { size: "small" } }}
              />
              <DatePicker
                sx={{ width: "100%" }}
                label="End SignUp Date"
                format="dd/MM/yyyy"
                value={endDate}
                onChange={setEndDate}
                disabled={
                  initMutation.isPending ||
                  state.status === USERS_API_STATUS.Uploading
                }
                slotProps={{ textField: { size: "small" } }}
              />
            </LocalizationProvider>
            <MUI.Button
              variant="outlined"
              loadingPosition="start"
              loading={deleteMutation.isPending}
              onClick={deleteClick}
              color="error"
              disabled={
                initMutation.isPending ||
                state.status === USERS_API_STATUS.Uploading
              }
              sx={{ flexShrink: 0 }}
              startIcon={<MUIcon.DeleteForever />}
            >
              Delete users
            </MUI.Button>
          </MUI.Stack>
        }
      />
      <MUI.CardContent>
        <MUI.Stack gap={4}>
          {error ? (
            <MUI.Alert severity="error" onClose={() => setError(null)}>
              {error}
            </MUI.Alert>
          ) : null}
          {state.status === USERS_API_STATUS.Uploading ? (
            <MUI.Alert severity="info">{state.message}</MUI.Alert>
          ) : null}
          <MUI.Stack
            flexDirection={"column"}
            sx={{
              height: "100%",
              width: "100%",
              maxHeight: (theme) =>
                `calc(100vh - ${theme.spacing(
                  state.status === USERS_API_STATUS.Uploading ? 38 : 28
                )})`,
            }}
          >
            {query.data?.length ? (
              <DataGrid
                rows={query.data}
                columns={columns}
                pageSizeOptions={[20, 50, 100]}
                disableRowSelectionOnClick
                autosizeOnMount
                showToolbar
                sx={{ m: 0 }}
              />
            ) : null}
          </MUI.Stack>
        </MUI.Stack>
      </MUI.CardContent>
      {state.status === USERS_API_STATUS.Uploading ? (
        <MUI.Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            width: "100vw",
          }}
        >
          <MUI.LinearProgress color="primary" variant="indeterminate" />
        </MUI.Box>
      ) : null}
    </MUI.Card>
  );
});

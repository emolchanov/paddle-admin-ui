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
  { field: "id", headerName: "ID", width: 40 },
  { field: "user_id", headerName: "User ID", width: 100 },
  {
    field: "user_email",
    headerName: "Email",
    width: 250,
  },
  {
    field: "state",
    headerName: "State",
    width: 150,
  },
  {
    field: "signup_date",
    headerName: "Signup Date",
    width: 200,
  },
  {
    field: "next_payment_date",
    headerName: "Next Payment Date",
    width: 150,
    valueGetter: (value, row) => `${row.next_payment.date}`,
  },
  {
    field: "next_payment_amount",
    headerName: "Next Payment Amount",
    width: 200,
    valueGetter: (value, row) => `${row.next_payment.amount}`,
  },
];

const UPDATE_PERCENTS = [0, 1, 10, 25, 50, 75, 100];
export const PaddleUsers = memo(function PaddleUsers() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, messages } = useSSE("/api/paddle-users/status");

  const initMutation = useMutation({
    mutationKey: ["paddle-users", "init"],
    mutationFn: async () =>
      ky.post("/api/paddle-users", { timeout: 5 * 60 * 1000 }), // 5 minutes timeout
    onSuccess: () => setError(null),
    onError: (error) => setError(error.message),
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
        })
        .json<User[]>(),
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });

  const { refetch } = query;

  const uploadClick = useCallback(async () => {
    await initMutation.mutateAsync();
    refetch();
  }, [initMutation, refetch]);

  const deleteClick = useCallback(async () => {
    await deleteMutation.mutateAsync();
    refetch();
  }, [deleteMutation, refetch]);

  const state = useMemo<{ status: USERS_API_STATUS; progress: number }>(() => {
    const lastMessage = messages[messages.length - 1] ?? null;
    return lastMessage
      ? lastMessage
      : { status: USERS_API_STATUS.Idle, progress: 0 };
  }, [messages]);

  console.log("SSE connection status:", isConnected);

  useEffect(() => {
    if (UPDATE_PERCENTS.includes(state.progress)) {
      query.refetch();
    }
  }, [state.status, state.progress]);

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
                label="Start Date"
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
                label="End Date"
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
      {error && (
        <>
          <MUI.Alert severity="error" onClose={() => setError(null)}>
            {error}
          </MUI.Alert>
        </>
      )}
      <MUI.CardContent>
        <MUI.Stack
          flexDirection={"column"}
          sx={{
            height: "100%",
            width: "100%",
            maxHeight: (theme) => `calc(100vh - ${theme.spacing(28)})`,
          }}
        >
          {query.data?.length ? (
            <DataGrid
              rows={query.data}
              columns={columns}
              pageSizeOptions={[20, 50, 100, 500, 1000]}
              disableRowSelectionOnClick
              autosizeOnMount
              showToolbar
              sx={{ m: 0 }}
            />
          ) : null}
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
          <MUI.LinearProgress
            color="primary"
            variant="determinate"
            value={state.progress}
          />
        </MUI.Box>
      ) : null}
    </MUI.Card>
  );
});

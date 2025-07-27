"use client";

import ky from "ky";
import * as MUI from "@mui/material";
import * as MUIcon from "@mui/icons-material";
import { memo, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_TYPE } from "@/constants";

interface FormValues {
  vendor_id: string;
  vendor_auth_code: string;
  start_page: number;
  max_pages: number;
  subscription_id: number;
  api_type: API_TYPE;
}

export const PaddleSettings = memo(function PaddleSettings() {
  const query = useQuery({
    queryKey: ["paddle-settings"],
    queryFn: async () => {
      return ky.get("/api/paddle-settings").json<FormValues>();
    },
  });

  const mutation = useMutation({
    mutationKey: ["paddle-settings-create"],
    mutationFn: async (data: FormValues) => {
      return ky.post("/api/paddle-settings", { json: data });
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  const resetMutation = useMutation({
    mutationKey: ["paddle-settings-reset"],
    mutationFn: async () => {
      return ky.delete("/api/paddle-settings");
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  const form = useForm<FormValues>({
    defaultValues: {
      vendor_id: "",
      vendor_auth_code: "",
      subscription_id: 0,
      start_page: 1,
      max_pages: 10,
      api_type: API_TYPE.MOCK,
    },
  });

  useEffect(() => {
    if (query.data && query.isSuccess) {
      form.reset({
        vendor_id: query.data.vendor_id || "",
        vendor_auth_code: query.data.vendor_auth_code || "",
        subscription_id: query.data.subscription_id || 0,
        start_page: query.data.start_page || 1,
        max_pages: query.data.max_pages || 10,
        api_type: query.data.api_type || API_TYPE.MOCK,
      });
    }
  }, [form, query.data]);

  const onSubmit = async (values: FormValues) => {
    mutation.mutate(values);
  };

  const onResetDatabase = async () => {
    resetMutation.mutate();
  };

  return (
    <MUI.Card
      elevation={0}
      component="form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <MUI.CardContent>
        <MUI.Stack direction="column" gap={2}>
          <MUI.Stack direction="column" gap={2}>
            <Controller
              name="api_type"
              control={form.control}
              rules={{ required: true }}
              render={({ field }) => (
                <MUI.FormControl>
                  <MUI.InputLabel id="demo-simple-select-helper-label">
                    API Server
                  </MUI.InputLabel>
                  <MUI.Select
                    label="API Server"
                    defaultValue={API_TYPE.MOCK}
                    {...field}
                  >
                    <MUI.MenuItem value={API_TYPE.MOCK}>Mock</MUI.MenuItem>
                    <MUI.MenuItem value={API_TYPE.LIVE}>Live</MUI.MenuItem>
                  </MUI.Select>
                </MUI.FormControl>
              )}
            />
            <MUI.Stack direction="row" gap={2}>
              <MUI.TextField
                fullWidth
                required
                label="Vendor ID"
                placeholder="vendor_id"
                disabled={
                  mutation.isPending || query.isPending || query.isLoading
                }
                slotProps={{ inputLabel: { shrink: true } }}
                {...form.register("vendor_id", { required: true })}
              />
              <MUI.TextField
                fullWidth
                required
                label="Vendor Auth Code"
                placeholder="vendor_auth_code"
                slotProps={{ inputLabel: { shrink: true } }}
                disabled={
                  mutation.isPending || query.isPending || query.isLoading
                }
                {...form.register("vendor_auth_code", { required: true })}
              />
            </MUI.Stack>
            <MUI.Stack direction="row" gap={2}>
              <MUI.TextField
                fullWidth
                label="Subscription Id"
                placeholder="subscription_id"
                slotProps={{ inputLabel: { shrink: true } }}
                disabled={
                  mutation.isPending || query.isPending || query.isLoading
                }
                {...form.register("subscription_id", { valueAsNumber: true })}
              />
              <MUI.TextField
                fullWidth
                required
                label="Start Page"
                placeholder="1"
                slotProps={{ inputLabel: { shrink: true } }}
                disabled={
                  mutation.isPending || query.isPending || query.isLoading
                }
                {...form.register("start_page", {
                  valueAsNumber: true,
                  required: true,
                })}
              />
              <MUI.TextField
                fullWidth
                required
                label="Max Pages"
                placeholder="10"
                slotProps={{ inputLabel: { shrink: true } }}
                disabled={
                  mutation.isPending || query.isPending || query.isLoading
                }
                {...form.register("max_pages", {
                  valueAsNumber: true,
                  required: true,
                })}
              />
            </MUI.Stack>
          </MUI.Stack>
          <MUI.Stack direction="row" gap={2} alignItems={"center"}>
            <MUI.Button
              fullWidth
              variant="outlined"
              type="button"
              size="large"
              onClick={onResetDatabase}
              color="error"
              loadingPosition="start"
              loading={resetMutation.isPending || query.isPending || query.isLoading}
              startIcon={<MUIcon.RestartAltRounded />}
            >
              Reset Database
            </MUI.Button>
            <MUI.Button
              fullWidth
              variant="outlined"
              type="submit"
              size="large"
              loading={mutation.isPending || query.isPending || query.isLoading}
              loadingPosition="start"
              disabled={
                mutation.isPending || query.isPending || query.isLoading
              }
              startIcon={<MUIcon.SaveRounded />}
            >
              Save
            </MUI.Button>
          </MUI.Stack>
        </MUI.Stack>
      </MUI.CardContent>
    </MUI.Card>
  );
});

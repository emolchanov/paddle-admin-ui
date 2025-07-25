"use client";

import ky from "ky";
import * as MUI from "@mui/material";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";

interface FormValues {
  vendor_id: string;
  vendor_auth_code: string;
}

export const PaddleKeys = React.memo(function PaddleKeys() {
  const query = useQuery({
    queryKey: ["paddle-keys"],
    queryFn: async () => {
      return ky.get("/api/paddle-keys").json<FormValues>();
    },
  });

  const mutation = useMutation({
    mutationKey: ["paddle-keys-create"],
    mutationFn: async (data: FormValues) => {
      return ky.post("/api/paddle-keys", { json: data });
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  const form = useForm<FormValues>({
    defaultValues: { vendor_id: "", vendor_auth_code: "" },
  });

  useEffect(() => {
    if (query.data) {
      form.reset({
        vendor_id: query.data.vendor_id || "",
        vendor_auth_code: query.data.vendor_auth_code || "",
      });
    }
  }, [form, query.data]);

  const onSubmit = async (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <MUI.Card component="form" onSubmit={form.handleSubmit(onSubmit)}>
      <MUI.CardHeader
        title="Keys"
        action={
          <>
            <MUI.Button type="submit" loading={mutation.isPending} loadingPosition="start">
              {mutation.isPending ? "Saving..." : "Save"}
            </MUI.Button>
          </>
        }
      />
      <MUI.CardContent>
        <MUI.Stack gap={2}>
          <MUI.TextField
            label="Vendor ID"
            placeholder="vendor_id"
            disabled={mutation.isPending || query.isPending || query.isLoading}
            slotProps={{ inputLabel: { shrink: true } }}
            {...form.register("vendor_id")}
          />
          <MUI.TextField
            label="Vendor Auth Code"
            placeholder="vendor_auth_code"
            slotProps={{ inputLabel: { shrink: true } }}
            disabled={mutation.isPending || query.isPending || query.isLoading}
            {...form.register("vendor_auth_code")}
          />
        </MUI.Stack>
      </MUI.CardContent>
    </MUI.Card>
  );
});

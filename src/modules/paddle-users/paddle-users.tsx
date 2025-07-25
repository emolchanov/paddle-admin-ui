"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import * as MUI from "@mui/material";
import ky from "ky";
import { User } from "@/database/users/types";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const columns: GridColDef<User[][number]>[] = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "user_id", headerName: "ID", width: 90 },
  {
    field: "user_email",
    headerName: "Email",
    width: 150,
    editable: true,
  },
];

export const PaddleUsers = React.memo(function PaddleUsers() {
  const initMutation = useMutation({
    mutationKey: ["paddle-users", "init"],
    mutationFn: async () => ky.post("/api/paddle-users"),
  });

  const deleteMutation = useMutation({
    mutationKey: ["paddle-users", "delete"],
    mutationFn: async () => ky.delete("/api/paddle-users"),
  });

  const query = useQuery({
    queryKey: ["paddle-users", "list"],
    queryFn: async () => ky.get("/api/paddle-users").json<User[]>(),
  });

  const { refetch } = query;

  const uploadClick = React.useCallback(async () => {
    await initMutation.mutateAsync();
    refetch();
  }, [initMutation, refetch]);

  const deleteClick = React.useCallback(async () => {
    await deleteMutation.mutateAsync();
    refetch();
  }, [deleteMutation, refetch]);

  React.useEffect(() => {
    if (query.isSuccess) {
      console.log(query.data);
    }
  }, [query.data, query.isSuccess]);

  return (
    <MUI.Card>
      <MUI.CardHeader
        title="Users"
        action={
          <>
            <MUI.Stack direction="row" gap={2}>
              <MUI.Button
                loadingPosition="start"
                loading={initMutation.isPending}
                onClick={uploadClick}
              >
                Upload users
              </MUI.Button>
              <MUI.Button
                loadingPosition="start"
                loading={deleteMutation.isPending}
                onClick={deleteClick}
              >
                Delete users
              </MUI.Button>
            </MUI.Stack>
          </>
        }
      />
      <MUI.CardContent>
        <MUI.Stack gap={2}>
          {query.data?.length ? (
            <DataGrid
              rows={query.data}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[5]}
              checkboxSelection
              disableRowSelectionOnClick
            />
          ) : null}
        </MUI.Stack>{" "}
      </MUI.CardContent>
    </MUI.Card>
  );
});

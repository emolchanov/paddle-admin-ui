"use client";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/users");
}

export const dynamic = "force-dynamic";

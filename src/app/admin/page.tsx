import { notFound } from "next/navigation";

// /admin โดยไม่มี secret → ไม่ให้เข้าเลย
export default function AdminIndex() {
  notFound();
}

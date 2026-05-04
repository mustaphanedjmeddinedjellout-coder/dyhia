import { NextResponse } from "next/server";
import { listYalidineCentersByCommuneId } from "@/lib/yalidine";

// Demo centers (used when Yalidine is not configured)
const DEMO_CENTERS: Record<string, Array<{ center_id: number; name: string }>> = {
  "1601": [
    { center_id: 16001, name: "مركز الجزائر الرئيسي" },
    { center_id: 16002, name: "مركز بن عكنون" },
  ],
  "1602": [
    { center_id: 16021, name: "مركز بوزريعة" },
  ],
  "2601": [
    { center_id: 26001, name: "مركز قسنطينة الرئيسي" },
  ],
  "3101": [
    { center_id: 31001, name: "مركز وهران الرئيسي" },
  ],
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const communeId = Number(url.searchParams.get("communeId") || "");

  if (!Number.isFinite(communeId) || communeId <= 0) {
    return NextResponse.json({ error: "Missing communeId" }, { status: 400 });
  }

  try {
    const centers = await listYalidineCentersByCommuneId(communeId);
    return NextResponse.json({ centers });
  } catch (e: any) {
    // Fallback: provide demo centers if Yalidine is not configured
    if (String(e?.message || "").includes("not configured")) {
      const demoCenters = DEMO_CENTERS[String(communeId)] || [];
      return NextResponse.json({ centers: demoCenters });
    }
    return NextResponse.json(
      { error: e?.message || "Failed to fetch centers" },
      { status: 501 }
    );
  }
}

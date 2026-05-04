import { NextResponse } from "next/server";
import { listYalidineWilayas } from "@/lib/yalidine";

// Demo wilayas (used when Yalidine is not configured)
const DEMO_WILAYAS = [
  { id: 1, name: "أدرار" },
  { id: 16, name: "الجزائر" },
  { id: 26, name: "قسنطينة" },
  { id: 31, name: "وهران" },
  { id: 5, name: "باتنة" },
  { id: 6, name: "بجاية" },
  { id: 7, name: "بسكرة" },
];

export async function GET() {
  try {
    const wilayas = await listYalidineWilayas();
    return NextResponse.json({ wilayas });
  } catch (e: any) {
    // Fallback: provide demo wilayas if Yalidine is not configured
    if (String(e?.message || "").includes("not configured")) {
      return NextResponse.json({ wilayas: DEMO_WILAYAS });
    }
    return NextResponse.json(
      { error: e?.message || "Failed to fetch wilayas" },
      { status: 501 }
    );
  }
}

import { NextResponse } from "next/server";
import { listYalidineCentersByCommuneId, listYalidineCommunes } from "@/lib/yalidine";

// Demo communes (used when Yalidine is not configured)
const DEMO_COMMUNES: Record<string, Array<{ id: number; name: string }>> = {
  "1": [
    { id: 101, name: "أدرار" },
    { id: 102, name: "تيميمون" },
  ],
  "16": [
    { id: 1601, name: "الجزائر" },
    { id: 1602, name: "بوزريعة" },
    { id: 1603, name: "درارية" },
  ],
  "26": [
    { id: 2601, name: "قسنطينة" },
    { id: 2602, name: "الخروب" },
  ],
  "31": [
    { id: 3101, name: "وهران" },
    { id: 3102, name: "السانية" },
  ],
  "5": [
    { id: 501, name: "باتنة" },
  ],
  "6": [
    { id: 601, name: "بجاية" },
  ],
  "7": [
    { id: 701, name: "بسكرة" },
  ],
};

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
  const wilayaId = Number(url.searchParams.get("wilayaId") || "");
  const onlyWithCenters = ["1", "true", "yes"].includes(
    String(url.searchParams.get("onlyWithCenters") || "").toLowerCase()
  );

  if (!Number.isFinite(wilayaId) || wilayaId <= 0) {
    return NextResponse.json({ error: "Missing wilayaId" }, { status: 400 });
  }

  try {
    let communes = await listYalidineCommunes(wilayaId);

    if (onlyWithCenters && communes.length) {
      const filtered = (
        await Promise.all(
          communes.map(async (commune) => {
            try {
              const centers = await listYalidineCentersByCommuneId(commune.id);
              return centers.length ? commune : null;
            } catch {
              return null;
            }
          })
        )
      ).filter((c) => c !== null);

      communes = filtered as typeof communes;
    }

    return NextResponse.json({ communes });
  } catch (e: any) {
    // Fallback: provide demo communes if Yalidine is not configured
    if (String(e?.message || "").includes("not configured")) {
      let demoCommunes = DEMO_COMMUNES[String(wilayaId)] || [];
      if (onlyWithCenters) {
        demoCommunes = demoCommunes.filter(
          (c) => (DEMO_CENTERS[String(c.id)] || []).length > 0
        );
      }
      return NextResponse.json({ communes: demoCommunes });
    }
    return NextResponse.json(
      { error: e?.message || "Failed to fetch communes" },
      { status: 501 }
    );
  }
}

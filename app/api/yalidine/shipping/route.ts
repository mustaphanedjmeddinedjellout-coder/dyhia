import { NextResponse } from "next/server";
import { getYalidineShippingQuote } from "@/lib/yalidine";

// Demo/fallback fees (used when Yalidine is not configured) — use -100 as fallback
const DEMO_FEES: Record<string, { home: number; stop: number }> = {
  "1": { home: -100, stop: -100 },   // أدرار
  "16": { home: -100, stop: -100 },  // الجزائر
  "26": { home: -100, stop: -100 }, // قسنطينة
  "31": { home: -100, stop: -100 },// وهران
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const wilayaId = Number(url.searchParams.get("wilayaId") || "");
  const communeId = Number(url.searchParams.get("communeId") || "");
  const deliveryType = url.searchParams.get("deliveryType") as
    | "home"
    | "stop"
    | null;

  const weightKg = Number(url.searchParams.get("weightKg") || "");
  const lengthCm = Number(url.searchParams.get("lengthCm") || "");
  const widthCm = Number(url.searchParams.get("widthCm") || "");
  const heightCm = Number(url.searchParams.get("heightCm") || "");

  if (!Number.isFinite(wilayaId) || wilayaId <= 0) {
    return NextResponse.json({ error: "Missing wilayaId" }, { status: 400 });
  }
  if (!Number.isFinite(communeId) || communeId <= 0) {
    return NextResponse.json({ error: "Missing communeId" }, { status: 400 });
  }
  if (deliveryType !== "home" && deliveryType !== "stop") {
    return NextResponse.json(
      { error: "Missing/invalid deliveryType" },
      { status: 400 }
    );
  }

  try {
    const quote = await getYalidineShippingQuote({
      toWilayaId: wilayaId,
      toCommuneId: communeId,
      deliveryType,
      weightKg: Number.isFinite(weightKg) ? weightKg : undefined,
      lengthCm: Number.isFinite(lengthCm) ? lengthCm : undefined,
      widthCm: Number.isFinite(widthCm) ? widthCm : undefined,
      heightCm: Number.isFinite(heightCm) ? heightCm : undefined
    });
    return NextResponse.json({ quote });
  } catch (e: any) {
    // Fallback: provide demo fees if Yalidine is not configured
    const message = e?.message || "";
    if (message.includes("not configured")) {
      const fees = DEMO_FEES[String(wilayaId)];
      const price = fees ? (deliveryType === "home" ? fees.home : fees.stop) : -100;
      return NextResponse.json({
        quote: {
          deliveryType,
          price,
          currency: "DZD",
          baseFee: price,
          overweightFee: 0,
          billableWeightKg: 1
        }
      });
    }
    return NextResponse.json(
      { error: e?.message || "Failed to fetch shipping" },
      { status: 501 }
    );
  }
}

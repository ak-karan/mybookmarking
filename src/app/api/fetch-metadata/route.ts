import { NextResponse } from "next/server";
import { fetchUrlMetadata } from "../../../lib/metadata";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    const metadata = await fetchUrlMetadata(body.url ?? "");

    return NextResponse.json(metadata);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to fetch URL details.",
      },
      { status: 400 }
    );
  }
}

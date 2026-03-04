import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const uploadType = formData.get("uploadType") as "livestream" | "thumbnail";

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const backendFormData = new FormData();
  backendFormData.append("file", file);
  backendFormData.append("uploadType", uploadType);

  try {
    const backendResponse = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: backendFormData,
    });

    const contentType = backendResponse.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await backendResponse.json();
    } else {
      const text = await backendResponse.text();
      console.error("Non-JSON backend response:", text);
      return NextResponse.json(
        { error: `Backend returned non-JSON: ${text.slice(0, 100)}` },
        { status: backendResponse.status }
      );
    }

    if (!backendResponse.ok) {
      console.error("Backend upload error:", data);
      return NextResponse.json({ error: data.message || "Backend upload failed" }, { status: backendResponse.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Upload route exception:", error);
    return NextResponse.json({ error: `Failed to connect to the backend: ${error.message}` }, { status: 500 });
  }
}

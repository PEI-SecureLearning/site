import { NextResponse } from "next/server";

interface ContactPayload {
  name?: string | null;
  organization?: string | null;
  email?: string | null;
  interest?: string | null;
}

export async function POST(request: Request) {
  const data: ContactPayload = await request.json();

  console.log("SecureLearning contact submission", {
    name: data.name,
    organization: data.organization,
    email: data.email,
    interest: data.interest,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json(
    {
      success: true,
      message: "Form submission received.",
    },
    { status: 200 }
  );
}




import { NextResponse } from "next/server";

// Google reCAPTCHA v3 verification endpoint
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing CAPTCHA token" },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    // If no secret key configured, skip verification
    if (!secretKey) {
      console.warn("RECAPTCHA_SECRET_KEY not configured, skipping verification");
      return NextResponse.json({ success: true, score: 1.0 });
    }

    // Verify with Google reCAPTCHA API
    const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // For reCAPTCHA v3, also check the score (0.0 - 1.0)
      // Score >= 0.5 is generally considered human
      const score = data.score || 1.0;
      if (score >= 0.5) {
        return NextResponse.json({ 
          success: true, 
          score,
          action: data.action,
        });
      } else {
        return NextResponse.json(
          { success: false, error: "Low score - suspected bot", score },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: "CAPTCHA verification failed", errors: data["error-codes"] },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("CAPTCHA verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed" },
      { status: 500 }
    );
  }
}

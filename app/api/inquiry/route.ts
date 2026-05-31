import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Inquiry = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  guests?: string;
  budget?: string;
  packageInterest?: string;
  urgency?: string;
  occasion?: string;
  details?: string;
};

function clean(v?: string) {
  return v?.trim() || "";
}

/* =========================
   LEAD CLASSIFICATION ENGINE
========================= */

function getLeadType(data: Inquiry) {
  const budget = data.budget || "";
  const pkg = data.packageInterest || "";
  const urgency = data.urgency || "";

  if (pkg === "Concierge" || budget === "2000+") {
    return "REALTOR / PARTNER LEAD 🏡";
  }

  if (budget === "750-1500" || pkg === "Estate") {
    return "HIGH VALUE LEAD 🔥";
  }

  if (urgency === "this-week") {
    return "HOT LEAD ⚡";
  }

  return "STANDARD LEAD";
}

function getSubject(type: string, pkg?: string) {
  if (type.includes("HIGH VALUE")) {
    return `🔥 ${type} — ${pkg || "Inquiry"}`;
  }

  if (type.includes("REALTOR")) {
    return `🏡 ${type} — Concierge Program`;
  }

  if (type.includes("HOT")) {
    return `⚡ ${type} — Urgent Booking`;
  }

  return `New Inquiry — ${pkg || "Private Dining"}`;
}

/* =========================
   EMAIL ROW
========================= */

function row(label: string, value?: string) {
  return `
    <tr>
      <td style="padding:12px 0;color:#c4a465;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;width:35%;">
        ${label}
      </td>
      <td style="padding:12px 0;color:#efe6d4;font-size:14px;">
        ${clean(value)}
      </td>
    </tr>
  `;
}

/* =========================
   MAIN ROUTE
========================= */

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Inquiry;

    const name = clean(body.name);
    const email = clean(body.email);

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const leadType = getLeadType(body);
    const subject = getSubject(leadType, body.packageInterest);

    const html = `
      <div style="background:#14120e;padding:40px;font-family:Georgia;">
        <div style="max-width:700px;margin:auto;border:1px solid #c4a46533;padding:30px;background:#0f0e0c;">

          <h1 style="color:#c4a465;font-weight:400;">
            Plate The Umpqua
          </h1>

          <h2 style="color:#efe6d4;margin-top:10px;">
            ${subject}
          </h2>

          <p style="color:#b9ac97;">
            Lead Type: <strong>${leadType}</strong>
          </p>

          <table width="100%">
            ${row("Name", body.name)}
            ${row("Email", body.email)}
            ${row("Phone", body.phone)}
            ${row("Location", body.location)}
            ${row("Guests", body.guests)}
            ${row("Budget", body.budget)}
            ${row("Package", body.packageInterest)}
            ${row("Urgency", body.urgency)}
            ${row("Occasion", body.occasion)}
          </table>

          <div style="margin-top:20px;color:#efe6d4;">
            <p style="color:#c4a465;font-size:12px;">Details</p>
            <p>${clean(body.details)}</p>
          </div>

        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Plate The Umpqua <hello@platetheumpqua.com>",
      to: ["hello@platetheumpqua.com"],
      replyTo: email,
      subject,
      html,
    });

    return NextResponse.json({ success: true, leadType });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
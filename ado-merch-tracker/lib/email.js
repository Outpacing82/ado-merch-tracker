import { Resend } from "resend";

export async function sendMerchAlert({ newItems, restockedItems }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const to = process.env.ALERT_EMAIL_TO;
  const from = process.env.ALERT_EMAIL_FROM || "onboarding@resend.dev";

  if (!to) throw new Error("ALERT_EMAIL_TO is not set");

  const rows = [];

  if (newItems.length) {
    rows.push(`<h2>🆕 New merch (${newItems.length})</h2>`);
    rows.push(itemListHtml(newItems));
  }
  if (restockedItems.length) {
    rows.push(`<h2>🔁 Restocked (${restockedItems.length})</h2>`);
    rows.push(itemListHtml(restockedItems));
  }

  const subjectParts = [];
  if (newItems.length) subjectParts.push(`${newItems.length} new`);
  if (restockedItems.length) subjectParts.push(`${restockedItems.length} restocked`);

  const subject = `Ado merch alert: ${subjectParts.join(", ")}`;

  await resend.emails.send({
    from,
    to,
    subject,
    html: `<div style="font-family: sans-serif; max-width: 600px;">
      <p>Changes spotted on the official Ado shop:</p>
      ${rows.join("\n")}
      <p style="color:#888;font-size:12px;margin-top:24px;">
        Tracked collection: ado-shop.com/collections/all-merch
      </p>
    </div>`,
  });
}

function itemListHtml(items) {
  return `<ul style="list-style:none;padding:0;">
    ${items
      .map(
        (item) => `<li style="margin-bottom:16px;">
          ${item.image ? `<img src="${item.image}" width="120" style="display:block;margin-bottom:6px;border-radius:8px;" />` : ""}
          <a href="${item.url}" style="font-weight:bold;text-decoration:none;color:#111;">${item.title}</a>
        </li>`
      )
      .join("\n")}
  </ul>`;
}

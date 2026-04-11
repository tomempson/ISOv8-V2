import { getStore } from "@netlify/blobs";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MIN_SUBMIT_TIME_MS = 3000;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const error = (code, message, status) =>
  json({ error: `[${code}] ${message}` }, status);

const validateFields = (params) => {
  const name = (params.get("name") || "").trim();
  const telephone = (params.get("telephone") || "").trim();
  const businessName = (params.get("business-name") || "").trim();
  const enquiryDetails = (params.get("enquiry-details") || "").trim();

  if (!name) return "[E-100] Name is required.";
  if (name.length > 80) return "[E-101] Name must be 80 characters or fewer.";

  if (!telephone) return "[E-110] Telephone number is required.";
  if (!/^[0-9]{7,15}$/.test(telephone))
    return "[E-111] Telephone number must contain 7 to 15 digits only.";

  if (!businessName) return "[E-120] Business name is required.";
  if (businessName.length > 100)
    return "[E-121] Business name must be 100 characters or fewer.";

  if (!enquiryDetails) return "[E-130] Enquiry details are required.";
  if (enquiryDetails.length > 1000)
    return "[E-131] Enquiry details must be 1000 characters or fewer.";

  return null;
};

export default async (request, context) => {
  if (request.method !== "POST") {
    return error("E-001", "This request method is not supported. Please submit the form normally.", 405);
  }

  const clientIp = context.ip || "unknown";

  // --- Rate limiting via Netlify Blobs ---
  try {
    const store = getStore("rate-limits");
    const key = `form:${clientIp}`;
    const raw = await store.get(key);
    const now = Date.now();

    if (raw) {
      const { count, windowStart } = JSON.parse(raw);
      const withinWindow = now - windowStart < RATE_LIMIT_WINDOW_MS;

      if (withinWindow && count >= RATE_LIMIT_MAX) {
        return error("E-002", "You've made too many submissions in a short period. Please wait 15 minutes and try again.", 429);
      }

      await store.set(
        key,
        JSON.stringify(
          withinWindow
            ? { count: count + 1, windowStart }
            : { count: 1, windowStart: now }
        )
      );
    } else {
      await store.set(key, JSON.stringify({ count: 1, windowStart: now }));
    }
  } catch (err) {
    console.error("Rate-limit store unavailable:", err);
  }

  // --- Parse body ---
  const body = await request.text();
  const params = new URLSearchParams(body);

  // --- Honeypot check ---
  if (params.get("bot-field")) {
    return json({ success: true });
  }

  // --- Timing check ---
  const formLoadedAt = Number(params.get("form-loaded-at"));
  if (formLoadedAt && Date.now() - formLoadedAt < MIN_SUBMIT_TIME_MS) {
    return error("E-003", "The form was submitted too quickly. Please reload the page and try again.", 422);
  }

  // --- Field validation ---
  const validationError = validateFields(params);
  if (validationError) {
    return json({ error: validationError }, 422);
  }

  // --- Forward to Netlify Forms ---
  const formData = new URLSearchParams();
  formData.set("form-name", "engage-contact");
  formData.set("name", (params.get("name") || "").trim());
  formData.set("telephone", (params.get("telephone") || "").trim());
  formData.set("business-name", (params.get("business-name") || "").trim());
  formData.set(
    "enquiry-details",
    (params.get("enquiry-details") || "").trim()
  );

  try {
    const origin = new URL(request.url).origin;
    const response = await fetch(origin, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (!response.ok) {
      return error("E-500", "Your enquiry could not be delivered. Our form handler returned an unexpected response. Please try again shortly.", 502);
    }

    return json({ success: true });
  } catch (_) {
    return error("E-501", "Your enquiry could not be delivered due to a network error. Please check your connection and try again.", 502);
  }
};

export const config = {
  path: "/.netlify/functions/submit-contact",
  method: "POST",
};

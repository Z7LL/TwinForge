import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PUSHOVER_API_KEY = Deno.env.get("PUSHOVER_API_KEY") || "utseezdw1djc88db38vsk56j1g35x9";
const PUSHOVER_USER_KEY = Deno.env.get("PUSHOVER_USER_KEY") || "utseezdw1djc88db38vsk56j1g35x9";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      customer_name, customer_phone, customer_email,
      governorate, city, address,
      shipping_method, shipping_agent, payment_method,
      subtotal, shipping_cost, total,
      items, order_id,
    } = body;

    const totalFormatted = `${total} OMR`;
    const itemsText = items
      .map((item: any, i: number) => {
        const configStr = item.config
          ? Object.entries(item.config).filter(([, v]: any) => v).map(([, v]: any) => v).join(" · ")
          : "";
        return `${i + 1}. ${item.product_name}${configStr ? ` (${configStr})` : ""} — ${item.unit_price} OMR × ${item.quantity}`;
      })
      .join("\n");

    const shippingText = shipping_method === "home_delivery" ? `Home delivery via ${shipping_agent}` : `Office pickup via ${shipping_agent}`;
    const paymentText = payment_method === "bank_transfer" ? "Bank transfer" : "Cash on delivery";

    const title = `🛒 New Order — ${totalFormatted}`;
    const message = [
      `Total: ${totalFormatted}`,
      `Subtotal: ${subtotal} OMR`,
      `Shipping: ${shipping_cost} OMR`,
      ``,
      `Customer: ${customer_name}`,
      `Phone: ${customer_phone}`,
      customer_email ? `Email: ${customer_email}` : "",
      `Governorate: ${governorate}`,
      city ? `City: ${city}` : "",
      `Address: ${address}`,
      ``,
      `Shipping: ${shippingText}`,
      `Payment: ${paymentText}`,
      ``,
      `Items:`,
      itemsText,
      ``,
      `Order ID: ${order_id || "N/A"}`,
    ].filter((line) => line !== "").join("\n");

    const pushoverResponse = await fetch("https://api.pushover.net/1/messages.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: PUSHOVER_API_KEY,
        user: PUSHOVER_USER_KEY,
        title: title,
        message: message,
        priority: 1,
        sound: "cashregister",
      }),
    });

    const pushoverResult = await pushoverResponse.json();

    return new Response(
      JSON.stringify({ success: true, pushover: pushoverResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

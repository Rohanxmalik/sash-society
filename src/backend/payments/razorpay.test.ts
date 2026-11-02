import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createRazorpayGateway } from "./razorpay";

const fetchMock = vi.fn();
const CONFIG = { keyId: "rzp_test_abc", keySecret: "key-secret" };

const respond = (status: number, body: unknown) =>
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status })
  );

const lastCall = () => {
  const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
  return { url, init, body: JSON.parse(String(init.body ?? "null")) };
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Razorpay gateway", () => {
  test("creates an order with Basic auth and the amount in paise", async () => {
    respond(200, {
      id: "order_abc",
      entity: "order",
      amount: 500000,
      amount_paid: 0,
      amount_due: 500000,
      currency: "INR",
      receipt: "r1",
      status: "created",
      attempts: 0,
      notes: { purpose: "event" },
      created_at: 1793577674,
    });

    const order = await createRazorpayGateway(CONFIG).createOrder({
      amountMinor: 500000,
      currency: "INR",
      receipt: "r1",
      notes: { purpose: "event" },
    });

    const { url, init, body } = lastCall();
    expect(url).toBe("https://api.razorpay.com/v1/orders");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("authorization")).toBe(
      `Basic ${Buffer.from("rzp_test_abc:key-secret").toString("base64")}`
    );
    expect(body).toEqual({
      amount: 500000,
      currency: "INR",
      receipt: "r1",
      notes: { purpose: "event" },
    });
    expect(order).toEqual({ id: "order_abc" });
  });

  test("reads a payment into our own shape", async () => {
    respond(200, {
      id: "pay_abc",
      entity: "payment",
      amount: 500000,
      currency: "INR",
      status: "captured",
      order_id: "order_abc",
      method: "upi",
      captured: true,
      email: "asha@example.org",
      contact: "+919876543210",
      fee: 11800,
      tax: 1800,
      error_code: null,
      created_at: 1793577674,
    });

    const payment = await createRazorpayGateway(CONFIG).fetchPayment("pay_abc");

    expect(lastCall().url).toBe("https://api.razorpay.com/v1/payments/pay_abc");
    expect(payment).toEqual({
      id: "pay_abc",
      orderId: "order_abc",
      amountMinor: 500000,
      currency: "INR",
      status: "captured",
    });
  });

  test("captures an authorized payment for its exact amount", async () => {
    respond(200, { id: "pay_abc", status: "captured" });

    await createRazorpayGateway(CONFIG).capturePayment(
      "pay_abc",
      500000,
      "INR"
    );

    const { url, body } = lastCall();
    expect(url).toBe("https://api.razorpay.com/v1/payments/pay_abc/capture");
    expect(body).toEqual({ amount: 500000, currency: "INR" });
  });

  test("refunds a payment in full", async () => {
    respond(200, { id: "rfnd_abc", status: "processed" });

    await createRazorpayGateway(CONFIG).refundPayment("pay_abc");

    const { url, init } = lastCall();
    expect(url).toBe("https://api.razorpay.com/v1/payments/pay_abc/refund");
    expect(init.method).toBe("POST");
  });

  test("reports Razorpay's own error message", async () => {
    respond(400, {
      error: {
        code: "BAD_REQUEST_ERROR",
        description: "Your account does not have enough balance",
        source: "business",
        step: "payment_initiation",
        reason: "insufficient_balance",
      },
    });

    await expect(
      createRazorpayGateway(CONFIG).refundPayment("pay_abc")
    ).rejects.toThrow("Your account does not have enough balance");
  });

  test("escapes ids placed in the URL", async () => {
    respond(200, {});
    await createRazorpayGateway(CONFIG)
      .fetchPayment("pay/../orders")
      .catch(() => {});

    expect(lastCall().url).toBe(
      "https://api.razorpay.com/v1/payments/pay%2F..%2Forders"
    );
  });

  test("checks checkout signatures with the key secret", () => {
    const gateway = createRazorpayGateway(CONFIG);

    expect(
      gateway.isValidSignature({
        orderId: "order_1",
        paymentId: "pay_1",
        // Computed with openssl using "key-secret".
        signature:
          "5e0781daf9ca49ca8bcdbe2023ee024d94ba973ed2534739a2970c200144e8cc",
      })
    ).toBe(true);
  });
});

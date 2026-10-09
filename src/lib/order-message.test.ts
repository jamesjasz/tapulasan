import { test } from "node:test";
import assert from "node:assert/strict";
import { buildOrderMessage, emailSubject, orderRef, type Order } from "./order-message.ts";
import { mailLink, waLink } from "./links.ts";

const order: Order = {
  ref: "TU-261009-AB2C",
  format: "table-stand",
  quantity: 3,
  unitPrice: 50000,
  finish: "wood",
  color: "#D6B58A",
  name: "Kopi & Roti “Senja”",
  cta: "Tap atau scan untuk ulasan",
  hasLogo: true,
  reviewLink: "https://g.page/r/CbA1xYz123/review?x=1&y=2",
  needsLinkHelp: false,
  contact: {
    name: "Budi",
    business: "Kopi Senja",
    phone: "0812 3456 7890",
    address: "Jl. Melati No. 5",
    city: "Bandung",
    postal: "40115",
    notes: "",
  },
  payment: "qris",
  designUrl: "https://tapulasan.my.id/shop/table-stand/?finish=wood&color=D6B58A",
};

test("Indonesian message has every field, in order", () => {
  const msg = buildOrderMessage(order, "id");
  assert.match(msg, /^Halo TapUlasan/);
  for (const s of [
    "No. pesanan: TU-261009-AB2C",
    "Bentuk: Stand Meja",
    "Jumlah: 3",
    "Harga: Rp 50.000 / pcs",
    "Subtotal: Rp 150.000 (belum termasuk ongkir)",
    "Finishing: Kayu bambu",
    "Warna: #D6B58A (Bambu)",
    "Logo: ada, file saya kirim di chat ini",
    "Alamat: Jl. Melati No. 5, Bandung 40115",
    "Pembayaran: QRIS",
    "Lihat desain: https://tapulasan.my.id/shop/table-stand/",
  ])
    assert.ok(msg.includes(s), s);
});

test("English message uses English labels", () => {
  const msg = buildOrderMessage({ ...order, payment: "transfer" }, "en");
  assert.match(msg, /^Hi TapUlasan/);
  assert.ok(msg.includes("Shape: Table Stand"));
  assert.ok(msg.includes("Finish: Bamboo wood"));
  assert.ok(msg.includes("Payment: Bank transfer"));
  assert.ok(msg.includes("Price: Rp 50.000 / pc"));
  assert.ok(msg.includes("Subtotal: Rp 150.000 (shipping not included)"));
  assert.ok(!msg.includes("Bentuk"));
});

test("empty optional fields are left out; link help replaces the link", () => {
  const msg = buildOrderMessage(
    { ...order, hasLogo: false, needsLinkHelp: true, reviewLink: "", cta: "", payment: "", contact: { ...order.contact, notes: "  " } },
    "id",
  );
  assert.ok(!msg.includes("Catatan:"));
  assert.ok(!msg.includes("Kalimat ajakan:"));
  assert.ok(!msg.includes("Pembayaran:"));
  assert.ok(msg.includes("Link ulasan Google: belum ada, mohon dibantu"));
  assert.ok(msg.includes("Logo: tidak pakai logo"));
  assert.ok(!buildOrderMessage({ ...order, unitPrice: null }, "id").includes("Subtotal"), "no price → no price lines");
  assert.ok(!/\n{3,}/.test(msg), "no triple blank lines");
});

test("keychain (compact) leaves out the CTA line", () => {
  assert.ok(!buildOrderMessage({ ...order, format: "keychain" }, "id").includes("Kalimat ajakan"));
});

test("wa.me and mailto links round-trip the message exactly", () => {
  const msg = buildOrderMessage(order, "id");
  const wa = waLink(msg);
  assert.match(wa, /^https:\/\/wa\.me\/\w+\?text=/);
  const encoded = wa.split("?text=")[1];
  assert.ok(!/[\s&?#"]/.test(encoded), "special characters are encoded");
  assert.ok(encoded.includes("%0A"), "newlines encoded");
  assert.equal(decodeURIComponent(encoded), msg);

  const mail = mailLink(emailSubject(order.ref, "en"), msg);
  const params = new URLSearchParams(mail.split("?")[1].replace(/\+/g, "%2B"));
  assert.equal(params.get("subject"), "Badge order TU-261009-AB2C");
  assert.equal(params.get("body"), msg);
});

test("order reference format", () => {
  const ref = orderRef(new Date(2026, 9, 9), () => 0);
  assert.equal(ref, "TU-261009-AAAA");
  assert.match(orderRef(), /^TU-\d{6}-[A-HJ-NP-Z2-9]{4}$/);
});

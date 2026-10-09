/** Rupiah in Indonesian notation for both languages: 50000 → "Rp 50.000". */
export const formatIDR = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

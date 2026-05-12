const BASE62_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function encodeUuid(uuid) {
  const hex = uuid.replace(/-/g, "");
  let num = BigInt("0x" + hex);
  let base62 = "";
  if (num === 0n) return "0";
  while (num > 0n) {
    const rem = num % 62n;
    base62 = BASE62_CHARSET[Number(rem)] + base62;
    num = num / 62n;
  }
  return base62;
}

function decodeUuid(code) {
  let num = 0n;
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const val = BigInt(BASE62_CHARSET.indexOf(char));
    num = num * 62n + val;
  }
  let hex = num.toString(16);
  hex = hex.padStart(32, "0");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const original = "eb10d761-0dbf-47ad-bf96-afc66ff517cb";
const encoded = encodeUuid(original);
const decoded = decodeUuid(encoded);

console.log("Original:", original);
console.log("Encoded:", encoded, "(Length:", encoded.length, ")");
console.log("Decoded:", decoded);
console.log("Match:", original === decoded);

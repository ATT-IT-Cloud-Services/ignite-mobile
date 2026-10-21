import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");

/** Merge every chunk JSON of the elizon pack into one flat dictionary. */
function loadDict(locale) {
  const dir = path.join(root, "packages/themes/elizon/i18n/chunks");
  const out = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(dir, entry.name, `${locale}.json`);
    if (!fs.existsSync(file)) continue;
    Object.assign(out, JSON.parse(fs.readFileSync(file, "utf8")));
  }
  return out;
}

const deDict = loadDict("de");
const enDict = loadDict("en");

const keyRe = /^(idVerification[A-Za-z]+|requiredFieldLegend)$/;
const keys = new Set(Object.keys(deDict).filter((key) => keyRe.test(key)));

const linesDe = [];
const linesEn = [];
for (const key of [...keys].sort()) {
  const de = deDict[key];
  const en = enDict[key];
  if (!de || !en) {
    console.error("missing", key);
    continue;
  }
  linesDe.push(`  ${key}: ${JSON.stringify(de)},`);
  linesEn.push(`  ${key}: ${JSON.stringify(en)},`);
}

fs.writeFileSync(path.join(__dirname, "id-verification-i18n-de.txt"), linesDe.join("\n"));
fs.writeFileSync(path.join(__dirname, "id-verification-i18n-en.txt"), linesEn.join("\n"));
console.log("extracted", linesDe.length, "keys");

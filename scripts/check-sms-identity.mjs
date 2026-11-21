#!/usr/bin/env node
/* =============================================================================
   Run this BEFORE filing a carrier registration, and before giving anyone the
   /sms URL:

       node scripts/check-sms-identity.mjs

   It fails non-zero on anything that would get the filing rejected, so the
   answer is never "I think it's filled in". It reads lib/sms-biz.ts as text so
   it needs no build and no TypeScript.

   What it refuses, and why, is in 100-Funnels/CARRIER-REGISTRATION.md.
   ============================================================================= */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const FREE_MAIL = [
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "ymail.com",
  "hotmail.com", "hotmail.co.uk", "outlook.com", "live.com", "msn.com",
  "icloud.com", "me.com", "mac.com", "aol.com", "proton.me", "protonmail.com",
  "gmx.com", "gmx.de", "mail.com", "yandex.com", "yandex.ru", "zoho.com",
  "qq.com", "163.com", "mail.ru", "inbox.com", "fastmail.com", "tutanota.com",
];
const PLACEHOLDER_MAIL = [
  "example.com", "example.org", "domain.com", "yourdomain.com", "mysite.com",
  "test.com", "email.com", "changeme", "placeholder", "yourbrand", "clientname",
];
const REQUIRED = [
  "brand", "legal", "entityType", "authority", "registration",
  "address", "country", "support", "website",
];

const file = resolve(process.argv[2] || "lib/sms-biz.ts");
let src;
try {
  src = readFileSync(file, "utf8");
} catch {
  console.error(`FAIL  cannot read ${file}. Pass the path if it is somewhere else.`);
  process.exit(1);
}

/** Pull `key: "value"` pairs out of the BIZ object, including wrapped strings. */
const biz = {};
for (const m of src.matchAll(/^\s{2}(\w+):\s*\n?\s*((?:"[^"]*"\s*\+?\s*)+),/gm)) {
  biz[m[1]] = [...m[2].matchAll(/"([^"]*)"/g)].map((q) => q[1]).join("");
}

const registrable = (h) => {
  const p = String(h).toLowerCase().replace(/\.$/, "").split(".");
  return p.length <= 2 ? p.join(".") : p.slice(-2).join(".");
};

const problems = [];
for (const k of REQUIRED) {
  const v = biz[k];
  if (v === undefined) problems.push(`${k} is missing from BIZ.`);
  else if (!v.trim()) problems.push(`${k} is empty.`);
  else if (/[{}]/.test(v)) problems.push(`${k} is still the placeholder: ${v}`);
}

const site = (biz.website || "").toLowerCase();
if (site && /^https?:|\/|\s/.test(site)) {
  problems.push(`website must be a bare host, no protocol and no slash: ${site}`);
}

const email = (biz.support || "").trim().toLowerCase();
if (email && !/[{}]/.test(email)) {
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(email)) {
    problems.push(`support is not a valid email: ${email}`);
  } else {
    const domain = email.split("@")[1];
    if (PLACEHOLDER_MAIL.some((p) => email.includes(p))) {
      problems.push(`support is a template address, not a real mailbox: ${email}`);
    }
    if (FREE_MAIL.includes(domain)) {
      problems.push(
        `support is on a free provider (${domain}). This is a rejection. ` +
          `Create a mailbox on ${site || "the site's own domain"}.`,
      );
    }
    if (site && !/[{}]/.test(site) && registrable(domain) !== registrable(site)) {
      problems.push(`support domain (${domain}) is not the site's domain (${site}).`);
    }
  }
}

if (problems.length) {
  console.error(`\nNOT READY TO FILE  (${file})\n`);
  for (const p of problems) console.error(`  x  ${p}`);
  console.error(
    "\nFix lib/sms-biz.ts from the trade licence, then run this again." +
      "\nCARRIER-REGISTRATION.md in 100-Funnels has the full list.\n",
  );
  process.exit(1);
}

console.log(`\nREADY TO FILE  (${file})\n`);
for (const k of REQUIRED) console.log(`  ${k.padEnd(16)} ${biz[k]}`);
console.log(
  "\nThis checks the identity only. Still do the page checks by hand:" +
    "\n  - curl the live /sms with a non-browser agent and see both checkboxes in the HTML" +
    "\n  - curl the live funnel page and see the consent text in the HTML" +
    "\n  - no money claim anywhere on /sms" +
    "\n  - Vercel Attack Challenge Mode OFF\n",
);

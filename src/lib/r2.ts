import { S3Client } from "@aws-sdk/client-s3";

function getEnvValue(name: string): string {
  return (process.env[name] ?? "")
    .trim()
    .replace(/^['"\\]+|['"\\]+$/g, "");
}

function getR2AccountId(): string {
  return getEnvValue("R2_ACCOUNT_ID")
    .replace(/^https?:\/\//, "")
    .replace(/\.r2\.cloudflarestorage\.com\/?$/, "");
}

function normalizePublicUrl(url: string): string {
  return url.replace(/\/$/, "");
}

export const R2_BUCKET_NAME = getEnvValue("R2_BUCKET_NAME");
export const R2_PUBLIC_URL = normalizePublicUrl(getEnvValue("R2_PUBLIC_URL"));

export const r2Client = new S3Client({
  endpoint: `https://${getR2AccountId()}.r2.cloudflarestorage.com`,
  region: "auto",
  credentials: {
    accessKeyId: getEnvValue("R2_ACCESS_KEY_ID"),
    secretAccessKey: getEnvValue("R2_SECRET_ACCESS_KEY"),
  },
});

export function getPhotoUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

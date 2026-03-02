# Storage Connector

## Overview

The Storage Connector provides a unified interface for object storage across the 3D Customization Engine. It uses the **Adapter Pattern** to support multiple providers: Vercel Blob for MVP/development and Cloudflare R2 for production scale.

---

## Connector Selection

Provider selection is controlled by the `STORAGE_PROVIDER` environment variable:

| Value | Connector | Use Case |
|-------|-----------|----------|
| `vercel` | VercelBlobConnector | MVP, development, Vercel deployments |
| `r2` | CloudflareR2Connector | Production, high throughput, cost optimization |

---

## StorageConnector Interface

```typescript
/**
 * Unified storage interface for object storage operations.
 * Implementations: VercelBlobConnector, CloudflareR2Connector
 */
export interface StorageConnector {
  /**
   * Upload a buffer to storage.
   * @param key - Object key (path) in the bucket
   * @param buffer - Buffer or Uint8Array to upload
   * @param options - Optional metadata (contentType, etc.)
   * @returns Public URL or path to the uploaded object
   */
  upload(
    key: string,
    buffer: Buffer | Uint8Array,
    options?: UploadOptions
  ): Promise<string>;

  /**
   * Download an object from storage.
   * @param key - Object key (path) in the bucket
   * @returns Buffer containing the object data
   */
  download(key: string): Promise<Buffer>;

  /**
   * Generate a signed URL for temporary access.
   * @param key - Object key (path) in the bucket
   * @param ttl - Time-to-live in seconds
   * @returns Signed URL valid for the specified TTL
   */
  getSignedUrl(key: string, ttl?: number): Promise<string>;

  /**
   * Delete an object from storage.
   * @param key - Object key (path) in the bucket
   */
  delete(key: string): Promise<void>;

  /**
   * List objects with a given prefix.
   * @param prefix - Key prefix to filter (e.g., "exports/tenant-123/")
   * @param options - Optional limit, cursor for pagination
   * @returns List of object keys
   */
  list(prefix: string, options?: ListOptions): Promise<ListResult>;
}

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface ListOptions {
  limit?: number;
  cursor?: string;
}

export interface ListResult {
  keys: string[];
  nextCursor?: string;
}
```

---

## VercelBlobConnector

Uses `@vercel/blob` for serverless-compatible storage on Vercel.

```typescript
import { put, get, del, list } from '@vercel/blob';

export class VercelBlobConnector implements StorageConnector {
  private readonly token: string;
  private readonly basePath?: string;

  constructor(config: { token: string; basePath?: string }) {
    this.token = config.token;
    this.basePath = config.basePath ?? '';
  }

  private resolveKey(key: string): string {
    return this.basePath ? `${this.basePath}/${key}` : key;
  }

  async upload(
    key: string,
    buffer: Buffer | Uint8Array,
    options?: UploadOptions
  ): Promise<string> {
    const path = this.resolveKey(key);
    const blob = await put(path, buffer, {
      access: 'public',
      token: this.token,
      contentType: options?.contentType ?? 'application/octet-stream',
      metadata: options?.metadata,
    });
    return blob.url;
  }

  async download(key: string): Promise<Buffer> {
    const path = this.resolveKey(key);
    const blob = await get(path, { token: this.token });
    if (!blob) throw new Error(`Object not found: ${key}`);
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async getSignedUrl(key: string, ttl: number = 3600): Promise<string> {
    // Vercel Blob doesn't support presigned URLs natively.
    // Public blobs are accessible by URL; for private, use blob.url with token.
    const path = this.resolveKey(key);
    const blob = await get(path, { token: this.token });
    if (!blob) throw new Error(`Object not found: ${key}`);
    return blob.url;
  }

  async delete(key: string): Promise<void> {
    const path = this.resolveKey(key);
    await del(path, { token: this.token });
  }

  async list(prefix: string, options?: ListOptions): Promise<ListResult> {
    const path = this.resolveKey(prefix);
    const { blobs, cursor } = await list({
      prefix: path,
      limit: options?.limit ?? 100,
      cursor: options?.cursor,
      token: this.token,
    });
    return {
      keys: blobs.map((b) => b.pathname.replace(this.basePath + '/', '')),
      nextCursor: cursor ?? undefined,
    };
  }
}
```

---

## CloudflareR2Connector

Uses `@aws-sdk/client-s3` with R2's S3-compatible API. Supports presigned URLs for private exports.

```typescript
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl?: string; // For public bucket; e.g. https://pub-xxx.r2.dev
}

export class CloudflareR2Connector implements StorageConnector {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl?: string;
  private readonly basePath?: string;

  constructor(config: R2Config & { basePath?: string }) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl;
    this.basePath = config.basePath ?? '';
  }

  private resolveKey(key: string): string {
    return this.basePath ? `${this.basePath}/${key}` : key;
  }

  async upload(
    key: string,
    buffer: Buffer | Uint8Array,
    options?: UploadOptions
  ): Promise<string> {
    const path = this.resolveKey(key);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: path,
        Body: buffer,
        ContentType: options?.contentType ?? 'application/octet-stream',
        Metadata: options?.metadata,
      })
    );
    if (this.publicUrl) {
      return `${this.publicUrl}/${path}`;
    }
    return path;
  }

  async download(key: string): Promise<Buffer> {
    const path = this.resolveKey(key);
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: path })
    );
    if (!response.Body) throw new Error(`Object not found: ${key}`);
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async getSignedUrl(key: string, ttl: number = 3600): Promise<string> {
    const path = this.resolveKey(key);
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: path,
    });
    return getSignedUrl(this.client, command, { expiresIn: ttl });
  }

  async delete(key: string): Promise<void> {
    const path = this.resolveKey(key);
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: path })
    );
  }

  async list(prefix: string, options?: ListOptions): Promise<ListResult> {
    const path = this.resolveKey(prefix);
    const response = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: path,
        MaxKeys: options?.limit ?? 100,
        ContinuationToken: options?.cursor,
      })
    );
    const keys = (response.Contents ?? []).map((o) =>
      o.Key?.replace(this.basePath + '/', '') ?? ''
    );
    return {
      keys,
      nextCursor: response.NextContinuationToken ?? undefined,
    };
  }
}
```

---

## Factory Implementation

```typescript
import { StorageConnector } from './types';
import { VercelBlobConnector } from './vercel-blob';
import { CloudflareR2Connector } from './cloudflare-r2';

export function createStorageConnector(): StorageConnector {
  const provider = process.env.STORAGE_PROVIDER ?? 'vercel';

  switch (provider) {
    case 'vercel':
      return new VercelBlobConnector({
        token: process.env.BLOB_READ_WRITE_TOKEN!,
        basePath: process.env.BLOB_BASE_PATH,
      });
    case 'r2':
      return new CloudflareR2Connector({
        accountId: process.env.R2_ACCOUNT_ID!,
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        bucket: process.env.R2_BUCKET_NAME!,
        publicUrl: process.env.R2_PUBLIC_URL,
        basePath: process.env.R2_BASE_PATH,
      });
    default:
      throw new Error(`Unknown STORAGE_PROVIDER: ${provider}`);
  }
}
```

---

## Key Conventions

| Object Type | Key Pattern | Example |
|-------------|-------------|---------|
| Exported textures | `exports/{tenant_id}/{config_hash}.png` | `exports/abc-123/a1b2c3.png` |
| Exported PDFs | `exports/{tenant_id}/{config_hash}.pdf` | `exports/abc-123/a1b2c3.pdf` |
| User uploads | `uploads/{tenant_id}/{uuid}.{ext}` | `uploads/abc-123/xyz.png` |
| Product assets | `products/{tenant_id}/{product_id}/` | `products/abc-123/jersey/` |

---

## Environment Variables

### Vercel Blob

| Variable | Required | Description |
|----------|----------|-------------|
| `STORAGE_PROVIDER` | Yes | `vercel` |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob token |
| `BLOB_BASE_PATH` | No | Optional prefix for bucket |

### Cloudflare R2

| Variable | Required | Description |
|----------|----------|-------------|
| `STORAGE_PROVIDER` | Yes | `r2` |
| `R2_ACCOUNT_ID` | Yes | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Yes | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 API token secret |
| `R2_BUCKET_NAME` | Yes | Bucket name |
| `R2_PUBLIC_URL` | No | Public bucket URL (if custom domain) |
| `R2_BASE_PATH` | No | Optional prefix |

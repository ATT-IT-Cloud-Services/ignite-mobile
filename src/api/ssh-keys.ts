import { ResourceClient } from "./resource-client";
import type { IgniteClient } from "@ignite/api-client";

export class SshKeysResource extends ResourceClient {
  constructor(client: IgniteClient) {
    super(client);
  }

  list() {
    return this.client.sshKeys.list() as Promise<{
      success: boolean;
      sshKeys: unknown[];
      limitUsed: number;
      limitMax: number;
    }>;
  }

  create(body: { name: string; publicKey: string }) {
    return this.client.sshKeys.create(body) as Promise<{ success: boolean; error?: string }>;
  }

  remove(id: string) {
    return this.client.sshKeys.delete(id) as Promise<{ success: boolean }>;
  }

  generate(body: { name: string; keyType: string; passphrase?: string }) {
    return this.client.sshKeys.generate(body) as Promise<{
      success: boolean;
      privateKey: string;
      publicKey: string;
      error?: string;
    }>;
  }
}

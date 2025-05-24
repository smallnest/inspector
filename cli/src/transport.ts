import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

export type TransportOptions = {
  transportType: "sse";
  url?: string;
};

function createSSETransport(options: TransportOptions): Transport {
  const baseUrl = new URL(options.url ?? "");
  const sseUrl = new URL("/sse", baseUrl);

  return new SSEClientTransport(sseUrl);
}

export function createTransport(options: TransportOptions): Transport {
  const { transportType } = options;

  try {
    if (transportType === "sse") {
      return createSSETransport(options);
    }

    throw new Error(`Unsupported transport type: ${transportType}`);
  } catch (error) {
    throw new Error(
      `Failed to create transport: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

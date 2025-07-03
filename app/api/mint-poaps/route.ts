import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

// --- CONFIGURE THESE VALUES ---
const ORGANIZER_PRIVATE_KEY = process.env.ORGANIZER_PRIVATE_KEY!; // base64 string
const PACKAGE_ID = "0xYOUR_PACKAGE_ID"; // <-- Replace with your deployed package ID
const MODULE_NAME = "poap";
const FUNCTION_NAME = "batch_mint_and_transfer";
// ------------------------------

const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") }); // or "mainnet"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, eventName, eventDate, description, recipients } = body;

    // Validate input
    if (
      !eventId ||
      !eventName ||
      !eventDate ||
      !description ||
      !Array.isArray(recipients) ||
      recipients.length === 0
    ) {
      return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
    }

    // Validate recipient addresses
    const isValidAddress = (address: string) => /^0x[a-fA-F0-9]{64}$/.test(address);
    if (!recipients.every((addr: string) => isValidAddress(addr))) {
      return NextResponse.json({ error: "Invalid recipient address format." }, { status: 400 });
    }

    // Prepare organizer keypair
    const keypair = Ed25519Keypair.fromSecretKey(
      Uint8Array.from(Buffer.from(ORGANIZER_PRIVATE_KEY, "base64"))
    );

    // Build the transaction
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::${FUNCTION_NAME}`,
      arguments: [
        tx.pure.string(eventName),
        tx.pure.u64(Number(eventDate)), // Make sure eventDate is a unix timestamp (u64)
        tx.pure.string(description),
        tx.pure.vector("address", recipients),
      ],
    });

    // Sign and execute the transaction
    const result = await suiClient.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: { showEffects: true },
    });

    if (result.effects?.status.status === "success") {
      return NextResponse.json({ success: true, txDigest: result.digest });
    } else {
      return NextResponse.json(
        { error: "Minting failed.", details: result.effects?.status.error || result },
        { status: 500 }
      );
    }
  } catch (e: any) {
    console.error("Mint POAPs error:", e);
    return NextResponse.json({ error: "Internal server error", details: e.message }, { status: 500 });
  }
}
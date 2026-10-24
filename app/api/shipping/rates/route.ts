import { NextResponse } from "next/server";
import { getShippoRates } from "@/lib/shippo";
import { getDeliveryOptions } from "@/lib/delivery";
import type { CartItem } from "@/types/cart";

export async function POST(req: Request) {
  try {
    const {
      firstName,
      lastName,
      address1,
      address2,
      city,
      state,
      zip,
      country = "US",
      totalWeightOz,
      items,
    } = await req.json();

    const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();

    // Main checkout sends the cart, and gets the same options (local delivery,
    // the 25+ hat offer, weight from the cart) that the payment route will
    // charge for. Quoting from a browser-supplied weight would let the shown
    // price and the charged price disagree.
    if (Array.isArray(items)) {
      const rates = await getDeliveryOptions(
        { name, line1: address1, line2: address2, city, state, zip },
        (items as CartItem[]).map((i) => ({ productType: String(i.productType), quantity: Number(i.quantity) || 0 }))
      );
      return NextResponse.json({ rates });
    }

    // The promo page handles local fulfilment itself and wants carrier rates only.
    const rates = await getShippoRates({
      name,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      weightOz: totalWeightOz,
    });

    return NextResponse.json({ rates });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected shipping error",
      },
      { status: 500 }
    );
  }
}

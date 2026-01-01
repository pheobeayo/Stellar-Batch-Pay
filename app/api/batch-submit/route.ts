/**
 * API route for submitting batch payments to Stellar
 */

import { NextRequest, NextResponse } from 'next/server';
import { StellarService } from '@/lib/stellar/server';
import { validatePaymentInstructions } from '@/lib/stellar';
import type { PaymentInstruction } from '@/lib/stellar/types';

interface RequestBody {
  payments: PaymentInstruction[];
  network: 'testnet' | 'mainnet';
}

export async function POST(request: NextRequest) {
  try {
    // Get secret key from environment
    const secretKey = process.env.STELLAR_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: 'STELLAR_SECRET_KEY is not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json() as RequestBody;
    const { payments, network } = body;

    // Validate input
    if (!Array.isArray(payments) || payments.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: payments must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!['testnet', 'mainnet'].includes(network)) {
      return NextResponse.json(
        { error: "Invalid network: must be 'testnet' or 'mainnet'" },
        { status: 400 }
      );
    }

    // Validate payments
    const validation = validatePaymentInstructions(payments);
    if (!validation.valid) {
      const errors = Array.from(validation.errors.entries())
        .map(([idx, err]) => `Row ${idx}: ${err}`)
        .slice(0, 5);
      return NextResponse.json(
        { error: `Invalid payment instructions: ${errors.join('; ')}` },
        { status: 400 }
      );
    }

    // Create Stellar service and submit batch
    const service = new StellarService({
      secretKey,
      network,
      maxOperationsPerTransaction: 100,
    });

    const result = await service.submitBatch(payments);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Batch submission error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

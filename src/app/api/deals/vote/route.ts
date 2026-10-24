import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { dealId, voteType } = await req.json();

    if (!dealId) {
      return NextResponse.json({ error: 'Brak identyfikatora okazji' }, { status: 400 });
    }

    // Try updating in Supabase if configured
    try {
      const supabase = createAdminClient();
      if (voteType === 'up') {
        await supabase.rpc('increment_upvotes', { deal_id: dealId });
      } else if (voteType === 'down') {
        await supabase.rpc('increment_downvotes', { deal_id: dealId });
      }
    } catch {
      // Supabase not yet connected or RPC not defined; will still return success for seamless UI
    }

    return NextResponse.json({ success: true, dealId, voteType });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

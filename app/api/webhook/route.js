import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token mancante' }, { status: 401 });
    }

    // Identifica l'utente tramite il webhook_token
    const { data: userSetting, error: userError } = await supabase
      .from('user_settings')
      .select('user_id')
      .eq('webhook_token', token)
      .single();

    if (userError || !userSetting) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 403 });
    }

    const userId = userSetting.user_id;
    const body = await request.json();

    let amount = parseFloat(body.amount || body.value || 0);
    let merchant = (body.merchant || body.title || body.description || 'Spesa Apple Pay').trim();
    let date = body.date || new Date().toISOString().split('T')[0];

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Importo non valido' }, { status: 400 });
    }

    // Cerca la categoria memorizzata per questo utente specifico
    let category = 'Spesa';
    const { data: memory } = await supabase
      .from('category_memory')
      .select('preferred_category')
      .eq('user_id', userId)
      .eq('merchant_name', merchant)
      .single();

    if (memory && memory.preferred_category) {
      category = memory.preferred_category;
    }

    // Inserisci la transazione legata allo user_id
    const { data: newTx, error: insertError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          merchant: merchant,
          amount: Math.abs(amount),
          category: category,
          date: date,
          source: 'Apple Pay',
          verified: false
        }
      ])
      .select();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, transaction: newTx[0] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

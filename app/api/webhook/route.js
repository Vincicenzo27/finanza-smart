import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    let { merchant, amount, category, date, source } = body;

    if (!merchant || !amount) {
      return NextResponse.json(
        { error: 'Merchant e Amount sono obbligatori' },
        { status: 400 }
      );
    }

    // 1. Controlla se il negozio è presente in category_memory
    const { data: memory } = await supabaseAdmin
      .from('category_memory')
      .select('preferred_category')
      .eq('merchant_name', merchant.trim())
      .maybeSingle();

    if (memory && memory.preferred_category) {
      category = memory.preferred_category;
    }

    // 2. Inserisce la transazione nel database
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert([
        {
          merchant: merchant.trim(),
          amount: parseFloat(amount),
          category: category || 'Shopping',
          date: date || new Date().toISOString().split('T')[0],
          source: source || 'iPhone Shortcut',
          verified: true
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, transaction: data[0] });
  } catch (error) {
    console.error('Errore webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

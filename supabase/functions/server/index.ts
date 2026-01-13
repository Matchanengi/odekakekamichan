// ▼ メール内容をリッチにした完成版コード ▼
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createTransport } from "npm:nodemailer";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    // 環境変数の取得
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const gmailUser = Deno.env.get('GMAIL_USER');
    const gmailPass = Deno.env.get('GMAIL_PASS');

    if (!supabaseUrl || !supabaseServiceKey || !gmailUser || !gmailPass) {
      throw new Error('環境変数が足りません');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ユーザー検索
    const { data: user } = await supabase
      .from('ユーザ')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // OTP生成
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();

    // DB更新
    const { error: updateError } = await supabase
      .from('ユーザ')
      .update({ reset_otp_code: otp, reset_otp_expires_at: expiresAt })
      .eq('email', email);

    if (updateError) throw new Error('DB Update Failed');

    // Gmail設定
    const transporter = createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    // ★★★ ここでメールのデザインを作っています ★★★
    await transporter.sendMail({
      from: `"おでかけかみちゃん" <${gmailUser}>`, // 送信者名
      to: email,
      subject: 'おでかけかみちゃん　パスワードリセット', // 件名
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
          <h2 style="color: #1e3a8a; text-align: center; border-bottom: 2px solid #22d3ee; padding-bottom: 10px;">パスワードリセット</h2>
          
          <p style="font-size: 16px; color: #333;">
            おでかけかみちゃんをご利用いただきありがとうございます。<br>
            以下の認証コードを入力して、パスワードの再設定を行ってください。
          </p>
          
          <div style="background-color: #f0f9ff; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0284c7;">${otp}</span>
          </div>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <p style="font-weight: bold; color: #dc2626; font-size: 18px; margin: 0;">有効期限: 10分</p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #888; text-align: center;">
            ※このメールに心当たりがない場合は、無視して削除してください。<br>
            ※このメールは自動送信されています。
          </p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ message: 'Success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createTransport } from "npm:nodemailer";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { action, email, otp, newPassword } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // --- アクション1: OTP送信 ---
    if (action === 'send-otp') {
      const { data: user } = await supabase.from('ユーザ').select('id').eq('email', email).single();
      if (!user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: corsHeaders });

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60000).toISOString(); // 10分間有効

      await supabase.from('ユーザ').update({ reset_otp_code: generatedOtp, reset_otp_expires_at: expiresAt }).eq('email', email);

      const transporter = createTransport({ service: 'gmail', auth: { user: Deno.env.get('GMAIL_USER'), pass: Deno.env.get('GMAIL_PASS') } });
      await transporter.sendMail({
        from: `"おでかけかみちゃん" <${Deno.env.get('GMAIL_USER')}>`,
        to: email,
        subject: 'パスワードリセット認証コード',
        html: `<div style="text-align:center;"><h2>認証コード</h2><h1 style="font-size:40px;">${generatedOtp}</h1><p>有効期限: 10分</p></div>`
      });

      return new Response(JSON.stringify({ message: 'Sent' }), { status: 200, headers: corsHeaders });
    }

    // --- アクション2: 本物のパスワード更新 (Authentication連携) ---
    if (action === 'reset-password') {
      // 1. 自作テーブルのOTPと「有効期限」を最終確認
      const { data: user } = await supabase.from('ユーザ')
        .select('id, reset_otp_code, reset_otp_expires_at')
        .eq('email', email).single();

      if (!user || user.reset_otp_code !== otp) {
        return new Response(JSON.stringify({ error: '認証コードが正しくありません' }), { status: 400, headers: corsHeaders });
      }

      // ★追加：サーバー側でも有効期限を厳格にチェック
      const isExpired = new Date() > new Date(user.reset_otp_expires_at);
      if (isExpired) {
        return new Response(JSON.stringify({ error: '認証コードの有効期限が切れています' }), { status: 400, headers: headers });
      }

      // 2. Authentication(ログイン用)のパスワードを管理者権限で上書き
      const { data: authUserList, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      
      const targetUser = authUserList.users.find(u => u.email === email);
      if (!targetUser) return new Response(JSON.stringify({ error: '認証システムにユーザーが見つかりません' }), { status: 404, headers: corsHeaders });

      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
        targetUser.id,
        { password: newPassword }
      );

      if (updateAuthError) throw updateAuthError;

      // 3. 自作テーブル側の情報を更新（OTPをクリアして不正利用防止）
      await supabase.from('ユーザ').update({
        password_hash: 'managed_by_supabase_auth',
        reset_otp_code: null,
        reset_otp_expires_at: null
      }).eq('email', email);

      return new Response(JSON.stringify({ message: 'Password updated' }), { status: 200, headers: corsHeaders });
    }

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendOtpRequest {
  email: string;
}

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Send OTP function called");
    
    const { email }: SendOtpRequest = await req.json();
    console.log("Email received:", email);

    if (!email) {
      throw new Error("Email is required");
    }

    // Check if RESEND_API_KEY exists
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not found");
      throw new Error("Email service not configured");
    }

    // Create Supabase client with service role to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate 6-digit OTP
    const otpCode = generateOTP();
    console.log("Generated OTP for:", email);

    // Store OTP in database (expires in 10 minutes)
    const { error: dbError } = await supabase
      .from('password_reset_otps')
      .insert({
        email: email.toLowerCase(),
        otp_code: otpCode,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to generate OTP: " + dbError.message);
    }

    console.log("OTP stored in database successfully");

    // Initialize Resend and send email
    const resend = new Resend(resendApiKey);
    
    const emailResponse = await resend.emails.send({
      from: "Shopzo <onboarding@resend.dev>",
      to: [email],
      subject: "Password Reset OTP - Shopzo",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Password Reset Request</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            We received a request to reset your password for your Shopzo account. 
            Use the following OTP to verify your identity:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background-color: #f4f4f4; padding: 20px 30px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">
              ${otpCode}
            </div>
          </div>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            This OTP will expire in 10 minutes. If you didn't request a password reset, please ignore this email.
          </p>
          <p style="color: #666; font-size: 14px; line-height: 1.5; margin-top: 30px;">
            Best regards,<br>
            The Shopzo Team
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "OTP sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send OTP" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
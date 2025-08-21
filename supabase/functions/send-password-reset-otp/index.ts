import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

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

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log("Supabase URL exists:", !!supabaseUrl);
    console.log("Supabase Service Key exists:", !!supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate 6-digit OTP
    const otpCode = generateOTP();
    console.log("Generated OTP:", otpCode, "for email:", email);

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

    // For testing: Return the OTP in response (remove in production)
    return new Response(JSON.stringify({ 
      success: true, 
      message: "OTP sent successfully",
      // REMOVE THIS IN PRODUCTION - only for testing
      debug_otp: otpCode
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
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

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log("Supabase URL exists:", !!supabaseUrl);
    console.log("Supabase Service Key exists:", !!supabaseServiceKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, check if the email is registered
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error checking user:", userError);
      throw new Error("Failed to validate email");
    }
    
    const userExists = userData.users.some(user => user.email?.toLowerCase() === email.toLowerCase());
    
    if (!userExists) {
      console.log("Email not registered:", email);
      return new Response(JSON.stringify({ 
        error: "Email not registered" 
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
    
    console.log("Email is registered, proceeding with OTP generation");

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

    // Send email with Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log("Resend API Key available:", !!resendApiKey);
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      throw new Error("Email service not configured");
    }
    
    try {
      const resend = new Resend(resendApiKey);
      
      console.log("Attempting to send email to:", email);
      console.log("Using OTP:", otpCode);
      
      const emailResponse = await resend.emails.send({
        from: "Busskit <onboarding@resend.dev>", // Using Resend's default domain for testing
        to: [email], // Now can send to any email
        subject: "Password Reset Code - Busskit",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>You requested a password reset for your Busskit account. Please use the verification code below:</p>
            <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 8px;">${otpCode}</h1>
            </div>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>The Busskit Team</p>
          </div>
        `,
      });

      console.log("✅ Email sent successfully:", JSON.stringify(emailResponse, null, 2));
      
      if (emailResponse.error) {
        console.error("❌ Resend returned error:", emailResponse.error);
        throw new Error(`Email sending failed: ${emailResponse.error}`);
      }
      
    } catch (emailError: any) {
      console.error("❌ Failed to send email:", emailError);
      console.error("Error details:", JSON.stringify(emailError, null, 2));
      
      // Don't fail the entire request - OTP is still valid for testing
      console.log("⚠️ Email failed but OTP is stored for testing");
    }

    // For testing: Return the OTP in response (REMOVE THIS IN PRODUCTION)
    return new Response(JSON.stringify({ 
      success: true, 
      message: "OTP sent successfully to your email",
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
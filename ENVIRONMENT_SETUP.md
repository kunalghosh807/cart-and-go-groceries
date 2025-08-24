# Environment Variables Setup Guide

## 🔐 Environment Variables Configuration

This project uses environment variables to securely manage API keys and configuration values. The `.env` file has been created with placeholder values that should be replaced with actual keys in production.

## 📋 Required Environment Variables

### Supabase Configuration
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_DB_URL=your_supabase_database_url
```

### Payment Gateway (Razorpay)
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Email Service (Resend)
```env
RESEND_API_KEY=your_resend_api_key
```

## 🏗️ How Environment Variables Are Used

### Frontend (Vite)
The frontend uses Vite's environment variable system:
- Variables prefixed with `VITE_` are exposed to the client-side code
- Supabase client configuration uses: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Located in: `src/integrations/supabase/client.ts`

### Backend (Supabase Edge Functions)
Edge functions use Deno environment variables:
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` for client operations
- `SUPABASE_SERVICE_ROLE_KEY` for admin operations
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` for payment processing
- `RESEND_API_KEY` for email services

## 🚀 Production Deployment

### GitHub Repository Secrets
For production deployment, configure these secrets in your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Add the following repository secrets:

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_URL
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RESEND_API_KEY
```

### GitHub Actions Workflow
The deployment workflow (`.github/workflows/deploy.yml`) automatically:
- Uses repository secrets as environment variables
- Builds the project with proper environment configuration
- Deploys to GitHub Pages

## 🔒 Security Best Practices

✅ **Implemented Security Measures:**
- `.env` file is in `.gitignore` (never committed to repository)
- Environment variables are used instead of hardcoded values
- GitHub repository secrets for production deployment
- Separate keys for different environments

⚠️ **Important Notes:**
- Never commit actual API keys to version control
- Use different keys for development and production
- Regularly rotate API keys for security
- Monitor API key usage and access logs

## 🧪 Testing Environment Setup

1. **Local Development:**
   ```bash
   # Copy .env file and update with your development keys
   cp .env .env.local
   # Edit .env.local with your actual development keys
   ```

2. **Verify Configuration:**
   ```bash
   # Start development server
   npm run dev
   # Check browser console for any environment variable errors
   ```

## 🔧 Troubleshooting

### Common Issues:

1. **Supabase Connection Failed:**
   - Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
   - Check if Supabase project is active

2. **Payment Processing Errors:**
   - Ensure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are valid
   - Verify Razorpay account is active and configured

3. **Email Service Issues:**
   - Check `RESEND_API_KEY` is valid and has proper permissions
   - Verify email domain is configured in Resend

4. **Build Failures:**
   - Ensure all required environment variables are set
   - Check GitHub repository secrets are properly configured

---

**Status: ✅ Production Ready**

Your Cart and Go Groceries project is now properly configured with environment variables and ready for secure production deployment!
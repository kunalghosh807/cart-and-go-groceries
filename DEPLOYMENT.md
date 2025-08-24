# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Update `.env.production` with actual production values
- [ ] Ensure all API keys are production-ready
- [ ] Verify Supabase project is configured for production
- [ ] Test all environment variables

### 2. Security
- [ ] All debug logs removed from production code
- [ ] No sensitive data exposed in client-side code
- [ ] HTTPS enabled for all API endpoints
- [ ] CORS properly configured

### 3. Performance
- [ ] Bundle size optimized
- [ ] Code splitting implemented
- [ ] Images optimized
- [ ] Lazy loading implemented where appropriate

### 4. Testing
- [ ] All features tested in production-like environment
- [ ] Payment gateway tested with production keys
- [ ] Authentication flow verified
- [ ] Error handling tested

## Build Process

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build for Production**
   ```bash
   npm run build
   ```

3. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Deployment Options

### Option 1: Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Option 2: Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Option 3: Traditional Hosting
1. Build the project: `npm run build`
2. Upload the `dist` folder to your web server
3. Configure your web server to serve the SPA correctly

## Environment Variables Setup

### Required Variables
```env
# Supabase
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key

# Razorpay
VITE_RAZORPAY_KEY_ID=your_production_razorpay_key_id

# Environment
VITE_NODE_ENV=production
```

## Post-Deployment

1. **Test Critical Paths**
   - [ ] User registration/login
   - [ ] Product browsing
   - [ ] Cart functionality
   - [ ] Checkout process
   - [ ] Payment processing
   - [ ] Admin panel access

2. **Monitor**
   - [ ] Set up error monitoring (e.g., Sentry)
   - [ ] Monitor performance metrics
   - [ ] Check server logs

3. **SEO & Analytics**
   - [ ] Add Google Analytics
   - [ ] Configure meta tags
   - [ ] Submit sitemap to search engines

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure variables start with `VITE_`
   - Restart development server after changes
   - Check deployment platform environment settings

2. **Supabase Connection Issues**
   - Verify URL and keys are correct
   - Check CORS settings in Supabase dashboard
   - Ensure RLS policies are properly configured

3. **Payment Gateway Issues**
   - Verify Razorpay keys are for production
   - Check webhook configurations
   - Test with small amounts first

4. **Build Failures**
   - Check for TypeScript errors
   - Ensure all dependencies are installed
   - Verify Node.js version compatibility

## Security Considerations

1. **API Security**
   - Use HTTPS everywhere
   - Implement rate limiting
   - Validate all inputs
   - Use secure headers

2. **Authentication**
   - Implement proper session management
   - Use secure password policies
   - Enable MFA where possible

3. **Data Protection**
   - Encrypt sensitive data
   - Implement proper backup strategies
   - Follow GDPR/privacy regulations

## Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement caching strategies
   - Optimize images and fonts

2. **Backend**
   - Optimize database queries
   - Implement proper indexing
   - Use connection pooling
   - Monitor response times

## Maintenance

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Update Node.js version regularly

2. **Monitoring**
   - Set up uptime monitoring
   - Monitor error rates
   - Track performance metrics
   - Review logs regularly

## Support

For deployment issues:
1. Check the troubleshooting section above
2. Review deployment platform documentation
3. Check Supabase and Razorpay status pages
4. Contact support if needed
# Doppio - Cloudflare Deployment Guide

This guide explains how to deploy Doppio to Cloudflare Pages with KV storage.

## Prerequisites

1. **Node.js 18+** (recommended 20+ for full compatibility)
2. **Cloudflare Account** with Pages and KV enabled
3. **Wrangler CLI** installed: `npm install -g wrangler`

## Environment Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env.local` file (for local development):
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

For production, set these in Cloudflare Pages dashboard:
- `JWT_SECRET`: Generate a strong random string

### 3. Configure Wrangler
Update `wrangler.toml` with your KV namespace IDs:

```bash
# Create KV namespaces
wrangler kv namespace create "USERS_KV"
wrangler kv namespace create "CAFES_KV"

# Update wrangler.toml with the returned IDs
```

## Local Development

```bash
# Run in development mode
npm run dev

# Preview Cloudflare build locally
npm run build:cloudflare
npm run preview
```

## Deployment Steps

### 1. Build for Cloudflare
```bash
npm run build:cloudflare
```

### 2. Deploy to Cloudflare Pages

#### Option A: Using Wrangler CLI
```bash
# Login to Cloudflare
wrangler login

# Deploy
npm run deploy:cloudflare
```

#### Option B: Using Cloudflare Dashboard
1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build:cloudflare`
3. Set output directory: `.next`
4. Add environment variables in dashboard
5. Deploy

### 3. Set Up KV Namespaces
After deployment, bind KV namespaces:

1. Go to Cloudflare Pages dashboard
2. Select your Doppio project
3. Go to Settings → Functions
4. Add KV namespace bindings:
   - Variable name: `USERS_KV` → Namespace: your users KV
   - Variable name: `CAFES_KV` → Namespace: your cafes KV

## Production Configuration

### Security Headers
The app includes security middleware that adds:
- XSS Protection
- Frame Options
- Content Type Options
- CSP headers

### Rate Limiting
For production, consider implementing rate limiting in Cloudflare:
1. Go to Security → WAF
2. Create rate limiting rules for `/api/auth/*` endpoints

### Monitoring
Set up Cloudflare Analytics to monitor:
- Page views
- API requests
- Error rates
- Geographic distribution

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure Node.js 18+ and all dependencies installed
2. **KV Storage Issues**: Verify KV namespace bindings in dashboard
3. **Auth Issues**: Check JWT_SECRET environment variable
4. **CORS Issues**: Verify middleware configuration

### Debug Mode
Add debugging by setting environment variable:
```env
DEBUG=*
```

## Performance Optimization

The app is optimized for Cloudflare Edge:
- Static assets served from CDN
- API routes run at edge
- KV storage for global low-latency access
- Image optimization disabled (Cloudflare handles this)

## Scaling

- **KV Storage**: Automatically scales globally
- **Pages**: Handles unlimited traffic
- **Functions**: 100ms CPU limit, 128MB memory per request
- **Bandwidth**: Included in Cloudflare plan

## Backup Strategy

KV data is automatically replicated, but consider:
- Regular exports of KV data
- User data export functionality
- Monitoring for data integrity

## Support

- Cloudflare Pages documentation
- Next.js Edge Runtime documentation
- OpenNext adapter documentation

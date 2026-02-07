# Manual Cloudflare Pages Deployment

Since Wrangler requires Node.js 20+, here's how to deploy manually:

## Option 1: Cloudflare Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready deployment"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to https://dash.cloudflare.com/pages
   - Click "Create a project"
   - Connect your GitHub repository
   - Select the doppio repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Node.js version: 18.x

4. **Set Environment Variables**
   - `JWT_SECRET`: Generate a strong random string
   - `NODE_ENV`: `production`

5. **Deploy** - Click "Save and Deploy"

## Option 2: Manual Upload

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Upload to Cloudflare**
   - Go to Cloudflare Pages dashboard
   - Create new project → "Upload assets"
   - Drag and drop the `.next` folder
   - Configure environment variables as above

## Post-Deployment Setup

### KV Namespaces
1. Go to Workers & Pages → KV
2. Create two namespaces:
   - `USERS_KV`
   - `CAFES_KV`
3. Go to your Pages project → Settings → Functions
4. Add KV bindings:
   - Variable name: `USERS_KV` → Namespace: select USERS_KV
   - Variable name: `CAFES_KV` → Namespace: select CAFES_KV

### Security
1. Go to Security → WAF
2. Create rate limiting rules for `/api/auth/*` endpoints
3. Set to 5 requests per minute

## Your App Will Be Available At
`https://doppio.pages.dev` or your custom domain

## Test the Deployment
1. Visit your deployed URL
2. Try creating an account
3. Test login functionality
4. Check browser console for any errors

The app is fully production-ready with all security features enabled!

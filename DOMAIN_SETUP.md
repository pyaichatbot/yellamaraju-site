# Domain Configuration Guide - yellamaraju.com

This guide will walk you through configuring your custom domain `yellamaraju.com` in Netlify.

## 📋 Prerequisites

- ✅ Site deployed on Netlify
- ✅ Access to your domain registrar (where you bought yellamaraju.com)
- ✅ Netlify account

## 🚀 Step-by-Step: Configure Domain in Netlify

### Step 1: Add Domain in Netlify

1. **Go to your Netlify site dashboard**
   - Visit: https://app.netlify.com
   - Click on your site

2. **Navigate to Domain Settings**
   - Click **"Site settings"** (or gear icon)
   - Click **"Domain management"** in the left sidebar

3. **Add Custom Domain**
   - Click **"Add custom domain"** button
   - Enter: `yellamaraju.com`
   - Click **"Verify"**

4. **Netlify will show configuration options**
   - You'll see instructions for DNS setup
   - Choose one of the methods below

---

## 🌐 Option A: Use Netlify DNS (Recommended - Easiest)

This is the simplest method. Netlify manages your DNS.

### Steps:

1. **In Netlify Domain Settings:**
   - After adding `yellamaraju.com`, click **"Use Netlify DNS"**
   - Netlify will show you **nameservers** (usually 4 nameservers like `dns1.p01.nsone.net`)

2. **Update Nameservers at Your Registrar:**
   - Log in to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.)
   - Find **DNS settings** or **Nameserver settings**
   - Replace existing nameservers with Netlify's nameservers
   - Save changes

3. **Wait for DNS Propagation:**
   - Usually takes 5-30 minutes
   - Can take up to 48 hours (rare)
   - Check status: https://dnschecker.org

4. **Netlify Auto-Configures:**
   - Netlify automatically creates DNS records
   - SSL certificate is automatically provisioned
   - Both `yellamaraju.com` and `www.yellamaraju.com` work

### Benefits:
- ✅ Easiest setup
- ✅ Automatic DNS management
- ✅ Automatic SSL
- ✅ Both www and non-www work automatically

---

## 🔧 Option B: Configure DNS at Your Registrar

Use this if you want to keep DNS management at your registrar.

### Step 1: Get Netlify DNS Records

In Netlify Domain Settings, you'll see DNS records to add:

**For Root Domain (yellamaraju.com):**
- **Type**: `A`
- **Name**: `@` (or leave blank)
- **Value**: Netlify IP address (shown in dashboard, usually `75.2.60.5`)

**For WWW Subdomain (www.yellamaraju.com):**
- **Type**: `CNAME`
- **Name**: `www`
- **Value**: `your-site-name.netlify.app` (your Netlify site URL)

### Step 2: Add DNS Records at Your Registrar

1. **Log in to your domain registrar**
   - Go to DNS management section

2. **Add A Record:**
   ```
   Type: A
   Name: @ (or blank, or yellamaraju.com)
   Value: 75.2.60.5 (or IP shown in Netlify)
   TTL: 3600 (or default)
   ```

3. **Add CNAME Record:**
   ```
   Type: CNAME
   Name: www
   Value: your-site-name.netlify.app
   TTL: 3600 (or default)
   ```

4. **Save changes**

### Step 3: Verify in Netlify

- Go back to Netlify Domain Settings
- Click **"Verify DNS configuration"**
- Netlify will check if records are correct

### Step 4: Wait for DNS Propagation

- Check DNS propagation: https://dnschecker.org
- Enter `yellamaraju.com` and check globally
- Usually takes 5-30 minutes

---

## 🔒 SSL Certificate Setup

Netlify automatically provisions SSL certificates (Let's Encrypt):

1. **Automatic Provisioning:**
   - Once DNS is configured correctly
   - Netlify automatically requests SSL certificate
   - Takes 5-10 minutes

2. **Check SSL Status:**
   - In Domain Settings → HTTPS
   - You'll see certificate status
   - When ready: "Certificate provisioned"

3. **Force HTTPS (Recommended):**
   - In Domain Settings → HTTPS
   - Enable **"Force HTTPS"**
   - Redirects all HTTP traffic to HTTPS

---

## 🌍 Configure WWW Redirect

### Option 1: Redirect www to non-www (Recommended)

1. In Domain Settings → Domain management
2. Click on `www.yellamaraju.com`
3. Enable **"Redirect to main domain"**
4. This makes `www.yellamaraju.com` → `yellamaraju.com`

### Option 2: Redirect non-www to www

1. In Domain Settings → Domain management
2. Click on `yellamaraju.com`
3. Enable **"Redirect to www subdomain"**
4. This makes `yellamaraju.com` → `www.yellamaraju.com`

**Recommendation:** Use non-www (yellamaraju.com) as primary, redirect www to it.

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Domain added in Netlify
- [ ] DNS records configured (Option A or B)
- [ ] DNS propagated (check with dnschecker.org)
- [ ] SSL certificate provisioned
- [ ] Site accessible at `https://yellamaraju.com`
- [ ] Site accessible at `https://www.yellamaraju.com`
- [ ] HTTPS redirect working
- [ ] WWW redirect configured (if desired)

---

## 🔍 Troubleshooting

### Domain Not Resolving

1. **Check DNS Propagation:**
   - Visit: https://dnschecker.org
   - Enter `yellamaraju.com`
   - Check if records are propagated globally

2. **Verify DNS Records:**
   - Double-check records at your registrar
   - Ensure A record points to correct Netlify IP
   - Ensure CNAME for www is correct

3. **Clear DNS Cache:**
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Windows
   ipconfig /flushdns
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

### SSL Certificate Not Provisioning

1. **Wait 10-15 minutes** after DNS propagation
2. **Check DNS is correct** - certificate won't provision if DNS is wrong
3. **Manually trigger certificate:**
   - Domain Settings → HTTPS
   - Click "Verify DNS configuration"
   - Click "Provision certificate"

### Site Shows Netlify Default Page

- This means DNS is working but domain isn't linked to your site
- Go to Domain Settings → Domain management
- Ensure `yellamaraju.com` is listed and verified

### Mixed Content Warnings

- Ensure all resources use HTTPS
- Check browser console for HTTP resources
- Update any hardcoded HTTP URLs to HTTPS

---

## 📝 Common Domain Registrars Setup

### GoDaddy

1. Log in → My Products → DNS
2. For Option A: Change nameservers to Netlify's
3. For Option B: Add A and CNAME records

### Namecheap

1. Domain List → Manage → Advanced DNS
2. For Option A: Change nameservers
3. For Option B: Add A and CNAME records

### Google Domains

1. My Domains → DNS
2. For Option A: Change nameservers
3. For Option B: Add custom records

### Cloudflare

1. DNS → Records
2. Add A record: `@` → Netlify IP
3. Add CNAME: `www` → your-site.netlify.app
4. Set proxy status to "DNS only" (gray cloud)

---

## 🎯 Quick Reference

**Netlify Domain Settings:**
- URL: https://app.netlify.com → Your Site → Site settings → Domain management

**DNS Checker:**
- https://dnschecker.org

**SSL Checker:**
- https://www.ssllabs.com/ssltest/

**Your Site:**
- After setup: https://yellamaraju.com
- Netlify URL: https://your-site-name.netlify.app (still works)

---

## 🎉 You're Done!

Once DNS propagates and SSL is provisioned:
- ✅ Your site is live at `https://yellamaraju.com`
- ✅ SSL certificate active
- ✅ Automatic deployments still work
- ✅ Both www and non-www work

**Need Help?**
- Netlify Support: https://answers.netlify.com
- Check Netlify status: https://www.netlifystatus.com


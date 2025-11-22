#!/usr/bin/env node
/**
 * Configure Vercel branch alias for staging
 * 
 * This script associates the 'staging' branch with a preview deployment
 * Run: node scripts/configure-staging-branch.js
 */

const https = require('https');
const { execSync } = require('child_process');

const PROJECT_ID = 'prj_cECQQO37wRXluZO4i5MxrKIjj3pg';
const TEAM_ID = 'team_l1WAWBvHvxQnLF4GokP8s4eA';

// Get Vercel token from CLI
function getVercelToken() {
  try {
    const authFile = require('os').homedir() + '/.vercel/auth.json';
    const fs = require('fs');
    if (fs.existsSync(authFile)) {
      const auth = JSON.parse(fs.readFileSync(authFile, 'utf8'));
      const token = Object.values(auth).find(v => v && v.token)?.token;
      if (token) return token;
    }
  } catch (e) {
    // Fallback: try to get from env or CLI
  }
  
  // Check environment variable
  if (process.env.VERCEL_TOKEN) {
    return process.env.VERCEL_TOKEN;
  }
  
  throw new Error('Vercel token not found. Run: vercel login');
}

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function configureStagingBranch() {
  try {
    const token = getVercelToken();
    
    console.log('🔧 Configuring staging branch alias...');
    
    // Get current project config
    const getOptions = {
      hostname: 'api.vercel.com',
      path: `/v9/projects/${PROJECT_ID}?teamId=${TEAM_ID}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const current = await makeRequest(getOptions);
    
    if (current.status !== 200) {
      console.error('❌ Failed to fetch project:', current.data);
      return;
    }
    
    console.log('✅ Current project config retrieved');
    
    // Update project with staging branch configuration
    // Note: Branch aliases are configured via Vercel Dashboard or API v2
    // This is a placeholder - actual implementation requires API v2 endpoints
    
    console.log('\n📝 Note: Branch aliases must be configured via Vercel Dashboard:');
    console.log('   1. Go to: https://vercel.com/gparrar-3019s-projects/micelio/settings/git');
    console.log('   2. Under "Production Branch" → Set to "main"');
    console.log('   3. Under "Branch Aliases" → Add:');
    console.log('      Branch: staging');
    console.log('      Alias: staging.miceliio.vercel.app (optional)');
    console.log('\n   Or use Vercel Dashboard → Deployments → [staging deployment] → Settings → Branch');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

configureStagingBranch();


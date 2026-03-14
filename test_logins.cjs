const { createClient } = require('@base44/sdk');
const urls = ['https://base44.app', 'https://api.base44.app', 'https://run.base44.app', 'https://api.base44.com', 'https://rowood.eu', 'https://app.base44.com'];
const emails = ['jeka7ro@gmail.com', 'jeka7ro@@gmail.com', 'admin@rowood.ro'];
const passwords = ['04Martie!', '04Martie', '04martie!'];

async function test() {
  for (const url of urls) {
    const client = createClient({ appId: '68c13cefb4bf14d17f2c2392', serverUrl: url });
    for (const email of emails) {
      for (const pass of passwords) {
        try {
          const res = await client.auth.loginViaEmailPassword(email, pass);
          console.log(`[SUCCESS] url: ${url}, email: ${email}, pass: ${pass}`);
          return;
        } catch (e) {
        }
      }
    }
  }
  console.log("ALL FAILED");
}
test();

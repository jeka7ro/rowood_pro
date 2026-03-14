const { createClient } = require('@base44/sdk');
const client = createClient({ appId: '68c13cefb4bf14d17f2c2392', serverUrl: "https://base44.app", requiresAuth: false });
client.auth.loginViaEmailPassword("jeka7ro@gmail.com", "04Martie!").then(res => console.log("Login OK:", res)).catch(err => console.error("Login Error:", err.message));

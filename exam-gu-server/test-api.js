#!/usr/bin/env node
/**
 * Script de test des endpoints Exam-GU API
 */
const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body,
          });
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

async function runTests() {
  console.log('🧪 Tests Exam-GU API\n');

  try {
    // Test 1: Login
    console.log('1️⃣  Testing POST /auth/login...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { email: 'teacher@uqac.ca', password: 'password123' });

    console.log(`   Status: ${loginResponse.status}`);
    if (loginResponse.body.token) {
      console.log(`   ✅ Login successful! Token: ${loginResponse.body.token.substring(0, 20)}...`);
      const token = loginResponse.body.token;

      // Test 2: Get profile
      console.log('\n2️⃣  Testing GET /auth/me...');
      const meResponse = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/v1/auth/me',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log(`   Status: ${meResponse.status}`);
      if (meResponse.body.firstName) {
        console.log(`   ✅ Profile retrieved: ${meResponse.body.firstName} ${meResponse.body.lastName} (${meResponse.body.role})`);
      }

      // Test 3: Get exams
      console.log('\n3️⃣  Testing GET /exams...');
      const examsResponse = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/v1/exams',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log(`   Status: ${examsResponse.status}`);
      if (Array.isArray(examsResponse.body)) {
        console.log(`   ✅ Found ${examsResponse.body.length} exam(s)`);
        if (examsResponse.body.length > 0) {
          console.log(`      - ${examsResponse.body[0].title} (${examsResponse.body[0].status})`);
        }
      }
    } else {
      console.log(`   ❌ Login failed: ${loginResponse.body.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n✨ Tests completed!');
}

// Délai pour laisser le serveur démarrer
setTimeout(runTests, 2000);

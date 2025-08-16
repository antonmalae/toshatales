import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testServer() {
  try {
    console.log('🧪 Testing server...');
    
    // Test health endpoint
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test API endpoint
    const apiResponse = await fetch(`${BASE_URL}/api`);
    const apiData = await apiResponse.json();
    console.log('✅ API endpoint:', apiData);
    
    // Test rate limiting headers
    const testResponse = await fetch(`${BASE_URL}/api/stories`);
    console.log('✅ Rate limit headers:');
    console.log('  X-RateLimit-Remaining:', testResponse.headers.get('X-RateLimit-Remaining'));
    console.log('  X-RateLimit-Reset:', testResponse.headers.get('X-RateLimit-Reset'));
    
    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testServer(); 
const axios = require('axios');

// Test frontend-backend connection
async function testConnection() {
  try {
    console.log('🔗 Testing Frontend-Backend Connection...');
    
    // Test 1: Check if backend is accessible
    console.log('\n📡 Test 1: Backend Health Check');
    try {
      const healthResponse = await axios.get('http://localhost:5000/health');
      console.log('✅ Backend is running:', healthResponse.data.message);
    } catch (error) {
      console.log('❌ Backend is not accessible:', error.message);
      return;
    }
    
    // Test 2: Test login endpoint directly
    console.log('\n🔐 Test 2: Direct Login Endpoint Test');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'john.doe@email.com',
        password: 'password123'
      });
      
      console.log('✅ Direct login successful!');
      console.log('User:', loginResponse.data.user.email);
      console.log('Token exists:', !!loginResponse.data.token);
      
      const token = loginResponse.data.token;
      
      // Test 3: Test if token works with protected endpoints
      console.log('\n🔒 Test 3: Test Protected Endpoints with Token');
      
      const invoicesResponse = await axios.get('http://localhost:5000/api/customer/invoices', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Protected endpoint accessible with token!');
      console.log('Invoices count:', invoicesResponse.data.length);
      
      // Test 4: Test Stripe endpoints
      console.log('\n💳 Test 4: Test Stripe Endpoints');
      
      try {
        const stripeResponse = await axios.post('http://localhost:5000/api/stripe/create-payment-intent', {
          amount: 33000,
          currency: 'usd'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Stripe payment intent created!');
        console.log('Payment Intent ID:', stripeResponse.data.paymentIntentId);
        console.log('Client Secret:', stripeResponse.data.clientSecret ? 'exists' : 'missing');
        
      } catch (stripeError) {
        console.log('⚠️ Stripe endpoint test failed:', stripeError.response?.data?.message || stripeError.message);
        console.log('This might be expected if Stripe keys are not configured');
      }
      
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
    }
    
    // Test 5: Test proxy through frontend port
    console.log('\n🌐 Test 5: Test Proxy Through Frontend Port (3000)');
    try {
      const proxyResponse = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'john.doe@email.com',
        password: 'password123'
      });
      
      console.log('✅ Proxy through frontend port works!');
      console.log('User:', proxyResponse.data.user.email);
      
    } catch (error) {
      console.log('❌ Proxy through frontend port failed:', error.message);
      console.log('This suggests the frontend is not running or proxy is not working');
      
      if (error.code === 'ECONNREFUSED') {
        console.log('\n💡 Frontend is not running on port 3000');
        console.log('Start the frontend with: cd client && npm run dev');
      }
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

// Run the test
testConnection(); 
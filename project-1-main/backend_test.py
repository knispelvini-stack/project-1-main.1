import requests
import sys
import json
from datetime import datetime

class LPAEcommerceAPITester:
    def __init__(self, base_url="https://lpa-store.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Timeout error")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_get_products(self):
        """Test GET /api/products - should return 12 products"""
        success, response = self.run_test(
            "Get Products",
            "GET",
            "products",
            200
        )
        if success and isinstance(response, list):
            if len(response) == 12:
                print(f"✅ Correct number of products: {len(response)}")
                # Check first product structure
                if response:
                    product = response[0]
                    required_fields = ['lpa_stock_ID', 'lpa_stock_name', 'lpa_stock_description', 
                                     'lpa_stock_price', 'lpa_stock_quantity', 'lpa_stock_category']
                    if all(field in product for field in required_fields):
                        print("✅ Product structure is correct")
                    else:
                        print("❌ Product missing required fields")
                        return False
                return True
            else:
                print(f"❌ Expected 12 products, got {len(response)}")
                return False
        return success

    def test_register_user(self):
        """Test POST /api/auth/register"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_user_data = {
            "first_name": "Test",
            "last_name": "User",
            "address": "123 Test St",
            "phone": "+1234567890",
            "username": f"testuser_{timestamp}",
            "password": "testpass123"
        }
        
        success, response = self.run_test(
            "Register User",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'token' in response and 'user' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print("✅ Token and user data received")
            return True
        return success

    def test_login_user(self):
        """Test POST /api/auth/login with existing test user"""
        success, response = self.run_test(
            "Login User",
            "POST",
            "auth/login",
            200,
            data={"username": "testuser", "password": "test123"}
        )
        
        if success and 'token' in response and 'user' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print("✅ Login successful, token received")
            return True
        return success

    def test_get_me(self):
        """Test GET /api/auth/me"""
        if not self.token:
            print("❌ No token available for authentication test")
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        if success and 'id' in response and 'username' in response:
            print("✅ User profile retrieved successfully")
            return True
        return success

    def test_search_products(self):
        """Test GET /api/products with search parameter"""
        success, response = self.run_test(
            "Search Products (keyboard)",
            "GET",
            "products?search=keyboard",
            200
        )
        if success and isinstance(response, list):
            print(f"✅ Search returned {len(response)} results")
            return True
        return success

    def test_filter_products_by_category(self):
        """Test GET /api/products with category filter"""
        success, response = self.run_test(
            "Filter Products by Category (Keyboards)",
            "GET",
            "products?category=Keyboards",
            200
        )
        if success and isinstance(response, list):
            if response:
                # Check if all products are in the Keyboards category
                keyboards_only = all(p.get('lpa_stock_category') == 'Keyboards' for p in response)
                if keyboards_only:
                    print("✅ Category filter working correctly")
                    return True
                else:
                    print("❌ Category filter not working - found products from other categories")
                    return False
            else:
                print("✅ Empty result for category filter")
                return True
        return success

    def test_create_order(self):
        """Test POST /api/orders"""
        if not self.user_id:
            print("❌ No user ID available for order test")
            return False
            
        order_data = {
            "customer_id": self.user_id,
            "first_name": "Test",
            "last_name": "User",
            "address": "123 Test St",
            "phone": "+1234567890",
            "payment_method": "VISA",
            "items": [
                {
                    "lpa_stock_ID": "LPA-KB-001",
                    "lpa_stock_name": "Neon Striker Mk.1",
                    "lpa_stock_price": 129.99,
                    "quantity": 1,
                    "amount": 129.99
                }
            ],
            "total": 129.99
        }
        
        success, response = self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            data=order_data
        )
        
        if success and 'invoice_id' in response and 'status' in response:
            print(f"✅ Order created with invoice ID: {response['invoice_id']}")
            return True
        return success

    def test_create_log(self):
        """Test POST /api/log"""
        log_data = {
            "level": "INFO",
            "message": "Test log entry from automated testing",
            "category": "TESTING"
        }
        
        success, response = self.run_test(
            "Create Log Entry",
            "POST",
            "log",
            200,
            data=log_data
        )
        
        if success and 'status' in response:
            print("✅ Log entry created successfully")
            return True
        return success

    def test_read_log(self):
        """Test GET /api/log"""
        success, response = self.run_test(
            "Read Log Entries",
            "GET",
            "log",
            200
        )
        
        if success and 'entries' in response:
            print(f"✅ Log retrieved with {len(response['entries'])} entries")
            return True
        return success

    def test_invalid_login(self):
        """Test POST /api/auth/login with invalid credentials"""
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"username": "invalid", "password": "wrongpass"}
        )
        return success

    def test_duplicate_registration(self):
        """Test POST /api/auth/register with existing username"""
        success, response = self.run_test(
            "Duplicate Registration",
            "POST", 
            "auth/register",
            400,
            data={
                "first_name": "Test",
                "last_name": "Duplicate", 
                "address": "123 Test St",
                "phone": "+1234567890",
                "username": "testuser",  # This user already exists
                "password": "testpass123"
            }
        )
        return success

def main():
    print("🚀 Starting LPA Ecommerce API Tests")
    print("="*50)
    
    tester = LPAEcommerceAPITester()
    
    # Test suite order matters - some tests depend on others
    tests = [
        # Product tests (no auth required)
        ("Get Products", tester.test_get_products),
        ("Search Products", tester.test_search_products), 
        ("Filter Products by Category", tester.test_filter_products_by_category),
        
        # Authentication tests
        ("Login with Test User", tester.test_login_user),
        ("Get Current User", tester.test_get_me),
        ("Register New User", tester.test_register_user),
        ("Invalid Login", tester.test_invalid_login),
        ("Duplicate Registration", tester.test_duplicate_registration),
        
        # Authenticated functionality
        ("Create Order", tester.test_create_order),
        ("Create Log Entry", tester.test_create_log),
        ("Read Log Entries", tester.test_read_log),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
            results[test_name] = False
            tester.tests_run += 1
    
    print("\n" + "="*50)
    print("📊 TEST RESULTS SUMMARY")
    print("="*50)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nOverall: {tester.tests_passed}/{tester.tests_run} tests passed")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"Success rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
# Mithila Borther Backend - EliteZone

EliteZone Backend is a comprehensive server-side application for managing e-commerce functionalities. This backend handles user authentication, product management, order processing, and more. It integrates with Firebase for authentication and Cloudinary for file uploads.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)
4. [API Endpoints](#api-endpoints)
    - [Authentication](#authentication)
    - [Wishlist](#wishlist)
    - [Cart](#cart)
    - [Categories](#categories)
    - [Products](#products)
    - [Product Reviews](#product-reviews)
    - [File Uploads](#file-uploads)
    - [Addresses](#addresses)
    - [Orders](#orders)
    - [Payments](#payments)
    - [Users](#users)
5. [Environment Variables](#environment-variables)
6. [License](#license)

---

## Project Overview
EliteZone Backend supports e-commerce operations like managing products, orders, user authentication, and payments. The application uses Firebase for SMS OTP-based authentication and Cloudinary for secure file storage.

---

## Technologies Used
- **Node.js** with **Express.js** for backend development.
- **MongoDB** as the database.
- **Firebase** for authentication.
- **Cloudinary** for media storage.
- **PayU**/other payment gateways for payments.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/07Akashh/elitezone-backend
   cd elitezone-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` (refer to [Environment Variables](#environment-variables)).
4. Start the server:
   ```bash
   npm run start
   ```

---

## API Endpoints

### 1.User Authentication
#### Base URL: `/user`
- **POST** `/` - Login with email/password or Continue with Google.

### 1.Admin Authentication
#### Base URL: `/admin`
- **POST** `/auth` - Login with email/password or Firebase OTP.

### 2. Wishlist
#### Base URL: `/user/wishlist`
- **GET** `/` - Fetch wishlist items for the user.
- **PUT** `/:id` - Add an item to the wishlist.
- **DELETE** `/:id` - Remove an item from the wishlist.

### 3. Cart
#### Base URL: `/user/cart`
- **GET** `/` - Retrieve cart details.
- **POST** `/` - Add items to the cart.
- **PATCH** `/:id` - Update item quantity in the cart.
- **DELETE** `/:id` - Remove an item from the cart.

## Category Routes

### **Base URL**: `/categories`

### **1. Create Category**
- **POST** `/`
- **Description**: Adds a new category. Only accessible to admins.
- **Request Body**:
  ```json
  {
    "name": "Category Name"
  }
  ```
- **Response**:
  - **201**: Category created successfully.
  - **400**: Error while creating category.

---

### **2. Add Subcategory**
- **POST** `/:id/subcategories`
- **Description**: Adds a subcategory to a specific category. Only accessible to admins.
- **Request Body**:
  ```json
  {
    "subCategoryName": "Subcategory Name"
  }
  ```
- **Response**:
  - **200**: Subcategory added successfully.
  - **404**: Category not found.
  - **400**: Error while adding subcategory.

---

### **3. Get All Categories**
- **GET** `/`
- **Description**: Retrieves all categories, including their subcategories and product counts.
- **Response**:
  - **200**: Categories fetched successfully.
  - **400**: Error while fetching categories.

---

### **4. Get All Subcategories**
- **GET** `/subcategories`
- **Description**: Fetches all subcategories.
- **Response**:
  - **200**: Subcategories fetched successfully.
  - **400**: Error while fetching subcategories.

---

### **5. Get Specific Category**
- **GET** `/:id`
- **Description**: Fetches details of a category by ID, including its subcategories.
- **Response**:
  - **200**: Category fetched successfully.
  - **404**: Category not found.
  - **400**: Error while fetching category.

---

### **6. Get Specific Subcategory**
- **GET** `/subcategory/:subcategoryId`
- **Description**: Fetches details of a specific subcategory by ID.
- **Response**:
  - **200**: Subcategory fetched successfully.
  - **404**: Subcategory not found.
  - **400**: Error while fetching subcategory.

---

### **7. Update Category**
- **PUT** `/:id`
- **Description**: Updates the details of a category. Only accessible to admins.
- **Request Body**:
  ```json
  {
    "name": "Updated Category Name",
    "subCategories": ["Subcategory IDs Array"]
  }
  ```
- **Response**:
  - **200**: Category updated successfully.
  - **404**: Category not found.
  - **400**: Error while updating category.

---

### **8. Delete Subcategory**
- **DELETE** `/:categoryId/subcategories/:subCategoryId`
- **Description**: Removes a subcategory from a specific category and deletes the subcategory. Only accessible to admins.
- **Response**:
  - **200**: Subcategory removed successfully.
  - **404**: Category not found.
  - **400**: Error while removing subcategory.

---

### **9. Delete Category**
- **DELETE** `/:id`
- **Description**: Deletes a category by ID. Only accessible to admins.
- **Response**:
  - **200**: Category deleted successfully.
  - **404**: Category not found.
  - **400**: Error while deleting category.

### 5. Products
#### Base URL: `/products`

### **1. Fetch All Products**
**`GET /`**
Fetches a list of products with filters, sorting, and pagination.

**Query Parameters**:
| Parameter      | Type    | Description                                    |
|----------------|---------|------------------------------------------------|
| `categoryId`   | String  | Filter by category ID.                        |
| `subCategoryId`| String  | Filter by sub-category ID.                    |
| `size`         | String  | Filter by size (e.g., "M", "L").              |
| `color`        | String  | Filter by color name.                         |
| `lowPrice`     | Number  | Minimum price for filtering.                  |
| `highPrice`    | Number  | Maximum price for filtering.                  |
| `sorting`      | String  | `highToLow` or `lowToHigh` for price sorting. |
| `page`         | Number  | Page number for pagination (default: 0).      |
| `limit`        | Number  | Items per page (default: 9).                  |

---

### **2. Fetch New Arrivals**
**`GET /newarrivals`**
Fetches the 4 most recently added products.

**Authentication**: Required for `isLiked` field in the response.

---

### **3. Fetch Trending Products**
**`GET /trending`**
Fetches a list of trending products (default: 10 items).

**Authentication**: Required for `isLiked` field in the response.

---

### **4. Search Products**
**`GET /search`**
Searches for products by name, description, category, or sub-category.

**Query Parameters**:
| Parameter | Type   | Description                        |
|-----------|--------|------------------------------------|
| `query`   | String | Search query string.              |

---

### **5. Fetch Product by Name**
**`GET /name`**
Fetches a single product and its available colors based on name, size, or color.

**Query Parameters**:
| Parameter   | Type   | Description                         |
|-------------|--------|-------------------------------------|
| `productName` | String | Name of the product (required).     |
| `color`       | String | Color filter (optional).           |
| `size`        | String | Size filter (optional).            |

---

### **6. Fetch Product by ID**
**`GET /:id`**
Fetches detailed information about a specific product, including matching colors.

**Path Parameters**:
| Parameter | Type   | Description                |
|-----------|--------|----------------------------|
| `id`      | String | The ID of the product.     |

---

### **Admin Operations**

**`POST /admin/products`**  
Create a new product.

**`PUT /admin/products/:id`**  
Update an existing product.

**`DELETE /admin/products/:id`**  
Delete a product by ID.

---

## **Error Handling**
- All endpoints return a consistent response structure:
  ```json
  {
    "success": true,
    "message": "Success message",
    "data": { ... }
  }
  ```
- For errors:
  ```json
  {
    "success": false,
    "message": "Error message",
    "error": "Detailed error information"
  }
  ```

### **5. Product Reviews**

#### **Base URL:** `/products`

#### **Review Endpoints**

- **POST** `/:productId/reviews`  
  Add a review for a specific product.  
  **Authentication:** Required  

  **Request Parameters:**  
  - `productId` (Path) - The ID of the product to add a review for.  

  **Request Body:**  
  ```json
  {
    "rating": 4.5,
    "comment": "Great product! Highly recommend."
  }
  ```  

  **Response Example:**  
  ```json
  {
    "success": true,
    "message": "Review added successfully.",
    "data": {
      "reviewId": "abcd1234",
      "productId": "product123",
      "userId": "user123",
      "rating": 4.5,
      "comment": "Great product! Highly recommend."
    }
  }
  ```

- **GET** `/:productId/reviews`  
  Fetch all reviews for a specific product.  
  **Authentication:** Not required  

  **Request Parameters:**  
  - `productId` (Path) - The ID of the product to fetch reviews for.  

  **Response Example:**  
  ```json
  {
    "success": true,
    "message": "Reviews fetched successfully.",
    "data": [
      {
        "reviewId": "abcd1234",
        "user": "John Doe",
        "rating": 4.5,
        "comment": "Great product!",
        "createdAt": "2024-12-01T10:30:00Z"
      },
      {
        "reviewId": "efgh5678",
        "user": "Jane Smith",
        "rating": 4.0,
        "comment": "Good quality but pricey.",
        "createdAt": "2024-11-25T08:00:00Z"
      }
    ]
  }
  ```

- **POST** `/upload`  
  Upload a photo for a review.  
  **Authentication:** Required  

  **Request Body:**  
  - Multipart form-data with the image file to upload.  

  **Response Example:**  
  ```json
  {
    "success": true,
    "message": "Photo uploaded successfully.",
    "data": {
      "photoUrl": "https://example.com/uploads/review-photo.jpg"
    }
  }
  ```

### **7. File Uploads**

#### **Base URL:** `/admin/upload`

- **POST** `/`
  Upload multiple image files to Cloudinary.  
  **Authentication:** Admin-only  

  **Request Requirements:**  
  - **Headers:**  
    - Must include a valid admin authorization token.  

  - **Request Body:**  
    - Multipart form-data with image files under the key `files`.  

  **Response Example:**  
  - **On Success:**  
    ```json
    {
      "success": true,
      "message": "Images uploaded successfully",
      "images": [
        {
          "url": "https://cloudinary.com/some-image-url.jpg",
          "order": 1
        },
        {
          "url": "https://cloudinary.com/another-image-url.jpg",
          "order": 2
        }
      ]
    }
    ```  

  - **On Failure:**  
    ```json
    {
      "success": false,
      "message": "Image upload failed",
      "error": "Error details here"
    }
    ```

### **8. Addresses**

#### **Base URL:** `/order/address`

- **GET** `/`  
  Fetch all saved addresses for the authenticated user.  
  **Authentication:** Required  

  **Response Example:**  
  - **On Success:**  
    ```json
    {
      "success": true,
      "message": "Address fetched successfully",
      "data": [
        {
          "_id": "64a79b32dcfa4b26b87b91f7",
          "firstName": "John",
          "lastName": "Doe",
          "addressLine1": "123 Main Street",
          "addressLine2": "Apt 4B",
          "city": "New York",
          "state": "NY",
          "code": "10001",
          "phone": "1234567890",
          "email": "johndoe@example.com"
        }
      ]
    }
    ```  

- **POST** `/`  
  Add a new address for the authenticated user.  
  **Authentication:** Required  

  **Request Body Example:**  
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "code": "10001",
    "phone": "1234567890",
    "email": "johndoe@example.com"
  }
  ```  

  **Response Example:**  
  - **On Success:**  
    ```json
    {
      "success": true,
      "message": "Address added successfully"
    }
    ```  

- **PUT** `/:id`  
  Update an existing address for the authenticated user.  
  **Authentication:** Required  

  **Request Parameters:**  
  - `:id` - The ID of the address to be updated.  

  **Request Body Example:**  
  ```json
  {
    "firstName": "Jane",
    "lastName": "Doe",
    "addressLine1": "456 Park Avenue",
    "addressLine2": "Suite 20",
    "city": "San Francisco",
    "state": "CA",
    "code": "94107",
    "phone": "9876543210",
    "email": "janedoe@example.com"
  }
  ```  

  **Response Example:**  
  - **On Success:**  
    ```json
    {
      "success": true,
      "message": "Address updated successfully"
    }
    ```  

- **DELETE** `/:id`  
  Delete an address for the authenticated user.  
  **Authentication:** Required  

  **Request Parameters:**  
  - `:id` - The ID of the address to be deleted.  

  **Restrictions:**  
  - Addresses linked to existing orders cannot be deleted.  

  **Response Example:**  
  - **On Success:**  
    ```json
    {
      "success": true,
      "message": "Address deleted successfully"
    }
    ```  

  - **On Failure (Address used in an order):**  
    ```json
    {
      "success": false,
      "message": "This address is used in an order and cannot be deleted"
    }
    ```  

  - **On Failure (Invalid ID):**  
    ```json
    {
      "success": false,
      "message": "Invalid address ID"
    }
    ```  

### **9. Orders**

#### **Base URL:** `/order`

- **GET** `/`  
  Fetch all orders for the authenticated user.  
  **Authentication:** Required  

  **Response Example:**  
  - **On Success:**  
    ```json
    {
      "Success": true,
      "message": "Order Fetched Successfully",
      "data": [
        {
          "_id": "64a79b32dcfa4b26b87b91f7",
          "userId": "12345",
          "items": [
            {
              "productId": {
                "_id": "64a79c00dcfa4b26b87b92a3",
                "name": "Product Name",
                "price": 100
              },
              "quantity": 2
            }
          ],
          "totalAmount": 200,
          "status": "Pending",
          "shippingAddress": "64a79b32dcfa4b26b87b91f9",
          "createdAt": "2024-12-05T10:00:00.000Z",
          "updatedAt": "2024-12-05T10:00:00.000Z"
        }
      ]
    }
    ```  

- **POST** `/`  
  Place a new order.  
  **Authentication:** Required  

  **Request Body Example:**  
  ```json
  {
    "shippingAddress": "64a79b32dcfa4b26b87b91f9",
    "items": [
      {
        "productId": "64a79c00dcfa4b26b87b92a3",
        "quantity": 2
      }
    ],
    "totalAmount": 200,
    "paymentMethod": "COD"
  }
  ```  

  **Response Example:**  
  - **On Success:**  
    ```json
    {
      "Success": true,
      "message": "Order placed successfully",
      "data": {
        "id": "64a79b32dcfa4b26b87b91f7",
        "totalAmount": 200,
        "items": [
          {
            "productId": "64a79c00dcfa4b26b87b92a3",
            "quantity": 2
          }
        ]
      }
    }
    ```  

  - **On Failure (Invalid Address):**  
    ```json
    {
      "error": "Invalid address"
    }
    ```  

- **GET** `/:id`  
  Get details of a specific order for the authenticated user.  
  **Authentication:** Required  

  **Request Parameters:**  
  - `:id` - The ID of the order to retrieve.  

  **Response Example:**  
  - **On Success:**  
    ```json
    {
      "Success": true,
      "message": "Order fetched successfully",
      "data": {
        "_id": "64a79b32dcfa4b26b87b91f7",
        "userId": "12345",
        "items": [
          {
            "productId": {
              "_id": "64a79c00dcfa4b26b87b92a3",
              "name": "Product Name",
              "price": 100
            },
            "quantity": 2
          }
        ],
        "totalAmount": 200,
        "status": "Pending",
        "shippingAddress": {
          "_id": "64a79b32dcfa4b26b87b91f9",
          "firstName": "John",
          "lastName": "Doe",
          "addressLine1": "123 Main Street",
          "city": "New York",
          "state": "NY",
          "code": "10001"
        },
        "createdAt": "2024-12-05T10:00:00.000Z",
        "updatedAt": "2024-12-05T10:00:00.000Z"
      }
    }
    ```  

  - **On Failure (Order Not Found):**  
    ```json
    {
      "error": "Order not found"
    }
    ```  

#### **Admin Routes:**  
#### **Base URL:** `/admin/orders`

- **GET** `/`  
  Fetch all orders (admin only).  

- **GET** `/filter`  
  Fetch filtered orders (admin only).  

- **GET** `/data`  
  Get data for order analytics (admin only).  

- **GET** `/:id`  
  Fetch details of a specific order (admin only).  

### **10. Payments**

#### **Base URL:** `/payments`

---

#### **POST** `/payment` - Initiate a Payment  
Initiates a payment request to PayU by generating transaction data and a secure hash.  

- **Authentication:** Required  

**Request Body:**  
```json
{
  "totalAmount": 1000,
  "productInfo": "Order for electronics",
  "userId": "64a79c00dcfa4b26b87b92a3",
  "orderId": "64a79b32dcfa4b26b87b91f7",
  "address": {
    "addressLine1": "123 Main Street",
    "addressLine2": "Apartment 101",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "code": "10001",
    "email": "example@example.com",
    "phone": "1234567890"
  }
}
```

**Response Example:**  
- **On Success:**  
```json
{
  "success": true,
  "paymentData": {
    "key": "MERCHANT_KEY",
    "txnId": "TXN123456789",
    "totalAmount": "1000",
    "productinfo": "Order for electronics",
    "firstname": "John",
    "lastname": "Doe",
    "address1": "123 Main Street",
    "address2": "Apartment 101",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipcode": "10001",
    "email": "example@example.com",
    "phone": "1234567890",
    "surl": "http://example.com/payment/success",
    "furl": "http://example.com/payment/failure",
    "hash": "GENERATED_HASH",
    "service_provider": "payu_paisa"
  },
  "url": "https://sandboxsecure.payu.in/_payment",
  "message": "Payment details generated successfully"
}
```

- **On Failure (Missing Fields):**  
```json
{
  "success": false,
  "message": "Missing required fields: totalAmount or productInfo"
}
```

---

#### **POST** `/payment/success` - Handle Payment Success  
Processes successful payments, updates the order status, and adjusts product stock.  

**Request Body:**  
PayU callback payload. Example:  
```json
{
  "status": "success",
  "txnid": "TXN123456789",
  "udf1": "64a79b32dcfa4b26b87b91f7",  // Order ID
  "udf2": "64a79c00dcfa4b26b87b92a3",  // User ID
  "email": "example@example.com"
}
```

**Response:**  
- **200 OK** if processed successfully.  

---

#### **POST** `/payment/failure` - Handle Payment Failure  
Handles failed payments and logs the failure for debugging purposes.  

**Request Body:**  
PayU callback payload. Example:  
```json
{
  "status": "failure",
  "txnid": "TXN123456789",
  "email": "example@example.com",
  "firstname": "John"
}
```

**Response:**  
- **200 OK** if logged successfully.  

---

#### **POST** `/success` - Redirect After Success  
Redirects the user to the success result page with payment data.

---

#### **POST** `/failure` - Redirect After Failure  
Redirects the user to the failure result page with payment data.


### **11. Users**

#### **Base URL:** `/user`

---

#### **GET** `/` - Get User Profile  
Fetches the profile details of the currently authenticated user.

- **Authentication:** Required  

**Response Example:**  
- **On Success:**  
```json
{
  "success": true,
  "message": "User Fetched successfully",
  "data": {
    "id": "64a79c00dcfa4b26b87b92a3",
    "email": "example@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890",
    "address": "123 Main Street",
    "pincode": "10001",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-05T00:00:00.000Z",
    "profilePhoto": "https://example.com/path/to/photo.jpg"
  }
}
```

- **On Failure:**  
```json
{
  "success": false,
  "message": "Bad Request",
  "error": "An error occurred",
  "timestamp": "2024-12-05T10:00:00.000Z"
}
```

---

#### **PATCH** `/` - Update User Details  
Updates the profile details of the currently authenticated user.

- **Authentication:** Required  

**Request Body:**  
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "9876543210",
  "address": "456 Elm Street",
  "pincode": "20002",
  "profilePhoto": "https://example.com/path/to/new_photo.jpg"
}
```

**Response Example:**  
- **On Success:**  
```json
{
  "success": true,
  "message": "User Updated successfully",
  "data": {
    "user": {
      "id": "64a79c00dcfa4b26b87b92a3",
      "email": "example@example.com",
      "firstName": "John",
      "lastName": "Smith",
      "phone": "9876543210",
      "address": "456 Elm Street",
      "pincode": "20002",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-12-05T10:00:00.000Z",
      "profilePhoto": "https://example.com/path/to/new_photo.jpg"
    }
  }
}
```

- **On Failure:**  
```json
{
  "error": "Could not update profile"
}
```

---

#### **GET** `/users` - Get All Users (Admin Only)  
Fetches a list of all users in the system.  

- **Authentication:** Admin Required  

**Response Example:**  
- **On Success:**  
```json
{
  "Success": true,
  "message": "User List Fetched Successfully",
  "data": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "example1@example.com",
      "phone": "1234567890"
    },
    {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "example2@example.com",
      "phone": "9876543210"
    }
  ]
}
```

- **On Failure:**  
```json
{
  "message": "Internal Server Error"
}
```

---

## Environment Variables

The project uses the following environment variables:

- `PORT` - Port for the server.
- `MONGODB_URI` - MongoDB connection string.
- `JWT_SECRET` - Secret key for JWT authentication.
- `ADMIN_JWT_SECRET` - Secret key for admin JWT authentication.
- `API_SECRET` - Secret key for APIs.
- `API_KEYS` - Keys for external APIs.
- `CLOUD_NAME` - Cloud name for Cloudinary.
- `NODE_ENV` - Environment mode (e.g., development, production).
- `SALT_KEY` - Salt key for hashing.
- `MERCHANT_KEY` - Merchant key for payment gateway.
- `PAY_BASE_URL` - Base URL for payment gateway.
- `S_URL` - Success URL for payment gateway.
- `F_URL` - Failure URL for payment gateway.

---

## License
This project is licensed under the MIT License.

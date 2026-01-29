Spam Detection & Contact Search Backend

This project is a backend service that allows registered users to identify spam phone numbers and
search for people by name or phone number, similar to a caller-ID and spam-detection system.

🛠️ Tech Stack

Node.js

Express.js

PostgreSQL

Prisma ORM

JWT Authentication

bcrypt (for password hashing)

📁 Project Overview

The backend provides APIs for:

User registration and login

Managing contacts

Marking phone numbers as spam

Removing spam reports

Searching users by name

Searching users by phone number

Calculating spam likelihood

All APIs are protected and accessible only to authenticated users.

🗂️ Database Design
User

id
name
phone (unique)
email (optional)
password

Contact
id
ownerId (User)
name
phone

SpamReport
id
phone
reportedBy (User)

Important Constraints

A user cannot mark the same phone number as spam more than once.

A user cannot mark it's own number as spam.

One user can have multiple contacts

Spam reports are linked to users

🔐 Authentication

Users must register and log in

Passwords are securely hashed using bcrypt

JWT tokens are issued on login

All protected routes require a valid JWT

Token payload is standardized using userId

📌 Core Features
1️⃣ Mark Number as Spam

Any user can mark any number as spam

Users cannot mark their own number

Duplicate spam reports by the same user are prevented

2️⃣ Remove Spam Report

Users can remove their own spam reports

Safe and idempotent deletion logic is used

3️⃣ Search by Name

Case-insensitive search

Partial name matches supported

Returns matching names and phone numbers

Spam likelihood is included

4️⃣ Search by Phone

Exact phone number search

If the number belongs to a registered user:

User details are returned

If not registered:

Contact details are returned (if available)

Email is shown only if the searching user has the number saved in contacts

Spam likelihood is always included

🔒 Privacy Rules

Email addresses are never publicly visible

Email is returned only when:

The searching user has the phone number in their contacts

Contact names from other users are never exposed

📊 Spam Likelihood

Spam likelihood is calculated based on the total number of spam reports for a phone number

This value is included in search responses

⚙️ Setup Instructions
1️⃣ Clone the repository

git clone <repository-url>
cd project-folder

2️⃣ Install dependencies

npm install

3️⃣ Configure environment variables

Create a .env file with:

DATABASE_URL=postgresql://...

JWT_SECRET=your_secret_key

PORT=3000

4️⃣ Run database migrations

npx prisma migrate dev

npx prisma generate

5️⃣ Database Seeding

To populate the database with sample data for testing:

npx prisma db seed

* Start the server

npm run dev

✅ Notes

Code follows clean structure and best practices for backend development

🏁 Conclusion

This backend system fulfills all requirements specified in the task PDF, including authentication, data privacy, spam detection, and search functionality. The implementation focuses on correctness, clarity, and maintainability.

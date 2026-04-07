# Admin Dashboard: Manage Store Admins User Guide

This guide explains how to use the "Manage Store Admins" dashboard to manage administrator accounts and assign them to specific stores.

## 🔑 Accessing the Dashboard
1.  Log in as a **Super Admin**.
2.  Navigate to the sidebar and click on **"Manage Admins"**.
3.  You will see a list of all administrators Currently registered in the system.

## ➕ Registering a New Admin
1.  Click the **"Add Admin"** button at the top right of the table.
2.  Fill in the **Full Name**, **Email Address**, and **Password**.
3.  Select a **Store** from the dropdown to assign the admin.
4.  Click **"Create Admin"**.
5.  A success message will appear, and the new admin will be listed in the table.

## 📝 Updating an Admin
1.  Locate the admin in the table.
2.  Click the **Pencil** icon on the right side of the row.
3.  Update the **Name**, **Email**, or **Assigned Store**.
4.  You can also toggle the admin's status (Active/Unverified).
5.  Click **"Update Admin"**.

## ❌ Deleting an Admin
1.  Locate the admin in the table.
2.  Click the **Trash** icon.
3.  A confirmation dialog will appear. Click **"OK"** to confirm deletion.
4.  The account will be permanently removed.

---

## 🛡️ Security & Validations
-   **Email**: Must be a valid email format (e.g., mail@grosur.com).
-   **Password**: Must be at least 6 characters.
-   **UUID**: Store assignment relies on a secure UUID mapping to ensure the admin is linked correctly to the backend database.

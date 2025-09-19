# User Management System - Sample Users

## 📋 Overview
This document contains the login credentials for all sample users created in the system.

**Total Users Created: 11**
- 1 Project Manager (PM)
- 5 Employees
- 5 Customers

---

## 👨‍💼 PROJECT MANAGER

| Name | Email | Password | Department | Job Title | Work Title |
|------|-------|----------|------------|-----------|------------|
| Alex Johnson | alex.johnson@techcorp.com | PM123! | Project Management | Senior Project Manager | Agile Project Lead |

---

## 👥 EMPLOYEES (5)

| # | Name | Email | Password | Department | Job Title | Work Title |
|---|------|-------|----------|------------|-----------|------------|
| 1 | Sarah Chen | sarah.chen@techcorp.com | Employee123! | Software Engineering | Senior Frontend Developer | React Specialist |
| 2 | Michael Rodriguez | michael.rodriguez@techcorp.com | Employee123! | DevOps | DevOps Engineer | Cloud Infrastructure Lead |
| 3 | Emily Watson | emily.watson@techcorp.com | Employee123! | Quality Assurance | QA Tester | Automation Testing Expert |
| 4 | David Kim | david.kim@techcorp.com | Employee123! | Backend Development | Backend Developer | Node.js & Database Specialist |
| 5 | Lisa Thompson | lisa.thompson@techcorp.com | Employee123! | UI/UX Design | UI/UX Designer | Product Design Lead |

---

## 🏢 CUSTOMERS (5)

| # | Name | Email | Password | Company | Address |
|---|------|-------|----------|---------|---------|
| 1 | Robert Anderson | robert.anderson@globaltech.com | Customer123! | GlobalTech Solutions | 456 Innovation Drive, San Francisco, CA 94105 |
| 2 | Jennifer Martinez | jennifer.martinez@retailplus.com | Customer123! | RetailPlus Inc | 789 Commerce Street, Chicago, IL 60601 |
| 3 | William Brown | william.brown@healthcarecorp.com | Customer123! | HealthcareCorp Systems | 321 Medical Plaza, Boston, MA 02115 |
| 4 | Amanda Davis | amanda.davis@financegroup.com | Customer123! | FinanceGroup Ltd | 654 Wall Street, New York, NY 10005 |
| 5 | Christopher Lee | christopher.lee@manufacturing.com | Customer123! | Manufacturing Dynamics | 987 Industrial Way, Detroit, MI 48201 |

---

## 🚀 Quick Login Guide

### For Testing User Management Features:
1. **Login as PM**: Use `alex.johnson@techcorp.com` / `PM123!`
   - Can view all users
   - Can create/edit/delete users
   - Can see passwords for all users

### For Testing Employee Features:
- Use any employee email with password `Employee123!`
- Example: `sarah.chen@techcorp.com` / `Employee123!`

### For Testing Customer Features:
- Use any customer email with password `Customer123!`
- Example: `robert.anderson@globaltech.com` / `Customer123!`

---

## 🔧 Script Information

**Script File**: `backend/scripts/createSampleUsers.js`
**Database**: MongoDB
**Status**: All users created successfully ✅

### Features Tested:
- ✅ User creation with different roles
- ✅ Password hashing
- ✅ Role-based field validation
- ✅ Custom work titles (no enum restrictions)
- ✅ Company information for customers
- ✅ Department/Job titles for employees
- ✅ API authentication and authorization
- ✅ User management CRUD operations

---

## 📝 Notes

- All passwords are hashed using bcrypt
- Users are created with `status: 'active'`
- All users have unique email addresses
- PM can see passwords in the user management interface
- Custom work titles are stored as free text (no enum validation)
- All users are created by 'system' with a generated ObjectId

---

*Generated on: $(Get-Date)*
*Script Version: 1.0*

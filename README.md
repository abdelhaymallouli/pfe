# Venuvibe - Event Planning Platform

## Project Overview

Venuvibe is a personalized event planning platform designed to help users organize and manage various events, such as birthdays, weddings, and corporate gatherings. The platform aims to provide a comprehensive suite of tools including personalized event creation, vendor selection, budget tracking, guest management, and real-time collaboration features.

---

## Key Features

1.  **User Authentication:** Secure sign-up and login with email/password, potentially including OAuth integration (e.g., Google, Facebook).
2.  **Event Dashboard:** A central hub to create and manage multiple events, displaying upcoming events, budgets, and deadlines at a glance.
3.  **Personalized Event Templates:** Customizable templates for different event types (birthday, wedding, corporate, etc.) with options for themes, colors, and layouts.
4.  **Vendor Directory:** A searchable and filterable list of vendors (caterers, decorators, photographers, etc.) complete with ratings and reviews.
5.  **Budget Tracker:** Tools for allocating budget across categories (food, decor, entertainment) and visualizing expenses and remaining funds.
6.  **Guest Management:** System for inviting guests via email/SMS, managing RSVPs, and organizing seating arrangements.
7.  **Task List and Reminders:** A checklist for event tasks with deadlines and notification features for pending items.
8.  **Collaboration:** Functionality to invite collaborators to an event, enabling real-time updates and shared notes.
9.  **Responsive Design:** Mobile-first and accessible design principles applied to ensure usability across all devices.
10. **Admin Panel (Potential):** A backend interface for managing user accounts, events, and vendor listings, possibly including analytics.

---

## Tech Stack

### Frontend

*   **HTML:** Structuring the platform's content.
*   **CSS:** Styling with Flexbox, Grid, and Media Queries for responsiveness. Includes animations and transitions.
*   **JavaScript:** Implementing dynamic features, interactive elements, real-time updates, and form validation.
*   **React.js or Vue.js:** For building reusable UI components (event cards, vendor listings, dashboards).

### Backend

*   **PHP:** Server-side programming and handling business logic.
*   **CRUD Operations:** Implementing Create, Read, Update, and Delete functionality for events and other data.
*   **JSON Handling:** Manipulating and exchanging data between the frontend and backend.

### Database

*   **SQL (MySQL/MariaDB):**
    *   Designing tables for users, events, vendors, budgets, guests, tasks, etc.
    *   Performing standard SQL operations (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
    *   Using joins to link related data (e.g., linking users to their events).

### CMS (Optional/Integrated)

*   **WordPress:** Potential integration for managing static content like blog posts ("How to Plan Events") or FAQs, including SEO and security plugins.

### Styling and UX/UI

*   **Responsive Design Principles:** Ensuring optimal display and functionality on all devices.
*   **UX Tools:** Using Figma for creating mockups and wireframes during the design phase.
*   **Bootstrap or Tailwind CSS:** Utilizing a CSS framework for consistent and responsive design elements.

### Additional Tools

*   **Version Control:** Git for tracking changes and facilitating collaboration.
*   **Testing:** Implementing tests for PHP scripts (backend logic) and SQL queries (database efficiency).
*   **Deployment:** Deploying the project on platforms supporting PHP (e.g., Heroku, AWS, shared hosting).

---

## Development Plan / Roadmap

This project follows a phased development approach:

### **Week 1-2 (Until 10/5): Initial Setup and Planning**

1.  Finalize Project Scope and Requirements
2.  Set up Project Environment (Frontend and Backend)
3.  Design Database Schema
4.  Implement User Authentication (Frontend + Backend)
5.  Create Basic CRUD Operations for Events

### **Week 3 (11/5 - 17/5): UI/UX Design & Frontend Development**

1.  Create Figma Designs for UI/UX
2.  Develop Event Dashboard (Frontend)
3.  Build Personalized Event Templates
4.  Develop Vendor Directory with Search/Filter (Frontend)

### **Week 4 (18/5 - 24/5): Feature Development and Integration**

1.  Implement Budget Tracker (Frontend + Backend)
2.  Develop Guest Management System
3.  Develop Task List and Reminders
4.  Connect Frontend with Backend (API Integration)
5.  Ensure Responsive Design (Frontend)

### **Week 5 (25/5 - 30/5): Testing, Debugging, and Finalizing**

1.  Comprehensive Testing of All Features (Frontend + Backend)
2.  UI/UX Refinement based on testing/feedback
3.  Project Documentation
4.  Prepare for Final Submission

---

## Task Summary & Time Estimates

---

## Task Summary & Time Estimates

### Task Summary Table

| **Task** | **Time Estimated** |
| --- | --- |
| Finalize Project Scope & Requirements | 1-2 days |
| Set up Project Environment | 1-2 days |
| Design Database Schema | 1-2 days |
| User Authentication | 3-4 days |
| CRUD Operations for Events | 3 days |
| Create Figma Designs | 2-3 days |
| Develop Event Dashboard | 2-3 days |
| Build Personalized Event Templates | 3 days |
| Vendor Directory | 2 days |
| Budget Tracker | 3 days |
| Guest Management System | 2-3 days |
| Task List and Reminders | 2-3 days |
| Connect Frontend with Backend (API) | 3 days |
| Responsive Design | 2-3 days |
| Testing and Debugging | 3 days |
| UI/UX Refinement | 2-3 days |
| Project Documentation | 1-2 days |
| Prepare for Submission | 1 day |

---

### Total Time Estimate:

*   **Frontend Development**: Approximately **3-4 weeks**
*   **Backend Development**: Approximately **2-3 weeks**
*   **Design and Testing**: Approximately **1-2 weeks**

---

## Important Notes for Task Management

1.  **Prioritize:** Focus on critical tasks like user authentication and core CRUD operations first.
2.  **Overlap:** Frontend and backend development can occur in parallel, but allocate time for integration.
3.  **Refine:** Be prepared to revisit and adjust tasks based on testing or feedback.
4.  **Weekly Review:** Conduct regular check-ins to track progress and adjust the timeline as needed to meet the deadline (30/5).

---

## Getting Started

*(Add instructions here on how to set up and run the project locally. Example placeholders below)*

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd venuvibe
    ```
2.  **Set up the backend:**
    *   Ensure you have PHP and a web server (like Apache or Nginx) installed.
    *   Set up a MySQL or MariaDB database.
    *   Import the database schema (e.g., `database.sql` if you have one).
    *   Configure database connection details in the backend code (e.g., in a config file).
    *   Place the backend files in your web server's document root or configure a virtual host.
3.  **Set up the frontend:**
    *   Navigate to the frontend directory (`cd frontend`).
    *   Install dependencies (e.g., `npm install` or `yarn install`).
    *   Configure the API endpoint to point to your running backend.
    *   Start the frontend development server (e.g., `npm start` or `yarn serve`).
4.  **Access the application:** Open your web browser and go to the address where your web server is hosting the project (e.g., `http://localhost/venuvibe` or `http://localhost:3000` for the frontend dev server).

---

## Usage

*(Add instructions here on how to use the application. Example placeholders below)*

1.  Sign up for a new account or log in if you already have one.
2.  Navigate to the Dashboard.
3.  Click "Create New Event" to start planning.
4.  Fill in event details, select a template, manage your budget, add guests, and create tasks.
5.  Explore the Vendor Directory to find services for your event.
6.  Use the collaboration feature to invite others to help plan.

---

## Potential Future Enhancements

*   **AI-powered Recommendations:** Suggest vendors, themes, and budgets based on event type and user preferences.
*   **Interactive Timeline:** Drag-and-drop interface for scheduling event tasks and milestones.
*   **Integration with Social Media:** Share event details or photos directly on platforms like Instagram or Facebook.
*   **Gamification:** Award points or badges for completing tasks or staying within budget.

---

## About the Project


feature/figma-designs

feature/event-dashboard

feature/event-templates

feature/vendor-directory

feature/budget-tracker

feature/guest-management

feature/task-list-reminders

feature/api-integration

feature/responsive-design

feature/testing-debugging

feature/ui-ux-refinement

feature/documentation

This project was developed as a final project.

Abdelhay Mallouli

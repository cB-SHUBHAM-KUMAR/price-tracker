# 💰 Dynamic Price Fairness Checker (PriceFair)

A next-generation, AI-powered dynamic price tracking system built to help you navigate volatile pricing on products, flights, and hotels. Rather than just showing the current price, **PriceFair** uses robust back-end heuristics to give you a *confidence score* on whether a price is currently inflated, a fair market average, or a genuine unmissable deal.

![PriceFair Dashboard Preview](frontend/public/icons/icon-512x512.png) <!-- Update with actual preview screenshot if available -->

## 🚀 Features

- **Multi-Factor Pricing Intelligence**: Analyzes real-time scraping data alongside product category, brand, and seasonal demand. 
- **Platform-Agnostic Comparison**: Pit products against each other natively right inside your own workspace. Compare flights, hotels, and physical goods side-by-side using the `ComparisonPage`.
- **Surge Detection**: Identifies whether dynamic pricing algorithms are inflating prices during peak activity hours.
- **Price Alerts System**: Set granular targets and receive immediate notifications when the asset hits your configured threshold.
- **SaaS "Dark Mode" Aesthetic**: Completely redesigned with a professional, zero-distraction layout. Features a frosted-glass **Top Navbar**, pure monochrome gradients, and high-density typography (Inter + Space Grotesk).
- **History Logs**: Every query you make is securely tracked into an interactive log spanning all items you've investigated.

## 🛠 Tech Stack

- **Frontend**: React.js, Vite, Vanilla CSS Modules (Strict Custom Styling System), React Router, Redux Toolkit.
- **Backend / API**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ORM).
- **Scraping Engine**: Custom internal node orchestration.
- **Authentication**: JWT secured endpoints.

## 📦 Local Installation

### Prerequisites
Make sure you have Node.js (v18+) and MongoDB installed locally, or a free MongoDB Atlas connection string.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cB-SHUBHAM-KUMAR/price-tracker.git
   cd price-tracker
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   *Create a `.env` file in the `backend` directory referencing `backend/.env.example` to establish your `MONGO_URI` and `JWT_SECRET`.*

   Start the API server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   Open a new terminal session.
   ```bash
   cd frontend
   npm install
   ```
   Start the Vite development build:
   ```bash
   npm run dev
   ```

4. You can now view the application at `http://localhost:5173/` (or the port specified by Vite).

## Local Test Credentials

If you run the backend seed script (`cd backend && npm run seed`), the following users are created:

- User account
  - Email: `user@example.com`
  - Password: `User1234!`
- Admin account
  - Email: `admin@example.com`
  - Password: `Admin123!`

Note: In non-production environments, `npm run seed` clears existing users, analyses, and alerts before inserting seed data.

## 🗂 Project Structure
- **/frontend**: React web application containing the Top Navbar layout, responsive grid structures, Redux store for alerts and user states, and pure CSS modular stylesheets.
- **/backend**: Express APIs parsing AI heuristic endpoints, historical database logs, authentication routes, and internal price scraping handlers.

## 🤝 Contribution

This repository uses modern coding standards:
- Adhere strictly to the monochrome design specifications outlined in `theme-variables.css`. Emojis and bloated gradient frameworks are explicitly forbidden in the UI. 
- All new React components should be modularized, accessible, and structured functionally.

## 📝 License
MIT License. Feel free to clone, branch, and deploy natively.

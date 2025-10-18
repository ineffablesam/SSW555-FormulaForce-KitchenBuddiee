<img width="120" alt="app-icon" src="./public/logo/logo-rounded.png">
# SSW555-FormulaForce-RecipeMate
🥘 Kitchen Buddiee — connect, cook, and share your favorite dishes.

This app is a recipe assistant app. The emphasis of this app will be on easy browsing and organizing recipes. The primary users of this app will be new cooks, who want to try new recipes and need a place to easily access instructions, and home cooks, who want to save all the recipes they make in one place so that grocery shopping and meal planning becomes easier. 

## 👥 Team Members

| Role | Members |
|------|----------|
| 💻 **Front End** | 🧑‍💻 Samuel Philip <br> 👩‍💻 Aisiri Mandya Rajashekar |
| 🗄️ **Back End** | 👨‍💻 Yang Gao <br> 🧑‍💻 Achilles Emnace <br> 👩‍💻 Maria Ebrahim |



## 🧱 Project Development Guide

### 📂 Creating New Pages and Components

#### ➕ Create a New Page
1. Go to `src/pages/`
2. Create a new file named `About.jsx`  
   Example:
   ```jsx
   import React from 'react'

   export default function About() {
     return (
       <div className="p-6">
         <h2 className="text-2xl font-semibold mb-2">About Kitchen Buddiee</h2>
         <p className="text-gray-600">
           Kitchen Buddiee helps you connect, cook, and share your favorite dishes with the world.
         </p>
       </div>
     )
   }
   ```

3. Import and render it inside `App.jsx`:

   ```jsx
   import About from './pages/About'

   export default function App() {
     return (
       <div className="min-h-screen w-full bg-gray-50">
         <About />
       </div>
     )
   }
   ```

#### 🧩 Create a New Component
1. Go to `src/components/`
2. Create a new file named `Button.jsx` Example:

   ```jsx
   import React from 'react'

   export default function Button({ label }) {
     return (
       <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
         {label}
       </button>
     )
   }
   ```

3. Use it anywhere:

   ```jsx
   import Button from '../components/Button'
   ...
   <Button label="View Recipe" />
   ```

### 🎨 Using Tailwind CSS
Tailwind is a utility-first CSS framework, meaning you style directly in your JSX using class names.
Examples:

```jsx
<div className="p-4 bg-white rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-gray-800">Hello!</h1>
  <p className="text-gray-500">Styled with Tailwind v3</p>
</div>
```

#### 🔗 Learn More
For help or design inspiration: 👉 Tailwind CSS Docs (https://tailwindcss.com/docs/styling-with-utility-classes)

Common utilities to explore:
* Layout: `flex`, `grid`, `w-full`, `h-screen`
* Spacing: `p-4`, `m-2`, `gap-4`
* Text: `text-lg`, `font-semibold`, `text-gray-600`
* Colors: `bg-blue-500`, `text-red-600`
* Effects: `shadow`, `rounded`, `hover:scale-105`, `transition`

### 📁 Folder Structure Overview

```
src/
├─ components/     # Small reusable UI blocks (e.g., buttons, cards)
├─ pages/          # Full-page views (e.g., Home, About, Recipes)
├─ App.jsx         # Main app layout
├─ main.jsx        # Entry point
└─ index.css       # Tailwind base styles
```

### 🚀 Running the Project
For First time please run this below command to install all the dependencies.

```
npm i
```

Start development server

```
npm run dev
```

This runs the app at: 👉 http://localhost:5173
Every time you save a file, the browser auto-refreshes with your changes.

Build for production(Only for Reference)

```
npm run build
npm run preview
```

Use this for testing the PWA install and offline support.

### 📱 Accessing from Your Mobile Device (Same Wi-Fi)
1. On your laptop, while the dev server is running, find your local IP:
   * Windows: `ipconfig`
   * macOS/Linux: `ifconfig | grep inet`
2. Look for an address like: `192.168.x.x`
3. On your phone (connected to the same Wi-Fi), open:

   ```
   http://192.168.x.x:5173
   ```

4. Your Kitchen Buddiee app will open on your mobile browser — perfect for testing responsive design.

### ✅ Quick Tips
* Always use Tailwind class names instead of writing custom CSS.
* Run `npm run dev` frequently to test changes.
* Make sure all files are saved inside `src/` (React won't detect changes outside it).

# FeedFlow 🌊

> **Your feed. Your rules. Your algorithm.**

FeedFlow is a React Native mobile application built to give you back control over your digital consumption. It acts as a personal firewall and curation engine for your Instagram feed, allowing you to explicitly declare what you want to see—and what you want to avoid.

## 🎥 Demo Video

📹 **Watch the FeedFlow Demo**

[▶️ Open Demo Video](./assets/Demo/FeedFlow%20Demo%20Video.mp4)
---

## 🚀 The Problem & Solution

**The Problem:** The Instagram algorithm is a black box. Users get trapped in engagement loops, exposed to polarizing news, clickbait, and toxic content, leading to endless scrolling with zero agency over their feed.

**The Solution:** FeedFlow puts you in the driver's seat. By integrating directly with your Instagram, analyzing your engagement, and allowing you to set explicit boundaries (Avoidance Topics), FeedFlow actively trains your algorithm so it serves your interests, not the other way around.

---

## 🛠️ Tech Stack

*   **Frontend:** React Native & Expo
*   **Styling:** Tailwind CSS / NativeWind
*   **Backend & Auth:** Supabase (PostgreSQL, Auth, Edge Functions)
*   **Intelligence Engine:** Google Gemini AI
*   **Automation Pipeline:** N8N

---

## ⚙️ Implementation Approach

We took a highly modular and automated approach to build FeedFlow's intelligence loop:

1.  **Authentication & Extraction:** When a user connects their Instagram via our secure OAuth proxy, we authenticate their session and extract their profile metrics.
2.  **Automation Pipeline (N8N):** We utilize an N8N automation workflow to simulate pulling the user's recent feed interactions, likes, and engagement metrics.
3.  **Topic Modeling (Gemini AI):** The raw engagement payload is piped directly into the Gemini API. Gemini acts as our NLP engine, analyzing thousands of data points to categorize interactions into an actionable "Interest DNA" graph.
4.  **Database Storage (Supabase):** The newly calibrated Interest DNA and "Avoidance Topics" are securely saved in Supabase.
5.  **Real-Time UI:** The React Native frontend fetches this DNA to generate an "Alignment Score", dynamically render the Intelligence Dashboard, and populate the Firewall Debugger with intercepted content.

---

## 🔄 Workflow

The application operates in a continuous, automated loop:

1.  **Connect:** Securely authenticate your Instagram account.
2.  **Calibrate:** Select your core *Interests* (e.g., Startups, Productivity) and explicit *Dislikes* (e.g., Clickbait, Drama).
3.  **Automate:** FeedFlow's N8N + Gemini pipeline continuously analyzes your scrolling behavior and adjusts your DNA.
4.  **Monitor:** Check your interactive Dashboard to view your "Algorithm Reinforcement Velocity" graph and see exactly what toxic content the app intercepted today.

---

## 💻 Local Installation

To run FeedFlow locally on your machine:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/feedflow.git
cd feedflow

# 2. Install dependencies
npm install

# 3. Setup Environment Variables
# Create a .env file in the root directory and add your Supabase and Gemini keys
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 4. Start the Expo server
npm start
```

Press `i` to open the iOS simulator, `a` for Android, or scan the QR code with the Expo Go app on your physical device.

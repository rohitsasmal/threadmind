# How to Run the Project

## 🛠 Prerequisites
Before running this project, ensure you have the following installed:

- *Node.js* (v18 or higher) → [Download Node.js](https://nodejs.org/)
- *npm* (comes with Node.js) or *yarn*
- *Git* → [Download Git](https://git-scm.com/)

To verify installation, run:

node -v
npm -v
git --version


---

## 💾 1. Clone the Repository
Open a terminal and run:

git clone <your-repository-url>
cd <your-repository-folder>


---

## 📞 2. Install Dependencies
Run:

npm install

or if using yarn:

yarn install


---

## 🔑 3. Set Up Supabase
1. Run this in Supabase SQL editor:
   
   CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent UUID REFERENCES messages(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    type VARCHAR NOT NULL,
    editable BOOLEAN DEFAULT true
);

---

## 🔑 4. Set Up Environment Variables
1. Create a .env.local file in the root folder:
   
   touch .env.local
   
2. Open .env.local and add your *Supabase credentials*:
   
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   
   You can find these in your *Supabase dashboard*.

---

## 🚀 5. Start the Development Server
Run:

npm run dev

or if using yarn:

yarn dev

The app will be available at *http://localhost:3000*.

---

## 💡 6. Build and Run in Production
To build and serve your app:

npm run build
npm run start

or if using yarn:

yarn build
yarn start


---

## 🎯 Platform-Specific Notes
### 🖥 macOS & Linux
- Use *Terminal* (Ctrl + Alt + T on Linux)
- If npm is missing, install Node.js with:
  
  sudo apt install nodejs npm  # Ubuntu/Debian
  brew install node  # macOS (Homebrew)
  

### 🖥 Windows
- Use *Command Prompt (cmd.exe)* or *PowerShell*
- If using PowerShell and facing permission issues, run:
  
  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  
- Consider using *Windows Subsystem for Linux (WSL)* for a better experience.

---

## ✅ Troubleshooting
### 1️⃣ EADDRINUSE: Address already in use
Another process is using port 3000. Run:

kill -9 $(lsof -t -i:3000)  # macOS/Linux
netstat -ano | findstr :3000  # Windows (Find PID)
taskkill /PID <PID> /F  # Windows (Kill process)


### 2️⃣ command not found: npm
Ensure Node.js is installed. Try:

node -v
npm -v

If missing, reinstall Node.js.

### 3️⃣ Supabase errors
- Double-check your .env.local settings.
- Run:
  
  rm -rf .next
  npm run dev
  
- Check the Supabase dashboard for service status.

---

🎉 *You're all set!* Your app is now running. 🚀
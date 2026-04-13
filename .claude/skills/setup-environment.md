# Setup Environment

You are helping a non-technical user set up their development environment to run a React Native / Expo app. Speak in plain, friendly language. No jargon without explanation. If something fails, explain what went wrong and what to try.

## Step 1: Detect platform

```bash
uname -s 2>/dev/null || echo "Windows"
```

Store the result. Use it to tailor all subsequent instructions:
- **Windows (MINGW, MSYS, or "Windows"):** Use PowerShell commands. Paths use backslashes in display but forward slashes in commands.
- **Darwin:** macOS. Use standard terminal commands.
- **Linux:** Use standard terminal commands.

## Step 2: Check and install Node.js

```bash
node --version 2>/dev/null
```

**If Node.js is found:** Report the version and continue to Step 3.

**If Node.js is NOT found:** Install it automatically based on platform.

**Windows:**

Try winget first (built into Windows 10/11):

```bash
winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements 2>&1
```

If winget succeeds, tell the user:

```
I just installed Node.js for you. I need to refresh the terminal so it can find it.
```

Then verify it's available:

```bash
export PATH="$PATH:/c/Program Files/nodejs" 2>/dev/null  # Git Bash
node --version 2>/dev/null
```

If winget is not available or fails, try chocolatey:

```bash
choco install nodejs-lts -y 2>&1
```

If both winget and chocolatey fail, fall back to manual install:

```
I wasn't able to install Node.js automatically. Let's do it the manual way -- it's quick:

1. Open your web browser and go to https://nodejs.org
2. Click the big green button that says "LTS" (Long Term Support)
3. Run the installer that downloads -- click Next through each step, defaults are fine
4. When it's done, close this terminal completely and open a new one
5. Come back to this folder and run `claude` again, then say "setup my environment"

The installer takes about 2 minutes. I'll be here when you get back.
```

Stop and wait for the user to return.

**macOS:**

```bash
# Try Homebrew first
brew install node 2>&1 || {
  # Fall back to manual instructions
  echo "Homebrew not available"
}
```

If brew is not available, guide to https://nodejs.org manual download.

**Linux:**

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - 2>&1 && sudo apt-get install -y nodejs 2>&1
```

**After any install attempt**, verify:

```bash
node --version 2>/dev/null
```

If still not found after automatic install, the terminal may need to be restarted. Tell the user:

```
Node.js was installed but this terminal can't see it yet. Close this terminal window completely, open a new one, come back to this folder, run `claude`, and say "setup my environment" again. It'll pick right up where we left off.
```

## Step 3: Install project dependencies

```bash
npm install
```

If this fails, read the error output. Common issues:
- **Permission errors on Windows:** Suggest running the terminal as Administrator
- **Network errors:** Ask if they're connected to the internet
- **node-gyp or native module errors:** These sometimes happen on Windows. Try:
  ```bash
  npm install --ignore-scripts 2>&1
  ```
- **Other errors:** Show the error and ask them to send a screenshot to Dave

## Step 4: Verify the install worked

```bash
npx expo --version 2>/dev/null
```

If Expo CLI responds with a version number, the install is good.

## Step 5: Check for Expo Go on phone

Ask the user:

```
Before we start the app, let's make sure your phone is ready.

Do you have the "Expo Go" app installed on your iPhone? It's a free app from the App Store -- it lets you run the app on your phone during development.

If you don't have it, open the App Store on your phone, search for "Expo Go", and install it. Let me know when it's ready.
```

Wait for confirmation before proceeding.

## Step 6: Start the dev server

```bash
npx expo start
```

Run this in the background. Then tell the user:

```
The app is starting up. You should see a QR code in the terminal.

Now let's connect your phone:

1. Make sure your phone is on the same WiFi network as this computer
2. Open your phone's Camera app and point it at the QR code in the terminal
3. Tap the notification that pops up -- it'll open the app in Expo Go

The first load takes 30-60 seconds while it builds. You'll see a loading bar.

If the QR code doesn't work:
- Make sure phone and computer are on the same WiFi
- Try typing 's' in this terminal to switch to a different connection mode
- If all else fails, open the app in your browser at http://localhost:8081 (gestures won't feel the same but you can still test the flow)
```

## Step 7: Confirm the app loaded

Ask the user: "Can you see the app on your phone? You should see a dark screen with warm amber colors, a small red panda at the bottom, and some fog."

**If yes:** Tell them setup is complete and they can start testing:

```
You're all set! To start the testing walkthrough, type:

@TESTING-GUIDE.md
```

**If no:** Troubleshoot:
- "Do you see a loading bar?" -- Still building, wait
- "Do you see an error?" -- Ask them to read it to you or send a screenshot to Dave
- "Nothing happened when I scanned the QR code" -- WiFi mismatch, try browser fallback
- "It says something about a network timeout" -- Phone and computer are on different networks

## Important

- This script may install Node.js via winget, chocolatey, or homebrew -- those are safe, standard package managers
- Never run commands that modify system settings beyond what's needed for this project
- If anything looks wrong or unfamiliar, stop and ask the user to contact Dave
- Keep your language warm and patient -- this person is not a developer and that's completely fine

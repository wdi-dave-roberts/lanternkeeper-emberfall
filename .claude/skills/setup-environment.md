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

## Step 2: Check Node.js

```bash
node --version 2>/dev/null
```

**If Node.js is found:** Report the version and continue.

**If Node.js is NOT found:** Stop and tell the user:

```
Node.js isn't installed yet. Here's how to get it:

1. Open your web browser and go to https://nodejs.org
2. Click the big green button that says "LTS" (Long Term Support)
3. Run the installer that downloads -- click Next through each step, the defaults are fine
4. When it's done, close this terminal window completely and open a new one
5. Come back to this folder and run `claude` again, then say "setup my environment"

The installer takes about 2 minutes. I'll be here when you get back.
```

Do NOT proceed until Node.js is available.

## Step 3: Install dependencies

```bash
npm install
```

If this fails, read the error output. Common issues:
- **Permission errors on Windows:** Suggest running the terminal as Administrator
- **Network errors:** Ask if they're connected to the internet
- **Other errors:** Show the error and ask them to send a screenshot to Dave

## Step 4: Verify the install worked

```bash
npx expo --version 2>/dev/null
```

If Expo CLI responds with a version number, the install is good.

## Step 5: Start the dev server

```bash
npx expo start
```

Run this in the background. Then tell the user:

```
The app is starting up. You should see a QR code in the terminal.

Now let's get it on your phone:

1. On your iPhone, open the App Store and search for "Expo Go" -- install it (it's free)
2. Make sure your phone is on the same WiFi network as this computer
3. Open your phone's Camera app and point it at the QR code in the terminal
4. Tap the notification that pops up -- it'll open the app in Expo Go

The first load takes 30-60 seconds while it builds. You'll see a loading bar.

If the QR code doesn't work:
- Make sure phone and computer are on the same WiFi
- Try typing 's' in this terminal to switch to a different connection mode
- If all else fails, open the app in your browser at http://localhost:8081 (gestures won't feel the same but you can still test the flow)
```

## Step 6: Confirm the app loaded

Ask the user: "Can you see the app on your phone? You should see a dark screen with warm amber colors, a small red panda at the bottom, and some fog."

**If yes:** Tell them setup is complete and they can start testing:

```
You're all set. To start the testing walkthrough, type:

@TESTING-GUIDE.md
```

**If no:** Troubleshoot:
- "Do you see a loading bar?" -- Still building, wait
- "Do you see an error?" -- Ask them to read it to you or send a screenshot to Dave
- "Nothing happened when I scanned the QR code" -- WiFi mismatch, try browser fallback

## Important

- Never run commands that modify system settings or install global packages beyond what's needed
- If anything looks wrong or unfamiliar, stop and ask the user to contact Dave
- Keep your language warm and patient -- this person is not a developer and that's completely fine

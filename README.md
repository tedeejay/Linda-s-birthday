# 💜 Baby’s Birthday — a little magical world

A five-page romantic birthday website (countdown → letter → memories → reasons → surprise).
Plain HTML, CSS and JavaScript — no build step, no installs, free to host.

## What’s inside

```
baby-birthday/
├── index.html            ← the page structure (you rarely need to touch this)
├── netlify.toml          ← hosting settings for Netlify
├── manifest.webmanifest  ← makes it installable as an app (name, colours, icons)
├── sw.js                 ← lets the app open offline
├── css/
│   └── style.css         ← colours, fonts, animations
├── js/
│   ├── config.js         ← ✎ EDIT THIS: letter, captions, photos, reasons, date, music
│   └── app.js            ← the logic (navigation, countdown, cake, confetti…)
└── assets/
    ├── icons/            ← app icons, made from photo-5.jpg
    ├── images/           ← put her photos here (her photos are already in here)
    └── audio/
        └── music.mp3     ← placeholder music box tune — replace with your song
```

## Customising (everything is in `js/config.js`)

| I want to change… | Edit this in `config.js` |
| --- | --- |
| What you call her (shown big on pages 1 and 5) | `name` |
| Countdown date | `birthday` — keep the format `2026-11-28T00:00:00+03:00`. The `+03:00` is the timezone; change it if she lives elsewhere. |
| The birthday letter | `letter` (greeting, paragraphs, closing, signature) |
| Photos and captions | `photos` — add, remove or reorder lines |
| The five reason cards | `reasons` (icon, title, text) |
| Final message after the cake | `finalMessage` |
| Music volume | `musicVolume` (0 to 1) |
| Passcode on page 1 | `passcode` (currently `1920`) |
| Start music automatically after the passcode | `startMusicOnBegin: true` |

### Adding her real photos
1. Copy the pictures into `assets/images/` (e.g. `us-1.jpg`).
2. In `config.js`, change each `src`, e.g. `src: "assets/images/us-1.jpg"`, and write a caption.
3. Tip: resize photos to about 1200 px wide (or use a free tool like squoosh.app) so the site loads fast on mobile data.
4. Square-ish photos look best; others are cropped to a square in the frames and shown in full in the lightbox.

### Changing the music
Replace `assets/audio/music.mp3` with your own song, **keeping the same file name**
(or change `music:` in `config.js`). The included file is a short, gentle music-box tune I
generated as a placeholder. Use a song you have the right to share if you publish the site publicly.
Music never plays on its own — she presses the **Play music** button, and it keeps playing on every page.

## Test it on your computer
Just double-click `index.html`. For the most accurate preview (and to test on your phone over Wi-Fi):

```bash
cd baby-birthday
python3 -m http.server 8000
# open http://localhost:8000
```

Tip: to preview the end of the experience before the birthday, temporarily set `birthday` in
`config.js` to a past date, then change it back.

## Put it online for free with Netlify

### Option A — Drag and drop (easiest, ~2 minutes)
1. Create a free account at **https://app.netlify.com** (sign up with email, Google or GitHub).
2. Go to **https://app.netlify.com/drop**.
3. Drag the whole **`baby-birthday` folder** (the folder itself, with `index.html` inside) onto the page.
4. Netlify gives you a link like `random-name-123.netlify.app`. Open it on your phone to test.
5. **Site configuration → Change site name** to something sweet, e.g. `baby-birthday.netlify.app`.
6. To update later: open the site in Netlify → **Deploys** → drag the updated folder onto the deploy area.

### Option B — GitHub + Netlify (auto-updates)
1. Upload the folder to a new GitHub repository.
2. In Netlify: **Add new site → Import an existing project → GitHub**, choose the repo.
3. Leave the build command empty and set the publish directory to `.` (already set by `netlify.toml`).
4. Every time you push a change, the site updates itself.

### Option C — Netlify CLI
```bash
npm install -g netlify-cli
cd baby-birthday
netlify login
netlify deploy --prod --dir=.
```

### Before you send her the link
- Open it on a phone **and** a desktop; tap through all 5 pages and the music button.
- Check the countdown shows the right number of days.
- Make sure every photo opens in the lightbox and the captions read well.
- Send the link at the right moment — the surprise works best when she opens it herself. 💜

## Good to know
- **Fonts** (Great Vibes, Cormorant Garamond, Caveat) load from Google Fonts. Without internet the site falls back to elegant system fonts.
- **Navigation**: every page has Back/Next buttons, and the phone/browser back button works too. Refreshing always returns to page 1.
- **Reduced motion**: if her device has “reduce motion” turned on, floating hearts and heavy animation are switched off automatically.
- **Restart**: the button on the last page resets everything (letter, cards, cake) for another go.

## Passcode, music and the app
- **Passcode:** page 1 shows the countdown and asks for a 4-digit code (`passcode` in `config.js`, set to 1920). Give it to her on the day. It is a sweet lock, not real security: anyone who views the page source could find it.
- **Auto music:** browsers never allow sound before a tap, so the song starts the moment she unlocks with the passcode. She can pause it with the music button.
- **Install as an app:** once the site is live on https, she can add it to her home screen. Android/Chrome: menu → *Install app*. iPhone/Safari: Share → *Add to Home Screen*. The icon is cropped from `photo-5.jpg`; to change it, replace the files in `assets/icons/`.
- **After you update the site,** open it once online so the app picks up the changes. If something looks stale, change `VERSION` in `sw.js`.

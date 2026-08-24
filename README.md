# ഓണം വേണോ? — Onam Veno?

A mobile-first site that asks the group one question: **do we want an Onam
programme this year?**

Voting is three taps: **pick your name → tap വേണം or വേണ്ട → Vote.**

Votes are stored in a plain JSON file on the machine running the site. No
database to install, nothing to sign up for.

---

## Who sees what

This is the important part of the design.

| | Voters | Organisers |
|---|---|---|
| The counts (വേണം vs വേണ്ട) | ✅ | ✅ |
| How many have voted, how many are left | ✅ | ✅ |
| **Which person voted which way** | ❌ | ✅ |
| Who has not voted yet, by name | ✅ (it is the dropdown) | ✅ |

- `/` — vote
- `/results` — **public.** Counts and turnout. No passcode, no names.
- `/admin` — **passcode.** Who voted, what they picked, who is still missing.

A name disappears from the dropdown once it has been used, so the remaining
names are visible to anyone opening the site. That reveals *who* has voted, but
never *what* they voted — picking a used name only says "that name has already
voted".

The public results endpoint never receives voter names at all — they are not
hidden by CSS, they are simply not in the response. The names only leave the
server through `/api/admin`, which checks the passcode first.

---

## Run it

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

### Letting everyone join from their phones

`npm run dev` is only reachable from your own machine. To open it to phones on
the same wifi:

```bash
npm run lan
```

Then find your machine's address and share it.

- **Windows:** run `ipconfig`, look for `IPv4 Address` (e.g. `192.168.1.51`)
- **macOS/Linux:** run `ipconfig getifaddr en0` or `hostname -I`

Everyone visits `http://192.168.1.51:3000` (substitute your own address). Keep
the terminal window open — closing it stops the site.

> Windows may show a firewall prompt the first time. Allow access on **private
> networks**, or phones will not be able to connect.

For the real thing, build once and run the faster production server:

```bash
npm run build
npm start
```

---

## Put your own people in it

**Everything you need to change is in [`src/config/event.js`](src/config/event.js).**

### 1. The member list

```js
members: [
  "Rashad", "Tasmiya", "Nhad", "Fahim", "Nishma", "Nafiya", "Kuthubu",
  "Nishad", "RivinJas", "Hanna", "Jamshi", "Rakeeka", "Lidhiya",
],
```

This is the whole voter roll. People pick their name from this dropdown — they
cannot type a new one, and the server rejects any name that is not on the list.
So **this list must be accurate before you share the link.**

It is also what "9 of 13 people have voted" counts against.

Names are matched ignoring case and extra spaces, so `anjali  MENON` and
`Anjali Menon` are the same person and cannot both vote.

### 2. The question

```js
poll: {
  id: "onam-veno-2026",
  question: "Should we have an Onam programme this year?",
  malayalamQuestion: "ഈ വർഷം ഓണാഘോഷം വേണോ?",
  options: [ ... ],
}
```

### 3. The answers

```js
{
  id: "venam",
  emoji: "🌸",
  tone: "yes",              // "yes" = green bar, "no" = amber bar
  malayalamLabel: "വേണം",
  label: "Yes, we want it",
  tagline: "Pookalam, sadya, the whole thing.",
}
```

Two answers is the usual thing, but you can add a third or fourth — the layout
and the counting both handle it. Give any extra option a `tone` of `"yes"`,
`"no"`, or leave `tone` off for a neutral amber bar.

**Do not change an option's `id` after voting starts** — the id is what gets
saved, so old votes would stop matching.

### 4. Starting over

Changing `poll.id` starts a completely fresh vote. Old votes stay in the file
but stop counting, because they are filed under the old id. To wipe them
properly, use **Clear all votes** on `/admin`.

---

## The organisers' page

Visit `/admin` and enter the passcode. Set it in `.env.local`:

```
ADMIN_PASSCODE=your-passcode-here
```

`.env.local` is gitignored, so the real passcode stays on your machine.
Changing it needs a **server restart** — Next.js reads env vars at startup,
unlike `event.js`, which applies the moment you save.

You get:

- the same counts everyone sees
- **Who voted** — each person, what they picked, and the time
- **Still to vote** — the names to go and chase
- **Clear all votes** — use this once after testing, so the real vote starts at zero

It refreshes every 10 seconds.

---

## How one-vote-per-person works

Two layers:

1. **The server** keeps one vote per person. This is the real guard — a second
   attempt gets a friendly "you already voted" screen showing what they picked,
   no matter which phone or browser they use.
2. **The phone** remembers the vote in `localStorage`, so a refresh shows the
   confirmation again instead of a fresh blank ballot.

Because voters must pick from the member list, nobody can invent a name or vote
twice under a different spelling. Check `/admin` — every voter appears exactly
once.

The confirmation screen has a **"Not you? Vote as someone else"** link, so one
shared phone can be passed around a table.

---

## Where the votes live

`data/votes.json`, created on the first vote:

```json
{
  "votes": [
    {
      "id": "3f2b...",
      "voter": "Sandra Joseph",
      "voterKey": "sandra joseph",
      "pollId": "onam-veno-2026",
      "optionId": "venam",
      "at": "2026-08-24T08:41:11.402Z"
    }
  ]
}
```

- Survives restarts and refreshes.
- Back it up by copying the file.
- Simultaneous votes are queued, so two people tapping Vote at the same instant
  cannot overwrite each other.
- The file is gitignored, so test votes never get committed.

To reset by hand, stop the site and delete `data/votes.json`.

> **Note on hosting:** this works because the site runs on one machine with a
> real filesystem — a laptop at home, or a normal VPS. Serverless hosts (Vercel,
> Netlify) give each request a throwaway filesystem, so votes would vanish. If
> you must deploy there, replace `src/lib/store.js` with a small database;
> nothing else in the app needs to change.

---

## Files

```
src/
  config/event.js         ← the only file you edit: members, question, answers
  lib/store.js            ← reads/writes data/votes.json
  lib/admin.js            ← checks the results passcode
  components/
    VoteBooth.jsx         ← name → answer → vote → confirmation
    ResultBars.jsx        ← the count bars (counts only, never names)
    ResultsBoard.jsx      ← public result page
    AdminBoard.jsx        ← passcode gate + who voted what
    Maveli.jsx            ← the animated Maveli, drawn as SVG
    Backdrop.jsx          ← drifting light, pookalams, falling petals
    Burst.jsx             ← petal burst on the confirmation
    Pookalam.jsx          ← the flower, drawn as SVG
  app/
    page.js               ← voting page
    results/page.js       ← public result
    admin/page.js         ← organisers
    globals.css           ← all styling; colours are tokens at the top
    api/vote/             ← records a vote
    api/results/          ← public counts, no names
    api/admin/            ← voter detail + clearing, passcode required
data/votes.json           ← created on first vote
.env.local                ← ADMIN_PASSCODE
```

Restyling is one place: the `:root` block at the top of `globals.css` holds
every colour, with a dark-mode block underneath that follows the phone's own
setting.

### Swapping the Maveli photo and video

Our Maveli appears twice: the **photo** in a gold medallion at the top of every
page, and the **video** that plays on the confirmation screen after you vote.

Both live in `public/`. To change them, replace these files and keep the names:

| File | What it is | Notes |
|---|---|---|
| `public/maveli.webp` | the round portrait | square, ~900×900 |
| `public/maveli.mp4` | the celebration clip | 16:9, silent, loops |
| `public/maveli-poster.webp` | first frame of the clip | 16:9, shown while it loads |
| `public/maveli-full.webp` | the whole scene | used as the link preview |

The originals are in `media-original/`, which is gitignored so the 8 MB source
photo never gets committed. The copies in `public/` were shrunk from it — the
photo went from **8 MB to 158 KB**, which matters a lot when fifteen people
open the site on venue wifi at once.

To regenerate them after dropping in a new original:

```bash
node -e "
const sharp=require('sharp'), src='media-original/maveli-original.png';
sharp(src).extract({left:268,top:0,width:1780,height:1780}).resize(900,900).webp({quality:86}).toFile('public/maveli.webp');
sharp(src).resize(1400,1400).webp({quality:82}).toFile('public/maveli-full.webp');
sharp(src).extract({left:0,top:250,width:2048,height:1152}).resize(1280,720).webp({quality:80}).toFile('public/maveli-poster.webp');
"
```

Adjust the `extract` numbers to re-crop — they are pixel coordinates into the
original, and the first one is what centres his face in the round medallion.

The video is muted and loops, because phones only allow autoplay when there is
no sound. Anyone with **Reduce Motion** on gets the poster frame and a play
button instead of an autoplaying clip.

### Built for phones

Everyone votes on a phone, so the phone layout is the real one and the desktop
layout is the afterthought.

- **The whole ballot is one screen, with nothing to scroll.** The footer link
  stands down on phones and the padding under the form is gone, because
  scrolling to reach the Vote button is poor UX when the ballot is this short.
- **Both answers sit side by side, never stacked.** Stacked, the second answer
  fell below the fold on every phone tested — which quietly favours whichever
  one is on top. Side by side they start at the same height and get the same
  weight.
- **The whole ballot fits one screen.** Name picker, question and both answers
  are above the fold on an iPhone SE (375×667), the smallest phone worth
  worrying about.
- **The Vote button is fixed to the bottom**, so it is under the thumb at any
  scroll position. It used to be `sticky`, which does nothing when the element
  is its parent's last child — the button ended up off the bottom of a small
  screen.
- **Short screens get a trim.** Under 720px tall, the taglines and the English
  restatement of the title are hidden. They are flavour, not instruction, and
  dropping them is what buys room for the answers.
- **Inputs are 16px**, below which iOS Safari zooms the page on focus.
- **Notches are handled** via `viewport-fit=cover` and `env(safe-area-inset-*)`,
  so the Vote button clears the home indicator.
- **The backdrop costs less on phones.** Below 560px the two large pookalams
  stop turning and half the petals stand down — continuously rotating big SVGs
  is the most expensive thing on the page for a mid-range phone.

### The graphics

Everything is CSS and inline SVG - no image files, no animation library, so
there is nothing extra to download and it stays sharp on any screen.

- **The medallion and clip** are framed with a gold ring. The round one turns
  slowly; the rectangular one does not, because rotating a rounded rectangle
  swings its corners out across the page.
- **`Maveli.jsx`** is a Maveli drawn in SVG, from before the real photo went
  in. It is no longer used, but it is kept as a fallback — put
  `<Maveli uid="hero" />` back in `app/page.js` if you ever want the site to
  work with no photo at all. If you use two at once, give each a different
  `uid`: SVG gradient ids are document-global and they would clash.
- **The backdrop** (`Backdrop.jsx`) sits behind every page: slow drifting warm
  light, two turning pookalams, and falling petals. To calm it down, drop
  entries from the `PETALS` list or lower `.backdrop__mandala { opacity }`.
- **Cards** are frosted glass with a gold gradient hairline. On a browser
  without `backdrop-filter` they fall back to a solid cream panel.

If you put two Maveli on one page, give each a different `uid` prop. SVG
gradient ids are document-global, so sharing one would break the second.

Anyone whose phone is set to **Reduce Motion** gets a completely still page -
no petals, no floating, no shimmer. The voting flow is identical either way.

---

## Troubleshooting

**Phones cannot reach the site.** Use `npm run lan`, not `npm run dev`. Check
the firewall prompt was allowed, and that phones are on the same wifi (not
guest wifi, which usually blocks device-to-device traffic).

**Someone's name is missing from the dropdown.** Add it to `members` in
`src/config/event.js`. In `npm run dev` the change applies as soon as you save;
under `npm start` you need to `npm run build && npm start` again.

**Fonts look plain.** The Malayalam and display fonts load from Google Fonts. If
there is no internet the page falls back to system fonts and still works —
Malayalam still renders correctly.

**Someone voted by mistake.** Stop the site, open `data/votes.json`, delete that
one entry from the `votes` array, save, start again. Or clear everything from
`/admin` and re-run the vote.

**"This vote has closed."** Their page is stale, usually because `poll.id`
changed. They refresh.

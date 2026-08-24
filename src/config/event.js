// ============================================================================
//  THE ONLY FILE YOU NEED TO EDIT FOR YOUR EVENT
//  Replace the sample names below with your real member list.
// ============================================================================

export const event = {
  // ---- Header text -------------------------------------------------------
  title: "Onam Veno?",
  malayalamTitle: "ഓണം വേണോ?",
  tagline: "One question. Everyone decides together.",
  year: "2026",

  // ---- Who is allowed to vote --------------------------------------------
  // Voters pick their name from this list - they cannot type a new one.
  // Anyone not on this list is turned away, so keep it accurate.
  members: [
    "Rashad",
    "Tasmiya",
    "Nhad",
    "Fahim",
    "Nishma",
    "Nafiya",
    "Kuthubu",
    "Nishad",
    "RivinJas",
    "Hanna",
    "Jamshi",
    "Rakeeka",
    "Lidhiya",
  ],

  // ---- The question ------------------------------------------------------
  poll: {
    // Change this id only if you want to start a completely fresh vote.
    // Old votes are stored against the old id, so they stop counting.
    id: "onam-veno-2026",

    question: "Should we have an Onam programme this year?",
    malayalamQuestion: "ഈ വർഷം ഓണാഘോഷം വേണോ?",
    note: "Pick your name, tap your answer. That is it.",

    // Two options is the usual thing, but you can add more.
    options: [
      {
        id: "venam",
        emoji: "🌸",
        tone: "yes", // "yes" shows green on the result bars, "no" shows amber
        malayalamLabel: "വേണം",
        label: "Yes, we want it",
        tagline: "Pookalam, sadya, the whole thing.",
      },
      {
        id: "venda",
        emoji: "🍃",
        tone: "no",
        malayalamLabel: "വേണ്ട",
        label: "No, skip it",
        tagline: "Maybe next year instead.",
      },
    ],
  },
};

// --- helpers (no need to edit below) ---------------------------------------

export function getPoll() {
  return event.poll;
}

export function normalizeName(name) {
  return String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** The roster spelling of a name, or null when the name is not a member. */
export function findMember(name) {
  const key = normalizeName(name);
  return event.members.find((m) => normalizeName(m) === key) || null;
}

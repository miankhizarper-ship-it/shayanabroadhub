import { unsplash, photos } from "../../src/utils/images.js";


/**
 * Journal fixtures — 8 sample articles with structured content
 * blocks. Since Phase 4 the public journal is served by the API;
 * this file remains the source dataset for the demo seed
 * (server/scripts/seedDemo.js converts blocks → markdown).
 */

export const blogCategories = ["Strategy", "Editorial", "Brand", "Career"];

const author = {
  name: "Shayan",
  role: "Principal Consultant",
  initials: "S",
};

export const blogPosts = [
  {
    slug: "the-clarity-audit",
    title: "The Clarity Audit: a one-page map of where you actually are",
    category: "Strategy",
    excerpt:
      "Most strategy work fails before it starts because the starting point is fuzzy. The Clarity Audit is the one-page exercise I run with every new client — and the one you can run on yourself tonight.",
    cover: unsplash("photo-1454165804606-c3d57bc86b40", { w: 1600, h: 900 }),
    alt: "Fountain pen resting on printed charts and planning notes",
    author,
    date: "2026-09-18",
    readingTime: 7,
    featured: true,
    content: [
      {
        type: "p",
        text: "Every engagement I take on begins with the same ritual. Before frameworks, before roadmaps, before any advice at all, we spend ninety minutes drawing a map of the present. Not the ambitions — those are usually vivid — but the present, which is almost always a blur. I call it the Clarity Audit, and it has quietly become the most valuable thing I do.",
      },
      {
        type: "p",
        text: "The premise is simple: you cannot choose a route until you admit where you are. Teams that skip this step don't move faster; they move in circles with more confidence.",
      },
      { type: "h2", text: "The four quadrants" },
      {
        type: "p",
        text: "Take a single page and divide it into four. In the first quadrant, write what is true about your position — customers, cash, energy, reputation. No spin; if you wouldn't say it to your board, it doesn't belong. In the second, list what is working well enough that you should be careful not to break it. In the third, the things you are pretending not to see. The fourth is for constraints you did not choose — the ones that will still be there no matter what the plan says.",
      },
      {
        type: "quote",
        text: "Strategy is not choosing a future. It is choosing which truths to build on.",
      },
      {
        type: "p",
        text: "The magic of the audit is not analytical — it is honest. When a founder writes 'our best customers all came from one channel we no longer like' in their own handwriting, the conversation changes. Advice becomes possible because the ground is finally level.",
      },
      { type: "h2", text: "Running it on yourself" },
      {
        type: "list",
        items: [
          "Set a 45-minute timer and forbid editing while writing.",
          "Write in full sentences — bullet points hide qualifiers, and qualifiers are where the truth lives.",
          "Mark every item in the third quadrant with the cost of ignoring it for six more months.",
          "Close the page, sleep on it, then read it aloud to one person you trust.",
        ],
      },
      {
        type: "p",
        text: "If the exercise produces discomfort, it is working. Clarity rarely feels like relief in the first hour; it feels like standing on solid ground for the first time after months of walking on weather.",
      },
      {
        type: "p",
        text: "In the next essay I'll share how we turn the finished audit into a ninety-day plan — the bridge between seeing clearly and moving deliberately.",
      },
    ],
  },
  {
    slug: "write-before-you-build",
    title: "Write before you build: words are the cheapest prototype",
    category: "Editorial",
    excerpt:
      "A landing page takes a week and a rewrite takes a month. A paragraph takes ten minutes and exposes every flaw in the idea. Writing is not documentation — it is simulation.",
    cover: unsplash("photo-1486312338219-ce68d2c6f44d", { w: 1600, h: 900 }),
    alt: "Hands typing on a laptop in warm window light",
    author,
    date: "2026-08-27",
    readingTime: 6,
    featured: true,
    content: [
      {
        type: "p",
        text: "There is a moment in every project where the team is about to build something — a product, a feature, a company — and nobody can say precisely what it is. The instinct is to start anyway. Code, decks, budgets: motion feels like progress. My standing advice in that moment is unglamorous and unshakable: write it down first.",
      },
      { type: "h2", text: "Why words cut deepest" },
      {
        type: "p",
        text: "Writing is the only medium that refuses to be vague. A design can hide a missing strategy behind taste; a prototype can hide a missing use case behind polish. But a paragraph that says who this is for, what it does, and why anyone should care — that paragraph either holds together or it doesn't. There is nowhere to stand.",
      },
      {
        type: "quote",
        text: "If the idea cannot survive a paragraph, it will not survive a market.",
      },
      { type: "h2", text: "The three-paragraph prototype" },
      {
        type: "p",
        text: "Before any significant build, I ask clients for three paragraphs. First: the promise — what becomes true for the user after this exists. Second: the mechanism — how it works, in plain words, no features list. Third: the refusal — what this deliberately does not do. The third paragraph is where most projects are saved, because it forces the team to choose.",
      },
      {
        type: "list",
        items: [
          "Keep it under 300 words; length is where fuzziness goes to hide.",
          "Read it to someone outside the team and note the first question they ask.",
          "If the third paragraph lists more than three refusals, the idea is three ideas.",
          "Rewrite once, then decide whether to build.",
        ],
      },
      {
        type: "p",
        text: "Ten minutes of writing has killed more bad projects in my practice than any amount of analysis. That is not a loss — that is the cheapest win available anywhere in the work.",
      },
    ],
  },
  {
    slug: "positioning-is-a-promise",
    title: "Positioning is a promise you keep in public",
    category: "Brand",
    excerpt:
      "Forget the workshop wall covered in adjectives. Positioning is one sentence, said out loud, that makes a specific promise — and then the years-long discipline of keeping it.",
    cover: unsplash("photo-1553877522-43269d4ea984", { w: 1600, h: 900 }),
    alt: "Two colleagues sketching a positioning map on a whiteboard",
    author,
    date: "2026-08-05",
    readingTime: 6,
    featured: true,
    content: [
      {
        type: "p",
        text: "I have sat through enough positioning workshops to furnish a small office with the sticky notes they produce. Piles of adjectives — bold, trustworthy, innovative — that dissolve the moment someone has to write a homepage. The failure is not in the effort; it is in the definition. Positioning is not how you are perceived. Positioning is a promise, made in public, about what you will repeatedly do for a specific someone.",
      },
      { type: "h2", text: "The anatomy of a keepable promise" },
      {
        type: "p",
        text: "A promise has three parts: a who narrow enough to picture, an outcome concrete enough to verify, and a cost you are genuinely willing to pay — because every promise excludes something, and the exclusion is what makes it credible.",
      },
      {
        type: "list",
        items: [
          "Who: 'series-B fintech founders' beats 'businesses', always.",
          "Outcome: 'cut churn reviews from weeks to hours' can be true or false.",
          "Cost: name what you turn away, or the promise is just mood.",
        ],
      },
      {
        type: "quote",
        text: "A position nobody can reject is a position nobody can remember.",
      },
      { type: "h2", text: "Keeping it in public" },
      {
        type: "p",
        text: "The test of positioning is not the launch — it is month eighteen. Does your blog still argue for the same person? Did the tempting detour project get declined, visibly, with a reason attached? Keeping a promise in public is what compounds; everything else is campaign noise wearing a strategy costume.",
      },
      {
        type: "p",
        text: "When we do positioning work with clients, the deliverable is never a wall of adjectives. It is one sentence, three refusals, and a calendar — the promise, the boundaries, and the places it will be kept.",
      },
    ],
  },
  {
    slug: "two-list-method-saying-no",
    title: "The two-list method for saying no gracefully",
    category: "Strategy",
    excerpt:
      "A practical refusal script for founders drowning in 'quick calls' — the two lists that make every no feel like service instead of rejection.",
    cover: unsplash("photo-1484480974693-6ca0a78fb36b", { w: 1600, h: 900 }),
    alt: "Weekly planner and watch arranged on a clean desk",
    author,
    date: "2026-07-14",
    readingTime: 5,
    content: [
      {
        type: "p",
        text: "The most valuable sentence in a consultant's calendar is a well-made no. The hardest one too — because the requests rarely arrive as burdens. They arrive as flattery: a quick call, a tiny review, a small favour from someone you genuinely like. The two-list method turns that fog into a decision you can defend in thirty seconds.",
      },
      { type: "h2", text: "List one: the agenda test" },
      {
        type: "p",
        text: "Before answering any request, write the single item it would advance on your current agenda. If you cannot name the item in one phrase, the request is not small — it is unmoored, and unmoored requests are how quarters disappear. This list is short by design.",
      },
      { type: "h2", text: "List two: the honest referral" },
      {
        type: "p",
        text: "Most nos fail because they stop at refusal. The second list is what you offer instead: the person, the resource, or the later date that would actually serve them. A no with a referral is a gift; a bare no is just a closed door with your name on it.",
      },
      {
        type: "quote",
        text: "Say no to the request, yes to the person — on paper, every time.",
      },
      {
        type: "p",
        text: "Run both lists for a month and something strange happens: people start bringing you better requests. The two lists do not just protect your time; they quietly retrain your network on what you are actually for.",
      },
    ],
  },
  {
    slug: "what-editors-know",
    title: "What editors know that founders forget",
    category: "Editorial",
    excerpt:
      "Newsrooms solved the attention economy a century ago. Four editorial habits — desk, budget, kill, slot — that translate straight to running a business.",
    cover: unsplash("photo-1455390582262-044cdead277a", { w: 1600, h: 900 }),
    alt: "A vintage typewriter with a page mid-sentence",
    author,
    date: "2026-06-23",
    readingTime: 5,
    content: [
      {
        type: "p",
        text: "Before I did strategy work, I sat in rooms where grown professionals argued over a single headline for forty minutes. It looked like perfectionism. It was actually resource allocation at the sentence level — and there are four editorial habits I have never found a better version of, in any industry.",
      },
      { type: "h2", text: "The desk, the budget, the kill, the slot" },
      {
        type: "p",
        text: "The desk is the standing meeting where work is judged in public — no decks, no pre-alignment, just the work. The budget is the explicit limit on attention: one flagship essay a month, not four half-hearted ones. The kill is the named power to stop something, held by someone whose only job that day is judgment. And the slot is the fixed place where finished things land, on time, whether or not they feel perfect.",
      },
      {
        type: "quote",
        text: "Deadlines are not pressure. Deadlines are kindness to the unfinished.",
      },
      {
        type: "p",
        text: "Founders copy newsroom urgency and skip newsroom structure — all-nighters without desks, launches without kills. Borrow the structure instead. A team with a desk, a budget, a kill and a slot ships with the calm of people who know that quality is a schedule, not a mood.",
      },
    ],
  },
  {
    slug: "quiet-brand-beats-loud",
    title: "A quiet brand beats a loud one",
    category: "Brand",
    excerpt:
      "Volume is a rental; consistency is ownership. On restraint, taste, and why the most confident brands in any industry are the least excitable.",
    cover: unsplash("photo-1471107340929-a87cd0f5b5f3", { w: 1600, h: 900 }),
    alt: "A minimal desk with a book, tea and soft morning light",
    author,
    date: "2026-05-29",
    readingTime: 4,
    content: [
      {
        type: "p",
        text: "Every industry has its loud brand — the launch countdowns, the superlatives, the exclamation points doing load-bearing work. And every industry has the one whose emails you actually open. The difference is rarely budget. It is the decision to spend attention like it is theirs, not yours.",
      },
      {
        type: "quote",
        text: "Loudness rents attention. Quietness earns it back, with interest.",
      },
      { type: "h2", text: "Three quiet moves" },
      {
        type: "list",
        items: [
          "Say the specific thing: numbers and nouns, not adjectives and vibes.",
          "Repeat yourself on purpose: familiarity is a feature of trust, not a bug of creativity.",
          "Leave space: restraint in design and copy signals confidence louder than any claim.",
        ],
      },
      {
        type: "p",
        text: "None of this is minimalism as an aesthetic. It is minimalism as a budget: fewer words, kept promises, and the long compounding of being easy to believe.",
      },
    ],
  },
  {
    slug: "portfolio-career",
    title: "The portfolio career: stitching gigs into a ground",
    category: "Career",
    excerpt:
      "Advisory Mondays, writing Wednesdays, teaching Fridays — the portfolio career is not a hedge against commitment. Done well, it is a commitment with better oxygen.",
    cover: unsplash("photo-1543269865-cbf427effbad", { w: 1600, h: 900 }),
    alt: "A small team working around laptops in a bright studio",
    author,
    date: "2026-04-30",
    readingTime: 6,
    content: [
      {
        type: "p",
        text: "The questions arrive in the same envelope, whether from a mid-career operator or a graduating designer: is it safe to not choose one thing? My answer surprises people — I don't think the portfolio career is a refusal to commit. It is a commitment to a body of work instead of a job title, and it needs more discipline, not less.",
      },
      { type: "h2", text: "Ground, not collection" },
      {
        type: "p",
        text: "The failure mode of many-hatted careers is the collection: gigs that relate only by appearing on one invoice. The fix is a ground — one sentence about what all the work serves. 'I help technical teams become understood' can hold consulting, teaching and writing without fraying. Without it, every opportunity is equally tempting and equally hollowing.",
      },
      {
        type: "list",
        items: [
          "Write the ground sentence; test every offer against it.",
          "Give each strand a rhythm — a day, a season, a quota — so none lives on leftovers.",
          "Publish from the intersections; that is where a portfolio compounds.",
          "Re-audit yearly: keep, raise, or retire.",
        ],
      },
      {
        type: "quote",
        text: "A portfolio career is a sentence first and a schedule second.",
      },
      {
        type: "p",
        text: "Oxygen is the point: the teaching keeps the consulting honest, the writing keeps the thinking sharp, the consulting keeps everything else tethered to reality. That is not a hedge. That is a system.",
      },
    ],
  },
  {
    slug: "mentorship-is-a-mirror",
    title: "Mentorship is a mirror, not a map",
    category: "Career",
    excerpt:
      "The best mentors don't hand you routes. They hand you a reflection sharp enough that your own next step becomes obvious — and slightly terrifying.",
    cover: unsplash("photo-1542435503-956c469947f6", { w: 1600, h: 900 }),
    alt: "Two professionals in conversation over coffee",
    author,
    date: "2026-03-19",
    readingTime: 4,
    content: [
      {
        type: "p",
        text: "There is a persistent myth that a great mentor hands you a map: their route, slightly updated for your weather. In fifteen years of being mentored and mentoring, I have never seen a map work. What I have seen work, every time, is a mirror.",
      },
      {
        type: "p",
        text: "A mirror-mentor does three things. They reflect your patterns until you can't unsee them — the way you stall, the way you hedge, the way you light up. They hold your stated ambition next to your actual calendar, gently, without blinking. And they refuse to decide for you, which is the entire gift: a decision you were talked into is a decision you will abandon.",
      },
      {
        type: "quote",
        text: "Advice fades in a week. An accurate reflection reorganises a decade.",
      },
      {
        type: "p",
        text: "If you are looking for a mentor, look for someone who asks better questions, not someone with a louder answer. If you are asked to be one, resist the map. The mirror is slower, less flattering, and the only thing that actually holds.",
      },
    ],
  },
];

/** Featured posts, in display order. */
export const featuredPosts = blogPosts.filter((post) => post.featured);

/** Find a single post by slug (future: GET /api/blogs/:slug). */
export function getPostBySlug(slug) {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}

/** Related posts: same category first, then most recent. */
export function getRelatedPosts(post, limit = 3) {
  const sameCategory = blogPosts.filter(
    (p) => p.slug !== post.slug && p.category === post.category,
  );
  const others = blogPosts.filter(
    (p) => p.slug !== post.slug && p.category !== post.category,
  );
  return [...sameCategory, ...others].slice(0, limit);
}

/** Format an ISO date string for display, e.g. "18 Sep 2026". */
export function formatPostDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Gallery fixtures — 12 curated images. Since Phase 4 the public
 * gallery is served by the API; this file remains the source
 * dataset for the demo seed (server/scripts/seedDemo.js).
 */

export const galleryCategories = [
  "Editorial",
  "Consulting",
  "Speaking",
  "Workspace",
];

export const galleryImages = [
  {
    id: "g1",
    src: unsplash("photo-1552664730-d307ca884978", { w: 1400, h: 1000 }),
    alt: "Working session with frameworks sketched across a whiteboard",
    category: "Consulting",
    orientation: "landscape",
  },
  {
    id: "g2",
    src: unsplash("photo-1434030216411-0b793f4b4173", { w: 1200, h: 1500 }),
    alt: "Field notes being written in a battered notebook",
    category: "Editorial",
    orientation: "portrait",
  },
  {
    id: "g3",
    src: unsplash("photo-1531538606174-0f90ff5dce83", { w: 1200, h: 1500 }),
    alt: "Keynote moment — speaking with a handheld microphone",
    category: "Speaking",
    orientation: "portrait",
  },
  {
    id: "g4",
    src: unsplash("photo-1499750310107-5fef28a66643", { w: 1400, h: 1000 }),
    alt: "Morning desk with coffee, notebook and reading glasses",
    category: "Workspace",
    orientation: "landscape",
  },
  {
    id: "g5",
    src: unsplash("photo-1517245386807-bb43f82c33c4", { w: 1400, h: 1000 }),
    alt: "Advisory discussion in a quiet meeting room",
    category: "Consulting",
    orientation: "landscape",
  },
  {
    id: "g6",
    src: unsplash("photo-1507842217343-583bb7270b66", { w: 1200, h: 1500 }),
    alt: "Research among the shelves of an old library",
    category: "Editorial",
    orientation: "portrait",
  },
  {
    id: "g7",
    src: unsplash("photo-1516534775068-ba3e7458af70", { w: 1400, h: 1000 }),
    alt: "Workshop facilitator presenting to a full room",
    category: "Speaking",
    orientation: "landscape",
  },
  {
    id: "g8",
    src: unsplash("photo-1590650153855-d9e808231d41", { w: 1400, h: 1000 }),
    alt: "Flatlay of a working afternoon — laptop, coffee, annotations",
    category: "Workspace",
    orientation: "landscape",
  },
  {
    id: "g9",
    src: unsplash("photo-1600880292203-757bb62b4baf", { w: 1200, h: 1500 }),
    alt: "Consulting engagement closing handshake",
    category: "Consulting",
    orientation: "portrait",
  },
  {
    id: "g10",
    src: unsplash("photo-1551836022-d5d88e9218df", { w: 1400, h: 1000 }),
    alt: "Teaching a strategy framework to a team",
    category: "Speaking",
    orientation: "landscape",
  },
  {
    id: "g11",
    src: unsplash("photo-1488190211105-8b0e65b80b4e", { w: 1200, h: 1500 }),
    alt: "Drafting long-form essays the old way — typewriter and paper",
    category: "Workspace",
    orientation: "portrait",
  },
  {
    id: "g12",
    src: unsplash("photo-1524995997946-a1c2e315a42f", { w: 1400, h: 1000 }),
    alt: "Reference books open beside the writing desk",
    category: "Editorial",
    orientation: "landscape",
  },
];
/**
 * Download fixtures — resource library entries. Since Phase 4 the
 * public library is served by the API; this file remains the source
 * dataset for the demo seed (server/scripts/seedDemo.js points the
 * records at the generated /demo-files/ targets).
 */

export const downloadCategories = ["Templates", "Guides", "Worksheets"];

export const resources = [
  {
    id: "r1",
    title: "The Clarity Audit — One-Page Worksheet",
    description:
      "The printable companion to the flagship essay: four quadrants, honest prompts and a six-month cost marker for the things you are avoiding.",
    category: "Worksheets",
    fileType: "PDF",
    fileSize: "1.2 MB",
    fileName: "clarity-audit-worksheet.pdf",
    version: "v1.3",
  },
  {
    id: "r2",
    title: "Weekly Review Template",
    description:
      "The twenty-minute ritual behind every steady engagement — what shipped, what stalled, what gets protected next week.",
    category: "Templates",
    fileType: "PDF",
    fileSize: "0.6 MB",
    fileName: "weekly-review-template.pdf",
    version: "v2.0",
  },
  {
    id: "r3",
    title: "Positioning One-Pager Canvas",
    description:
      "Who, outcome, cost — the keepable-promise canvas from the positioning essay, with worked examples from three industries.",
    category: "Templates",
    fileType: "PDF",
    fileSize: "0.8 MB",
    fileName: "positioning-one-pager.pdf",
    version: "v1.1",
  },
  {
    id: "r4",
    title: "Editorial Calendar Starter",
    description:
      "A quarter of slots, not a year of pressure: the 13-week content map used in editorial direction engagements.",
    category: "Templates",
    fileType: "XLSX",
    fileSize: "0.3 MB",
    fileName: "editorial-calendar-starter.xlsx",
    version: "v1.4",
  },
  {
    id: "r5",
    title: "The Client Question Bank",
    description:
      "Ninety-six diagnostic questions sorted by situation — the intake bank behind the Discover step of every engagement.",
    category: "Guides",
    fileType: "PDF",
    fileSize: "1.5 MB",
    fileName: "client-question-bank.pdf",
    version: "v3.1",
  },
  {
    id: "r6",
    title: "Scope & Boundaries Email Scripts",
    description:
      "Word-for-word scripts for declining, rescheduling and re-scoping — the two-list method applied to real inboxes.",
    category: "Guides",
    fileType: "DOCX",
    fileSize: "0.4 MB",
    fileName: "scope-and-boundaries-scripts.docx",
    version: "v1.0",
  },
  {
    id: "r7",
    title: "Brand Voice Discovery Pack",
    description:
      "Five exercises that turn 'make it sound premium' into language your whole team can actually use.",
    category: "Guides",
    fileType: "ZIP",
    fileSize: "4.6 MB",
    fileName: "brand-voice-discovery-pack.zip",
    version: "v2.2",
  },
];

/** File-type styling metadata used by resource cards. */
export const fileTypeMeta = {
  PDF: { tone: "bg-bronze-100 text-bronze-800" },
  XLSX: { tone: "bg-ink/5 text-ink" },
  DOCX: { tone: "bg-ink/5 text-ink" },
  ZIP: { tone: "bg-bronze-600/10 text-bronze-800" },
};

/**
 * Services fixtures + static brand content. Since Phase 4 the
 * service catalogue is served by the API (this file feeds the demo
 * seed); `engagementSteps` and `homeMeta` remain live static brand
 * content used directly by the public pages.
 */

export const services = [
  {
    id: "one-to-one-consulting",
    icon: "Compass",
    tag: "Advisory",
    title: "One-to-One Consulting",
    tagline: "One decision, fully unraveled.",
    description:
      "Focused working sessions on the decision in front of you — scoping a launch, prioritising a roadmap, unsticking a stalemate. Come with a question; leave with a sequenced plan you can start on Monday.",
    benefits: [
      "A precise problem statement before any advice",
      "Options mapped with trade-offs, not just a recommendation",
      "Written session summary with next steps",
      "Follow-up note at 14 days to check traction",
    ],
    format: "90-minute sessions, remote",
    commitment: "Single session or short series",
  },
  {
    id: "ongoing-advisory",
    icon: "Presentation",
    tag: "Retainer",
    title: "Ongoing Advisory",
    tagline: "A second mind on the things that matter.",
    description:
      "A standing partnership for founders and team leads: regular working sessions, honest reviews of work in progress, and a steady external perspective as decisions compound.",
    benefits: [
      "Fixed weekly or bi-weekly rhythm",
      "Async access between sessions for pressing questions",
      "Quarterly strategy review with a written brief",
      "Continuity — no re-explaining your context",
    ],
    format: "Weekly or bi-weekly, remote",
    commitment: "Three-month minimum",
  },
  {
    id: "editorial-content-direction",
    icon: "Feather",
    tag: "Creative",
    title: "Editorial & Content Direction",
    tagline: "Publish with a point of view.",
    description:
      "Shape the thinking you publish: positioning, voice, and a sustainable editorial rhythm for essays, newsletters and knowledge products that actually sound like you.",
    benefits: [
      "Editorial positioning and pillar topics",
      "A voice guide your whole team can follow",
      "A 90-day content map with realistic cadence",
      "Structural edits on flagship pieces",
    ],
    format: "Project-based, with milestone reviews",
    commitment: "4–8 weeks per engagement",
  },
  {
    id: "brand-presence-guidance",
    icon: "Landmark",
    tag: "Positioning",
    title: "Brand & Presence Guidance",
    tagline: "Quiet, durable brand thinking.",
    description:
      "How you present, what you promise, and how every touchpoint reinforces the work behind it — brand guidance for people who would rather be respected than loud.",
    benefits: [
      "A positioning statement with teeth",
      "Message hierarchy for site, deck and profiles",
      "Presence audit with prioritised fixes",
      "Naming and language guidance where needed",
    ],
    format: "Audit + working sessions",
    commitment: "2–4 weeks",
  },
  {
    id: "workshops-speaking",
    icon: "Mic",
    tag: "Group",
    title: "Workshops & Speaking",
    tagline: "Thinking, out loud, together.",
    description:
      "Interactive sessions for teams and conferences on clear strategy, editorial craft and decision-making — tailored to the room, never generic slides.",
    benefits: [
      "Pre-session intake to tailor the material",
      "Working frameworks the room can use immediately",
      "Follow-up resource pack for every attendee",
      "Optional follow-on clinics for teams",
    ],
    format: "Half-day, full-day or keynote",
    commitment: "Booked per event",
  },
];

/** The four-step engagement path shown on Home and Services. */
export const engagementSteps = [
  {
    step: "01",
    title: "Discover",
    description:
      "A short, free introductory call. We map your context, constraints and what success actually looks like — and confirm the fit, both ways.",
  },
  {
    step: "02",
    title: "Frame",
    description:
      "The real problem gets defined in writing. Scope, format and rhythm are agreed — no vague mandates, no surprise invoices.",
  },
  {
    step: "03",
    title: "Act",
    description:
      "Working sessions with written follow-ups. Every meeting ends with specific, sequenced next steps that are yours to run.",
  },
  {
    step: "04",
    title: "Review",
    description:
      "We check traction at a fixed milestone, capture what worked, and decide together whether to continue, adjust or close.",
  },
];

/** Home-page portrait wiring. */
export const homeMeta = {
  portrait: unsplash(photos.portraitPrimary, { w: 900, h: 1150 }),
  portraitAlt: "Shayan, principal consultant, in a studio portrait",
};

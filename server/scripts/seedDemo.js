/**
 * Demo content seed — populates a database with the Phase 2 sample
 * content (essays, services, gallery, resources, messages, page
 * content and settings) plus the admin account.
 *
 * Two modes:
 *   1. Imported (memory-mode local dev):  seedDemoData(mongoose)
 *   2. CLI against a real database:       node server/scripts/seedDemo.js
 *
 * Demo admin credentials (LOCAL/DEMO ONLY — the CLI requires the
 * ADMIN_EMAIL/ADMIN_PASSWORD env vars instead):
 *   admin@shayanabroadhub.com / Broadhub2026
 */

import mongoose from "mongoose";
import { Admin } from "../models/Admin.js";

/* Hard guard — demo credentials must NEVER reach a production
   database, regardless of how this module is invoked. */
if (process.env.NODE_ENV === "production") {
  console.error(
    "[seed:demo] Refusing to run in production — demo credentials are development-only.",
  );
  process.exit(1);
}

import { Blog } from "../models/Blog.js";
import { Category } from "../models/Category.js";
import { Service } from "../models/Service.js";
import { Gallery } from "../models/Gallery.js";
import { Download } from "../models/Download.js";
import { Message } from "../models/Message.js";
import { Page } from "../models/Page.js";
import { Setting } from "../models/Setting.js";
import { hashPassword } from "../utils/password.js";

/* Phase 2 sample content — the exact shapes the public UI was
   built against, now flowing through the API. */
import { blogPosts, services as mockServices, galleryImages, resources as mockResources } from "./demoContent.js";

export const DEMO_ADMIN = {
  name: "Shayan",
  email: "admin@shayanabroadhub.com",
  password: "Broadhub2026",
};

/* ── structured blocks → markdown (backend stores markdown) ── */

function blocksToMarkdown(blocks) {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "h2":
          return `## ${block.text}`;
        case "quote":
          return `> ${block.text}`;
        case "list":
          return block.items.map((item) => `- ${item}`).join("\n");
        case "image":
          return `![${block.alt ?? ""}](${block.src ?? ""})`;
        default:
          return block.text ?? "";
      }
    })
    .join("\n\n");
}

const CATEGORY_NAMES = [
  "Strategy",
  "Editorial",
  "Brand",
  "Career",
  "Consulting",
  "Speaking",
  "Workspace",
  "Templates",
  "Guides",
  "Worksheets",
];

const DEMO_MESSAGES = [
  {
    name: "Amara Osei",
    email: "amara@osei.studio",
    subject: "Positioning review before our product launch",
    message:
      "Hello Shayan — we are eight weeks from launch and the team keeps rewriting the homepage. We would love a positioning review and a clear message hierarchy before we commit. Is a single working session realistic in that window?",
    status: "unread",
  },
  {
    name: "Daniel Reyes",
    email: "d.reyes@northloop.io",
    subject: "Ongoing advisory for a two-person studio",
    message:
      "We run a small product studio and decisions have started compounding faster than we can frame them. Your ongoing advisory format looks like the right fit — could we book an intro call to see whether the rhythm suits us?",
    status: "read",
  },
  {
    name: "Priya Nair",
    email: "priya@nairwrites.com",
    subject: "Editorial direction for a knowledge product",
    message:
      "I am turning two years of workshop material into a knowledge product and need help shaping the editorial spine — positioning, voice and a realistic cadence. Your editorial direction service seems built for exactly this. What does availability look like next quarter?",
    status: "archived",
  },
];

const DEFAULT_PAGES = [
  {
    slug: "home",
    title: "Home",
    sections: {
      hero: {
        title: "Clarity, counsel and a quieter kind of ambition.",
        description:
          "Personal consulting for founders, leaders and brands who would rather build something durable than something loud.",
      },
      about: {
        title: "A practice built on clear thinking",
        description:
          "Twelve years of advising across three continents — distilled into counsel that is direct, written down and built to last.",
      },
      journey: {
        title: "From first conversation to lasting traction",
        description:
          "A simple, honest engagement path — the same four steps whether we work together once or for a year.",
      },
      contactCta: {
        title: "Ready to trade noise for clarity?",
        description:
          "Consultations are by appointment and unhurried. Bring the decision that is keeping you stuck — leave with a plan.",
      },
    },
  },
  {
    slug: "about",
    title: "About",
    sections: {
      intro: {
        title: "I help people see their own situation clearly",
        description:
          "Shayan Abroad Hub is the independent practice of a strategy and editorial consultant working with a deliberately small client list.",
      },
      mission: {
        title: "Mission",
        description:
          "Turn complicated situations into decisions people can act on with confidence — and leave every client with frameworks they keep.",
      },
      vision: {
        title: "Vision",
        description:
          "A working culture where clarity, patience and honest counsel are the competitive advantage — not volume.",
      },
    },
  },
  {
    slug: "contact",
    title: "Contact",
    sections: {
      intro: {
        title: "Let's start with a conversation.",
        description:
          "Consultations are by appointment, remote-first and unhurried. Use the form, or write directly — every note is read personally.",
      },
    },
  },
];

const DEFAULT_SETTINGS = {
  siteName: "Shayan Abroad Hub",
  siteDescription:
    "Insight-led guidance, editorial thinking and practical resources for ambitious people and brands.",
  email: "hello@shayanabroadhub.com",
  phone: "",
  whatsapp: "",
  location: "Working with clients worldwide",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com" },
    { label: "Instagram", href: "https://www.instagram.com" },
    { label: "X (Twitter)", href: "https://x.com" },
  ],
  seo: {
    title: "Shayan Abroad Hub — Personal Consulting & Knowledge Hub",
    description:
      "Insight-led guidance, editorial thinking and practical resources for ambitious people and brands.",
    ogImage: "",
  },
};

/**
 * Seed the connected database with demo content.
 * Idempotent: skips collections that already contain documents
 * unless `force` clears them first.
 */
export async function seedDemoData({ force = false } = {}) {
  const counts = {
    admin: await Admin.countDocuments({}),
    categories: await Category.countDocuments({}),
    blogs: await Blog.countDocuments({}),
    services: await Service.countDocuments({}),
    gallery: await Gallery.countDocuments({}),
    downloads: await Download.countDocuments({}),
    messages: await Message.countDocuments({}),
    pages: await Page.countDocuments({}),
    settings: await Setting.countDocuments({}),
  };
  const seeded = { created: {}, skipped: {} };
  const shouldSeed = (name) => force || counts[name] === 0;
  const clear = async (model) => {
    if (force) await model.deleteMany({});
  };

  /* Admin — upsert the demo account when absent. */
  if (counts.admin === 0) {
    await Admin.create({
      name: DEMO_ADMIN.name,
      email: DEMO_ADMIN.email,
      passwordHash: await hashPassword(DEMO_ADMIN.password),
      role: "admin",
      isActive: true,
    });
    seeded.created.admin = 1;
  } else {
    seeded.skipped.admin = counts.admin;
  }

  /* Categories */
  if (shouldSeed("categories")) {
    await clear(Category);
    await Category.insertMany(
      CATEGORY_NAMES.map((name) => ({
        name,
        slug: name.toLowerCase(),
        description: "",
      })),
    );
    seeded.created.categories = CATEGORY_NAMES.length;
  } else {
    seeded.skipped.categories = counts.categories;
  }

  /* Blogs (markdown content, published with staggered dates) */
  if (shouldSeed("blogs")) {
    await clear(Blog);
    await Blog.insertMany(
      blogPosts.map((post) => ({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: blocksToMarkdown(post.content),
        coverImage: { url: post.cover, publicId: "", width: 1600, height: 900 },
        category: post.category,
        author: post.author.name,
        status: "published",
        featured: Boolean(post.featured),
        readingTime: post.readingTime,
        publishedAt: new Date(`${post.date}T09:00:00Z`),
      })),
    );
    seeded.created.blogs = blogPosts.length;
  } else {
    seeded.skipped.blogs = counts.blogs;
  }

  /* Services */
  if (shouldSeed("services")) {
    await clear(Service);
    await Service.insertMany(
      mockServices.map((service, index) => ({
        title: service.title,
        slug: service.id,
        tagline: service.tagline,
        description: service.description,
        image: null,
        benefits: service.benefits,
        format: service.format,
        commitment: service.commitment,
        icon: service.icon,
        order: index + 1,
        featured: index < 3,
        status: "published",
      })),
    );
    seeded.created.services = mockServices.length;
  } else {
    seeded.skipped.services = counts.services;
  }

  /* Gallery */
  if (shouldSeed("gallery")) {
    await clear(Gallery);
    await Gallery.insertMany(
      galleryImages.map((image, index) => ({
        title: image.alt,
        image: {
          url: image.src,
          publicId: "",
          width: image.orientation === "portrait" ? 1200 : 1400,
          height: image.orientation === "portrait" ? 1500 : 1000,
        },
        category: image.category,
        caption: "",
        order: index + 1,
      })),
    );
    seeded.created.gallery = galleryImages.length;
  } else {
    seeded.skipped.gallery = counts.gallery;
  }

  /* Downloads — files resolve to /demo-files/* shipped by the app. */
  if (shouldSeed("downloads")) {
    await clear(Download);
    await Download.insertMany(
      mockResources.map((resource, index) => ({
        title: resource.title,
        slug: resource.fileName.replace(/\.[^.]+$/, ""),
        description: resource.description,
        file: {
          url: `/demo-files/${resource.fileName}`,
          publicId: "",
          name: resource.fileName,
          bytes: 0,
        },
        coverImage: null,
        category: resource.category,
        fileType: resource.fileType,
        fileSize: resource.fileSize,
        downloadCount: (index + 1) * 7,
        status: "published",
      })),
    );
    seeded.created.downloads = mockResources.length;
  } else {
    seeded.skipped.downloads = counts.downloads;
  }

  /* Messages */
  if (shouldSeed("messages")) {
    await clear(Message);
    await Message.insertMany(DEMO_MESSAGES);
    seeded.created.messages = DEMO_MESSAGES.length;
  } else {
    seeded.skipped.messages = counts.messages;
  }

  /* Pages */
  if (shouldSeed("pages")) {
    await clear(Page);
    await Page.insertMany(DEFAULT_PAGES);
    seeded.created.pages = DEFAULT_PAGES.length;
  } else {
    seeded.skipped.pages = counts.pages;
  }

  /* Settings */
  if (shouldSeed("settings")) {
    await clear(Setting);
    await Setting.create({ key: "site", value: DEFAULT_SETTINGS });
    seeded.created.settings = 1;
  } else {
    seeded.skipped.settings = counts.settings;
  }

  return seeded;
}

/* ── CLI mode ──────────────────────────────────────────────── */

const isCli = process.argv[1]?.endsWith("seedDemo.js");

if (isCli) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";

  try {
    if (!process.env.MONGODB_URI) {
      console.error("[seed:demo] MONGODB_URI is required for CLI seeding.");
      process.exit(1);
    }
    if (email && password) {
      const passwordHash = await hashPassword(password);
      const existing = await Admin.findOne({ email });
      if (!existing) {
        await Admin.create({
          name: process.env.ADMIN_NAME ?? "Admin",
          email,
          passwordHash,
          role: "admin",
          isActive: true,
        });
      }
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    const result = await seedDemoData();
    console.log("[seed:demo] complete:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`[seed:demo] failed — ${error.name}: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

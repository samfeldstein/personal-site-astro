import { title } from "process";

export const education = [
  {
    degree: "Master of Fine Arts in Screenwriting",
    school: "Chapman University",
    city: "Orange, CA",
    date: "December 2018 (withdrew)",
  },
  {
    degree: "Bachelor of Arts in English and Creative Writing",
    school: "The University of Iowa",
    city: "Iowa City, IA",
    date: "December 2016",
  },
];

export const workHistory = {
  composition: {
    role: "Bookseller",
    employer: "Composition Bookshop",
    date: "April 2025 – Present",
    place: "Longmont, CO",
    description: [
      "Drive repeat business by offering exceptional customer service and personalized recommendations.",
      "Maintain extensive knowledge of popular genres, authors, and literary trends, ensuring tailored guidance for every customer.",
      "Build custom web applications to streamline store processes, e.g. shelf-talker templates and formatting."
    ],
  },
  devFreelance: {
    role: "Freelance Web Designer & Developer",
    date: "April 2024 – Present",
    place: "Boulder, CO",
    description: [
      "Build bespoke, high-performance websites using modern static site generators and Content Management Systems.",
      "Optimize site performance with image optimization, asset caching, component-driven design, and other strategies to achieve sub-second load times.",
      "Integrate headless content managements systems, allowing non-technical clients to update websites independently.",
    ],
  },
  devAssistant: {
    role: "Development Assistant",
    employer: "Sugar23",
    date: "November 2022 – December 2023",
    place: "Hollywood, CA (remote)",
    description: [
      "Evaluated scripts and manuscripts for potential TV/film adaptation at the production company behind hit properties like <cite>Maniac</cite> and <cite>The OA</cite>.",
      "Wrote comprehensive script coverage analyzing the story and market potential, offering adaptation recommendations that informed executive decision-making.",
    ],
  },
  journalistSentinel: {
    role: "Freelance Journalist",
    employer: "The Big Bend Sentinel",
    place: "Marfa, TX",
    date: "September 2022 – December 2023",
    description: [
      "Produced compelling local journalism covering community events and grassroots activism, developing expertise in interview techniques and deadline-driven writing.",
      "Conducted in-depth interviews with community leaders, activists, and local stakeholders to uncover compelling narratives and ensure accurate representation.",
      "Balanced journalistic integrity with narrative storytelling to create articles that were informative, engaging, and accessible.",
    ],
  },
  marfaStore: {
    role: "Ecommerce Manager",
    employer: "The Marfa Store",
    place: "Marfa, TX",
    date: "January 2022 – December 2023",
    description: [
      "Managed the Shopify storefront and inventory across 100+ SKUs, ensuring accurate stock levels, timely restocks, and a seamless online shopping experience.",
      "Handled order fulfillment, expertly packing and shipping artwork and retail goods with secure, professional-grade techniques to ensure safe delivery.",
      "Provided top-tier customer support, resolving inquiries and order issues promptly while fostering positive client relationships that enhanced brand reputation.",
    ],
  },
  managerSentinel: {
    role: "General Manager",
    employer: "The Sentinel",
    date: "November 2020 – November 2021",
    place: "Marfa, TX",
    description: [
      "Managed front-of-house operations, delivering exceptional customer service and fostering a welcoming, communal atmosphere.",
      "Led hiring efforts by crafting compelling job postings, conducting interviews, and implementing a standardized training program to ensure team consistency and efficiency.",
      "Oversaw inventory management, vendor relations, and supply ordering to ensure seamless operations.",
    ],
  },
  devSentinel: {
    role: "WordPress Developer",
    employer: "The Sentinel",
    date: "November 2020 – November 2021",
    place: "Marfa, TX",
    description: [
      "Designed, developed, and launched an online storefront using WordPress and WooCommerce, enhancing the Sentinel’s digital presence and revenue potential.",
      "Refined site architecture and user interface to create a seamless customer experience and maximize conversions.",
      "Implemented SEO strategies like keyword optimization and engaging product descriptions, boosting search visibility and driving organic traffic.",
    ],
  },
  fundraiserLear: {
    role: "Donor Engagement Specialist",
    employer: "Lear Solutions",
    date: "May 2019 – December 2019",
    place: "Santa Ana, CA",
    description: [
      "Secured a projected ~$300,000 in funding for high-impact organizations, including the ASPCA and Doctors Without Borders, through persuasive face-to-face donor engagement.",
      "Cultivated relationships with prospective donors, tailoring messaging to align with individual values and maximize long-term contributions.",
      "Implemented proven rhetorical fundraising techniques to drive high-quality, recurring donations, strengthening donor retention and organizational sustainability.",
    ],
  },
  TAChapman: {
    role: "Graduate Teaching Assistant",
    employer: "Chapman University",
    date: "January 2018 – December 2018",
    place: "Orange, CA",
    description: [
      "Facilitated classroom operations by organizing course materials, preparing lesson plans, and leading discussions on screenwriting techniques and industry practices.",
      "Provided mentorship to first-year graduate students, offering detailed feedback on scripts, résumés, and internship applications to enhance professional development.",
      "Evaluated and graded assignments with a focus on narrative structure, character development, and industry standards in screenwriting.",
    ],
  },
  libAssistantNorthLiberty: {
    role: "Library Assistant",
    employer: "North Liberty Library",
    date: "January 2015 – July 2017",
    place: "North Liberty, IA",
    description: [
      "Provided exceptional patron support, fostering an inclusive and welcoming learning environment for visitors of all ages.",
      "Supervised and assisted students who sought a safe, enriching space after school, promoting literacy and community engagement.",
      "Coordinated and assisted with high-attendance community events, including book sales, Trunk or Treat, and educational workshops.",
      "Managed library operations, including cataloging new materials, processing late fees, coordinating study room reservations, and proctoring exams.",
    ],
  },
  horsebackInstructorJB: {
    role: "Horseback Riding Instructor",
    employer: "J & B Connection",
    date: "January 2015 – December 2016",
    place: "Mingo, IA",
    description: [
      "Provided expert horseback riding instruction to a diverse roster of students ranging from ages 5 to 50+, tailoring lessons to individual skill levels and confidence.",
      "Developed personalized lesson plans that integrated technical riding fundamentals (seat, posture, balance) with essential soft skills such as confidence, patience, and empathy.",
      "Designed lessons to emphasize safety, effective communication with horses, and the principles of natural horsemanship, fostering well-rounded and capable riders.",
    ],
  },
};

export const projects = {
  regreen: {
    title: "ReGreen Big Bend",
    type: "Website",
    date: "February 2025",
    description: "A custom WordPress site for an environmental restoration project in Far West Texas."
    // description: [
    //   "Developed a custom WordPress theme for an environmental restoration project in Far West Texas.",
    //   "Designed high-fidelity mock-ups in Figma with a focus on regional aesthetics and responsive design.",
    //   "Optimized performance through strategic asset loading and caching to achieve 95+ Lighthouse scores.",
    // ],
  },
  postoley: {
    title: "Postoley Dance Ensemble",
    type: "Website",
    date: "February 2025",
    description: "A website for an independent folk dance studio in Boulder. Built with Astro and Netlify."
    // description: [
    //       "Built a website for an independent folk dance studio in Boulder, CO.",
    //       "Transformed the legacy site into a modern, component-based static website using Astro, achieving 95+ Lighthouse performance scores.",
    //       "Integrated a headless CMS so the client could update site content independently.",
    //     ],
  },
  digitalNotebook: {
    title: "Digital Notebook",
    type: "Website",
    date: "November 2024",
    description: "A wiki-like personal knowledge base. Built with Obsidian, Eleventy, and Cloudflare Pages.",
  },
  prairieRose: {
    title: "Prairie Rose Arena",
    type: "Website",
    date: "May 2024",
    description: "A custom static website for an equestrian event center in Iowa. Built with Eleventy and Netlify."
    // description: [
    //   "Built a custom static website for an equestrian event center in Iowa using Eleventy and Netlify.",
    //   "Conceived and implemented a complete site redesign with a mobile-first, responsive approach.",
    //   "Integrated a headless CMS to allow the client to independently manage events.",
    //   "Optimized performance through modern build processes, lazy loading, and asset optimization.",
    // ],
  },
  personalSite: {
    title: "Personal Website",
    type: "Website",
    date: "June 2024",
    description: "A high-performance personal site built with Astro and Cloudflare Pages."
    // description: [
    //   "Built a high-performance personal site using Astro and Cloudflare Pages, achieving sub-second load times and 100/100 Core Web Vitals scores.",
    //   "Used a component-based architecture with scoped CSS modules, reducing CSS payload while maintaining design consistency.",
    //   "Implemented performance optimizations including prefetching and an automated image optimization pipeline for WebP/AVIF delivery.",
    // ],
  },
  likeMovies: {
    title: "Like Father, Like Son, Like Movies",
    type: "Podcast",
    date: "November 2022 – Present",
    description: "A podcast about movies, co-hosted with my dad."
    // description: [
    //   "Host and produce a podcast about film, independently managing all aspects from concept development to distribution.",
    //   "Utilize comprehensive production workflow, delivering consistent content across all major listening platforms.",
    // ],
  }
};

export const publications = [
  {
    title: "Made of Memories",
    medium: "Short Story",
    outlet: "Tales to Terrify",
    date: "December 2023",
  },
  {
    title:
      "Big Bend Reproductive Coalition Launches Community Needs Assessment",
    medium: "News Article",
    outlet: "The Big Bend Sentinel",
    date: "August 2023",
  },
  {
    title: "The First",
    medium: "Flash Fiction",
    outlet: "The Collidescope",
    date: "October 2022",
  },
  {
    title:
      "Trans-Pecos Festival of Music + Love Doubles as Platform for Advocacy and Outreach",
    medium: "News Article",
    outlet: "The Big Bend Sentinel",
    date: "October 2022",
  },
  {
    title: "Absence of Meaning in <em>The Lighthouse</em>",
    medium: "Criticism",
    outlet: "The Frida Cinema Blog",
    date: "April 2022",
  },
];

export const volunteer = {
  communityHealthAndEquine: {
    role: "Wix Developer & Horseback Riding Instructor",
    employer: "Community Health and Equine Coalition",
    date: "April 2024 – May 2024",
    place: "Galveston, TX",
    description: "Redesigned and maintained the coalition’s Wix site. Enhanced user experience and accessibility, and integrated a secure payment gateway for donations."
  },
  workaway: {
    role: "Volunteer",
    employer: "Workaway",
    date: "April 2024 – September 2024",
    place: "Various Locations",
    description: "Volunteered for various organizations and individuals, including a Hippotherapy center in Galveston, a property manager in New Orleans, and an entrepreneur in Boulder. Worked with other volunteers from Hungary, Italy, Spain, and France,"
  },
  frida: {
    role: "Theater Staff",
    employer: "The Frida Cinema",
    date: "March 2019 – March 2020",
    place: "Santa Ana, CA",
    description: "Assisted with theater operations, provided excellent customer, and occasionally wrote for the theater’s blog."
  },
  animalRescueLeague: {
    role: "Horse Trainer",
    employer: "Animal Rescue League",
    date: "January 2014 – January 2015",
    place: "Ankeny, IA",
    description:
      "Trained rescued horses to prepare them for adoption."
  }
};

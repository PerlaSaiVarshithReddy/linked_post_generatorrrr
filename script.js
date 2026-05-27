const topicInput = document.querySelector("#topic");
const audienceInput = document.querySelector("#audience");
const ctaInput = document.querySelector("#cta");
const toneGroup = document.querySelector("#toneGroup");
const formatGroup = document.querySelector("#formatGroup");
const lengthInput = document.querySelector("#length");
const lengthValue = document.querySelector("#lengthValue");
const includeEmoji = document.querySelector("#includeEmoji");
const includeHashtags = document.querySelector("#includeHashtags");
const generateButton = document.querySelector("#generateButton");
const copyButton = document.querySelector("#copyButton");
const downloadButton = document.querySelector("#downloadButton");
const resetButton = document.querySelector("#resetButton");
const postPreview = document.querySelector("#postPreview");
const wordCount = document.querySelector("#wordCount");
const charCount = document.querySelector("#charCount");
const hashtagCount = document.querySelector("#hashtagCount");

let currentPost = "";

const lengthLabels = {
  1: "Short",
  2: "Medium",
  3: "Long",
};

const toneOpeners = {
  professional: [
    "A useful reminder from this week:",
    "One thing worth paying attention to:",
    "Here is a practical observation:",
  ],
  story: [
    "I used to think progress had to look dramatic.",
    "A small moment changed how I think about this.",
    "Recently, I noticed something I could not ignore.",
  ],
  bold: [
    "Most people overcomplicate this.",
    "This is the uncomfortable truth:",
    "Here is the mistake I see too often:",
  ],
  friendly: [
    "Something that has been helping me lately:",
    "I have been thinking about this a lot:",
    "Quick thought for anyone working on this:",
  ],
};

const formatBuilders = {
  insight: ({ opener, topic, audience, cta, emoji, length }) => {
    const lines = [
      `${emoji}${opener}`,
      "",
      cleanSentence(topic),
      "",
      audience
        ? `For ${audience}, the real value is not just knowing the idea. It is turning it into a repeatable habit.`
        : "The real value is not just knowing the idea. It is turning it into a repeatable habit.",
      "",
      "What looks simple from the outside usually takes focus, patience, and a willingness to improve one version at a time.",
    ];

    if (length === "3") {
      lines.push(
        "",
        "That is where momentum starts: not from waiting for perfect conditions, but from making the next useful move with the information you already have."
      );
    }

    lines.push("", cta || "What is one lesson you are carrying into this week?");
    return lines.join("\n");
  },

  list: ({ opener, topic, cta, emoji, length }) => {
    const items = [
      "Start before every detail feels ready.",
      "Measure what actually moves the work forward.",
      "Ask for feedback earlier than feels comfortable.",
      "Keep the system simple enough to repeat.",
    ];

    if (length === "1") {
      items.splice(3, 1);
    }

    if (length === "3") {
      items.push("Review the results honestly, then adjust without making it personal.");
    }

    return [
      `${emoji}${opener}`,
      "",
      cleanSentence(topic),
      "",
      ...items.map((item, index) => `${index + 1}. ${item}`),
      "",
      cta || "Which one would you add to the list?",
    ].join("\n");
  },

  lesson: ({ opener, topic, audience, cta, emoji, length }) => {
    const lines = [
      `${emoji}${opener}`,
      "",
      cleanSentence(topic),
      "",
      "The lesson: consistency becomes easier when the next step is clear.",
      "",
      audience
        ? `If you are building for ${audience}, clarity matters more than intensity.`
        : "Clarity matters more than intensity.",
    ];

    if (length !== "1") {
      lines.push(
        "",
        "Break the work into smaller promises. Keep those promises visible. Improve the process before blaming the outcome."
      );
    }

    if (length === "3") {
      lines.push(
        "",
        "That shift makes progress feel less like pressure and more like evidence. Every completed step teaches you what the next one should be."
      );
    }

    lines.push("", cta || "What lesson did your last project teach you?");
    return lines.join("\n");
  },

  announcement: ({ topic, audience, cta, emoji, length }) => {
    const lines = [
      `${emoji}Excited to share this:`,
      "",
      cleanSentence(topic),
      "",
      audience
        ? `This is built with ${audience} in mind, especially people who want a clearer and faster way to move from idea to execution.`
        : "This is for people who want a clearer and faster way to move from idea to execution.",
    ];

    if (length !== "1") {
      lines.push(
        "",
        "The goal is simple: make the useful part easier to access, remove friction, and help people take the next step with confidence."
      );
    }

    if (length === "3") {
      lines.push(
        "",
        "There is still plenty to improve, but getting this into the world is an important milestone. Feedback will shape where it goes next."
      );
    }

    lines.push("", cta || "I would love your feedback. What should I improve next?");
    return lines.join("\n");
  },
};

const hashtagMap = {
  professional: ["#Leadership", "#CareerGrowth", "#Work"],
  story: ["#Learning", "#BuildInPublic", "#Growth"],
  bold: ["#Mindset", "#Execution", "#Productivity"],
  friendly: ["#Community", "#LearningInPublic", "#Career"],
};

function getActiveValue(group) {
  return group.querySelector(".active").dataset.value;
}

function setActiveButton(group, button) {
  group.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
}

function cleanSentence(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Share the core idea, the context behind it, and why it matters now.";
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function makeHashtags(topic, tone) {
  const words = topic
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(" ")
    .filter((word) => word.length > 5)
    .slice(0, 2)
    .map((word) => `#${word.charAt(0).toUpperCase()}${word.slice(1)}`);

  return [...new Set([...hashtagMap[tone], ...words])].slice(0, 5).join(" ");
}

function updateMetrics(post) {
  const words = post.trim() ? post.trim().split(/\s+/).length : 0;
  const hashtags = post.match(/#[a-z0-9_]+/gi) || [];

  wordCount.textContent = words;
  charCount.textContent = post.length;
  hashtagCount.textContent = hashtags.length;
}

function renderPost(post) {
  currentPost = post;
  postPreview.textContent = post || "Add a topic and generate your first post.";
  postPreview.classList.toggle("empty-state", !post);
  updateMetrics(post);
}

function generatePost() {
  const topic = topicInput.value.trim();
  const audience = audienceInput.value.trim();
  const cta = ctaInput.value.trim();
  const tone = getActiveValue(toneGroup);
  const format = getActiveValue(formatGroup);
  const length = lengthInput.value;
  const emoji = includeEmoji.checked ? "💡 " : "";
  const opener = pickRandom(toneOpeners[tone]);

  let post = formatBuilders[format]({
    opener,
    topic,
    audience,
    cta,
    emoji,
    length,
  });

  if (includeHashtags.checked) {
    post = `${post}\n\n${makeHashtags(topic, tone)}`;
  }

  renderPost(post);
}

async function copyPost() {
  if (!currentPost) {
    return;
  }

  await navigator.clipboard.writeText(currentPost);
  copyButton.textContent = "Copied";
  setTimeout(() => {
    copyButton.textContent = "Copy";
  }, 1200);
}

function downloadPost() {
  if (!currentPost) {
    return;
  }

  const blob = new Blob([currentPost], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "linkedin-post.txt";
  link.click();
  URL.revokeObjectURL(link.href);
}

function resetForm() {
  topicInput.value = "";
  audienceInput.value = "";
  ctaInput.value = "";
  lengthInput.value = "2";
  includeEmoji.checked = true;
  includeHashtags.checked = true;
  lengthValue.textContent = lengthLabels[lengthInput.value];
  setActiveButton(toneGroup, toneGroup.querySelector('[data-value="professional"]'));
  setActiveButton(formatGroup, formatGroup.querySelector('[data-value="insight"]'));
  renderPost("");
}

[toneGroup, formatGroup].forEach((group) => {
  group.addEventListener("click", (event) => {
    if (event.target.matches("button")) {
      setActiveButton(group, event.target);
    }
  });
});

lengthInput.addEventListener("input", () => {
  lengthValue.textContent = lengthLabels[lengthInput.value];
});

generateButton.addEventListener("click", generatePost);
copyButton.addEventListener("click", copyPost);
downloadButton.addEventListener("click", downloadPost);
resetButton.addEventListener("click", resetForm);

topicInput.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    generatePost();
  }
});

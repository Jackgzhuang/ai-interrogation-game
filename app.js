const state = {
  activeSuspectId: null,
  questionsLeft: 8,
  foundEvidence: new Set(),
  accusationId: null,
  gameOver: false,
};

const suspects = [
  {
    id: "lin",
    name: "林岚",
    role: "产品经理",
    vibe: "看起来镇定，但回避具体时间点",
    innocence: "guilty",
    pressure: 2,
    intro: "我昨晚一直在准备路演材料，没空碰什么原型机。",
    secrets: ["coffee", "timeline", "prototype"],
    responses: {
      default: [
        "你们是不是把事情想复杂了？我只是去过会议室门口，没有进去。",
        "我知道大家都在怀疑内部人员，但怀疑不等于证据。",
      ],
      timeline: [
        "21 点前后我去茶水间拿过冰美式，回来时路过 1704 门口。",
        "具体分钟我不可能记得那么清楚，大概就那几分钟吧。",
      ],
      prototype: [
        "原型机一直由技术团队保管，我只是催过进度，没必要偷它。",
        "你要是说我动机强，那谁不想拿到融资？但动机不代表我做了。",
      ],
      coffee: [
        "对，我洒了咖啡在袖口上，所以我回工位后先去洗手间处理了。",
        "咖啡店小票？我一般都走公司咖啡机，不会留外卖记录。",
      ],
      alibi: [
        "周策应该见过我回工位，但他那时戴着耳机，未必注意到时间。",
        "门禁没刷卡是因为会议室门本来就没锁，这很正常。",
      ],
      cornered: [
        "如果你一定要听实话，我确实进过会议室，但只是想确认原型机是不是还在。",
        "好吧，我承认我动过原型机包装盒，可拿走它的人不是我。",
      ],
    },
  },
  {
    id: "zhou",
    name: "周策",
    role: "前端工程师",
    vibe: "话很多，主动提供细节",
    innocence: "innocent",
    pressure: 0,
    intro: "我在加班修发布页，9 点多基本没离开工位。",
    secrets: ["headphones", "hallway", "lin"],
    responses: {
      default: [
        "我可以配合，你想问时间线还是谁进出过会议室？",
        "我不是最可疑的人吧，我连原型机接口协议都没权限看。",
      ],
      timeline: [
        "21:05 左右我看见林岚从走廊快步回来，还一直在擦袖口。",
        "21:15 前后许墨去过设备间，说投影线又坏了。",
      ],
      hallway: [
        "会议室门那会儿是虚掩着的，我路过时还听见里面有盒子摩擦桌面的声音。",
        "我没进去，因为我在赶上线页面，真不想背锅。",
      ],
      headphones: [
        "我戴耳机是为了降噪，但不是全程放音乐，走廊有动静我还是会抬头。",
        "如果你怀疑我听错了，那可以结合保洁阿姨的证词，她也说有人来回跑。",
      ],
      lin: [
        "林岚那件米白色西装袖子上有咖啡渍，很明显。",
        "她平时记时间很准，今天一直说不清分钟，我觉得挺反常。",
      ],
      cornered: [
        "我说的都差不多了，你该去对一下谁的说法和门禁、咖啡渍冲突。",
      ],
    },
  },
  {
    id: "xu",
    name: "许墨",
    role: "硬件负责人",
    vibe: "冷静克制，回答短",
    innocence: "innocent",
    pressure: 1,
    intro: "原型机是我负责的，所以我最不希望它丢。",
    secrets: ["equipment", "door", "motive"],
    responses: {
      default: [
        "问重点。我不喜欢兜圈子。",
        "我说的话不一定好听，但会尽量准确。",
      ],
      equipment: [
        "21:12 左右我去设备间拿备用 HDMI 线，监控应该拍到我了。",
        "设备间离 1704 不远，我回来时看到会议室门被轻轻带上。",
      ],
      door: [
        "1704 的门锁这两天有问题，不完全闭合时看着像锁上了，其实一推就开。",
        "真正关键不是谁能进去，而是谁知道原型机外壳里有追踪贴纸。",
      ],
      motive: [
        "知道追踪贴纸位置的人不多，林岚上周刚问过我包装结构。",
        "如果有人想临时把原型机转移出去，肯定会先把贴纸拆掉。",
      ],
      prototype: [
        "今早我在垃圾分类桶旁边发现了被撕下的防拆贴，已经交给行政。",
        "那张贴纸原本贴在原型机盒子内侧，不是外人能随便想到的地方。",
      ],
      cornered: [
        "你已经很接近答案了。想想谁既有融资压力，又提前问过包装结构。",
      ],
    },
  },
];

const evidenceMap = {
  coffee: "线索：林岚承认袖口有咖啡渍，但无法提供外卖或购买记录。",
  hallway: "线索：周策听到会议室里有盒子摩擦桌面的声音，说明 21:05 附近有人动过原型机。",
  door: "线索：1704 门锁未完全闭合时能被直接推开，不需要刷卡进入。",
  prototype: "关键线索：原型机包装内侧有防拆贴纸，今早已经被发现遭人为撕下。",
  timeline: "破绽：林岚对时间点含糊，其它两人的叙述却都指向她在 21:05 左右靠近会议室。",
  motive: "动机线索：林岚上周主动问过原型机包装结构，并且背负融资压力。",
};

const elements = {
  suspectList: document.getElementById("suspectList"),
  activeSuspectName: document.getElementById("activeSuspectName"),
  suspectStatus: document.getElementById("suspectStatus"),
  chatWindow: document.getElementById("chatWindow"),
  chatForm: document.getElementById("chatForm"),
  questionInput: document.getElementById("questionInput"),
  questionCounter: document.getElementById("questionCounter"),
  progressText: document.getElementById("progressText"),
  progressBar: document.getElementById("progressBar"),
  evidenceList: document.getElementById("evidenceList"),
  evidenceCounter: document.getElementById("evidenceCounter"),
  accusationOptions: document.getElementById("accusationOptions"),
  accuseButton: document.getElementById("accuseButton"),
  endingCard: document.getElementById("endingCard"),
  hintButton: document.getElementById("hintButton"),
  rulesDialog: document.getElementById("rulesDialog"),
  closeRulesButton: document.getElementById("closeRulesButton"),
};

function init() {
  renderSuspects();
  renderAccusationOptions();
  renderEvidence();
  renderProgress();
  bindEvents();
}

function bindEvents() {
  elements.chatForm.addEventListener("submit", handleQuestion);
  elements.accuseButton.addEventListener("click", handleAccusation);
  elements.hintButton.addEventListener("click", () => elements.rulesDialog.showModal());
  elements.closeRulesButton.addEventListener("click", () => elements.rulesDialog.close());
}

function renderSuspects() {
  elements.suspectList.innerHTML = "";
  suspects.forEach((suspect) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `suspect-card ${state.activeSuspectId === suspect.id ? "active" : ""}`;
    button.innerHTML = `
      <div class="suspect-name">${suspect.name}</div>
      <div class="suspect-meta">${suspect.role}</div>
      <div class="tiny">${suspect.vibe}</div>
    `;
    button.addEventListener("click", () => selectSuspect(suspect.id));
    elements.suspectList.appendChild(button);
  });
}

function renderAccusationOptions() {
  elements.accusationOptions.innerHTML = "";
  suspects.forEach((suspect) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `accusation-option ${state.accusationId === suspect.id ? "active" : ""}`;
    button.innerHTML = `
      <div class="suspect-name">${suspect.name}</div>
      <div class="suspect-meta">${suspect.role}</div>
    `;
    button.addEventListener("click", () => {
      state.accusationId = suspect.id;
      renderAccusationOptions();
    });
    elements.accusationOptions.appendChild(button);
  });
}

function renderEvidence() {
  const items = Array.from(state.foundEvidence);
  elements.evidenceCounter.textContent = `${items.length} 条记录`;

  if (!items.length) {
    elements.evidenceList.innerHTML = '<li class="evidence-item">还没有记录到有效线索。试着追问时间、门锁、咖啡渍、包装结构。</li>';
    return;
  }

  elements.evidenceList.innerHTML = items
    .map((key) => `<li class="evidence-item">${evidenceMap[key]}</li>`)
    .join("");
}

function selectSuspect(suspectId) {
  state.activeSuspectId = suspectId;
  const suspect = getActiveSuspect();
  elements.activeSuspectName.textContent = `正在审讯：${suspect.name}`;
  elements.suspectStatus.textContent = `${suspect.role} · ${suspect.vibe}`;
  renderSuspects();
  addMessage("suspect", `${suspect.name}：${suspect.intro}`);
}

function handleQuestion(event) {
  event.preventDefault();
  if (state.gameOver) {
    return;
  }

  const text = elements.questionInput.value.trim();
  if (!text) {
    return;
  }

  if (!state.activeSuspectId) {
    addSystemMessage("请先选择一名嫌疑人。");
    return;
  }

  if (state.questionsLeft <= 0) {
    addSystemMessage("提问次数已经用完，请根据已有线索做出最终指认。");
    return;
  }

  const suspect = getActiveSuspect();
  addMessage("player", `你：${text}`);
  const topic = detectTopic(text);
  const response = generateResponse(suspect, topic);
  addMessage("suspect", `${suspect.name}：${response}`);

  state.questionsLeft -= 1;
  elements.questionCounter.textContent = `剩余提问 ${state.questionsLeft} 次`;
  renderProgress();
  elements.questionInput.value = "";

  maybeUnlockEvidence(suspect, topic, response);

  if (state.questionsLeft === 0) {
    addSystemMessage("提问次数已耗尽。现在你需要做出最终指认。");
  }
}

function detectTopic(text) {
  const normalized = text.toLowerCase();
  const topicRules = [
    { key: "timeline", patterns: ["几点", "时间", "21", "九点", "timeline"] },
    { key: "coffee", patterns: ["咖啡", "袖口", "污渍"] },
    { key: "hallway", patterns: ["走廊", "门口", "声音", "路过"] },
    { key: "headphones", patterns: ["耳机", "听见", "听到"] },
    { key: "door", patterns: ["门", "门锁", "刷卡", "进去"] },
    { key: "equipment", patterns: ["设备间", "hdmi", "投影", "监控"] },
    { key: "prototype", patterns: ["原型机", "包装", "贴纸", "盒子"] },
    { key: "motive", patterns: ["动机", "融资", "为什么", "目的"] },
    { key: "lin", patterns: ["林岚"] },
    { key: "alibi", patterns: ["不在场", "证人", "证明"] },
  ];

  const matched = topicRules.find((rule) =>
    rule.patterns.some((pattern) => normalized.includes(pattern))
  );

  return matched ? matched.key : "default";
}

function generateResponse(suspect, topic) {
  const pool = suspect.responses[topic] || suspect.responses.default;

  if (
    suspect.innocence === "guilty" &&
    (state.foundEvidence.has("timeline") || state.foundEvidence.has("motive")) &&
    (topic === "prototype" || topic === "alibi" || topic === "door")
  ) {
    return choose(suspect.responses.cornered);
  }

  return choose(pool);
}

function maybeUnlockEvidence(suspect, topic, response) {
  const before = state.foundEvidence.size;

  if (suspect.id === "lin" && (topic === "coffee" || topic === "timeline")) {
    state.foundEvidence.add(topic);
  }

  if (suspect.id === "zhou" && (topic === "hallway" || topic === "lin")) {
    state.foundEvidence.add(topic === "lin" ? "timeline" : topic);
  }

  if (suspect.id === "xu" && ["door", "prototype", "motive", "equipment"].includes(topic)) {
    state.foundEvidence.add(topic === "equipment" ? "door" : topic);
  }

  if (response.includes("包装盒") || response.includes("动过原型机")) {
    state.foundEvidence.add("prototype");
  }

  if (state.foundEvidence.size !== before) {
    renderEvidence();
  }
}

function handleAccusation() {
  if (state.gameOver) {
    return;
  }

  if (!state.accusationId) {
    addSystemMessage("先选择你要指认的嫌疑人。");
    return;
  }

  const accused = suspects.find((suspect) => suspect.id === state.accusationId);
  const keyCount = ["timeline", "door", "prototype", "motive"].filter((key) =>
    state.foundEvidence.has(key)
  ).length;

  state.gameOver = true;
  elements.questionInput.disabled = true;
  document.getElementById("askButton").disabled = true;
  elements.accuseButton.disabled = true;

  elements.endingCard.classList.remove("hidden");

  if (accused.innocence === "guilty") {
    const verdict =
      keyCount >= 3
        ? `结案成功。你锁定了真凶 ${accused.name}，并且拿到了足够完整的证据链：她有融资压力、靠近过会议室、清楚包装结构，还对关键时间点含糊其辞。`
        : `你猜中了真凶 ${accused.name}，但证据链还不够扎实。这个版本会判定为“险胜结案”，后续可以继续扩展成多结局评分系统。`;
    elements.endingCard.innerHTML = verdict;
    addSystemMessage(`审讯结论：${verdict}`);
  } else {
    const truth = "真正的问题出在林岚。她既有动机，也掌握包装结构信息，还在关键时间段出现在会议室附近。";
    elements.endingCard.innerHTML = `指认失败。${accused.name} 不是偷走原型机的人。${truth}`;
    addSystemMessage(`审讯结论：指认失败。${truth}`);
  }
}

function renderProgress() {
  const asked = 8 - state.questionsLeft;
  const ratio = (asked / 8) * 100;
  elements.progressText.textContent = `${asked} / 8`;
  elements.progressBar.style.width = `${ratio}%`;
}

function getActiveSuspect() {
  return suspects.find((suspect) => suspect.id === state.activeSuspectId);
}

function choose(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function addMessage(type, text) {
  const node = document.createElement("div");
  node.className = `message ${type}`;
  node.textContent = text;
  elements.chatWindow.appendChild(node);
  elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
}

function addSystemMessage(text) {
  const node = document.createElement("div");
  node.className = "system-bubble";
  node.textContent = text;
  elements.chatWindow.appendChild(node);
  elements.chatWindow.scrollTop = elements.chatWindow.scrollHeight;
}

init();

// =====================================================
// p5.js Google Sheets CSV 選擇題測驗系統
// 中文：Cactus Classical Serif
// 英文與數字：Isometra，並自動使用 Arial 等 fallback
// 題庫：Google Sheets 發布為 CSV 的網址
// =====================================================

// =====================================================
// Google Sheets 設定
// =====================================================

// 請只把自己的 Google Sheets CSV 網址貼到下面的雙引號中。
// 可使用「發布到網頁」產生的 CSV 網址，或 gviz/tq CSV 網址。
const GOOGLE_SHEET_CSV_URL = "PASTE_YOUR_GOOGLE_SHEETS_CSV_URL_HERE";

const QUESTIONS_PER_QUIZ = 5;
const TOTAL_QUESTIONS_REQUIRED = 15;
const REQUIRED_COLUMNS = [
  "question",
  "option1",
  "option2",
  "option3",
  "option4",
  "answer"
];

// =====================================================
// 題庫與載入狀態
// =====================================================

let questionBank = [];
let quizQuestions = [];
let dataStatus = "loading"; // loading、ready、error
let dataErrorType = "";
let dataErrorMessage = "";

// =====================================================
// 測驗狀態
// =====================================================

let currentQuestion = 0;
let score = 0;
let selectedOption = -1;
let hasAnswered = false;
let isFinished = false;
let layout = {};
let keyboardFocus = -1;

// =====================================================
// 字型設定
// =====================================================

const CHINESE_FONT = "Cactus Classical Serif, Noto Serif CJK TC, serif";
const LATIN_FONT = "Isometra, Arial, Helvetica, sans-serif";

// =====================================================
// 顏色設定
// =====================================================

const BACKGROUND_COLOR = "#F4F7F9";
const QUESTION_BOX_COLOR = "#BDE0FE";
const OPTION_COLOR = "#FFFFFF";
const OPTION_HOVER_COLOR = "#E8F1F8";
const CORRECT_COLOR = "#FFE381";
const WRONG_COLOR = "#C1121F";
const TEXT_COLOR = "#263238";
const SECONDARY_TEXT_COLOR = "#607D8B";
const BUTTON_COLOR = "#457B9D";
const BUTTON_HOVER_COLOR = "#35627D";
const BUTTON_DISABLED_COLOR = "#AAB8C2";
const BUTTON_TEXT_COLOR = "#FFFFFF";
const BORDER_COLOR = "#90AFC5";

// =====================================================
// p5.js 初始設定與 Google Sheets 載入
// =====================================================

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  const container = document.getElementById("p5-container");

  if (container) {
    canvas.parent(container);
  }

  rectMode(CENTER);
  textWrap(WORD);
  layout = getQuizLayout();
  preventDefaultTouchActions();

  loadQuestionBankFromGoogleSheets();
}

async function loadQuestionBankFromGoogleSheets() {
  dataStatus = "loading";
  dataErrorType = "";
  dataErrorMessage = "";

  if (!isConfiguredGoogleSheetUrl()) {
    setDataError(
      "尚未設定 Google Sheets CSV 網址。請到 sketch.js 最上方，將 GOOGLE_SHEET_CSV_URL 換成自己的網址。",
      "設定錯誤"
    );
    return;
  }

  try {
    // 加上時間參數並停用快取，重新整理網站時可取得老師最新修改的題目。
    const requestUrl = addCacheBuster(GOOGLE_SHEET_CSV_URL);
    const response = await fetch(requestUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "text/csv,text/plain;q=0.9,*/*;q=0.8"
      }
    });

    if (!response.ok) {
      throw createDataError(
        `Google Sheets 回應 HTTP ${response.status} ${response.statusText || "錯誤"}。請確認網址、試算表分享權限與發布設定。`,
        "HTTP 錯誤"
      );
    }

    const csvText = await response.text();

    if (!csvText.trim()) {
      throw createDataError(
        "Google Sheets 回傳空白內容，請確認工作表內有標題列與題目資料。",
        "CSV 格式錯誤"
      );
    }

    const rows = parseCSV(csvText);
    buildQuestionBankFromRows(rows);
  } catch (error) {
    if (error && error.dataType) {
      setDataError(error.message, error.dataType);
      return;
    }

    const message = error && error.message
      ? error.message
      : "無法連線到 Google Sheets。";

    setDataError(
      `無法讀取 Google Sheets。可能是網址錯誤、試算表未公開，或瀏覽器遭遇跨來源存取限制。\n${message}`,
      "網路錯誤"
    );
  }
}

function isConfiguredGoogleSheetUrl() {
  if (!GOOGLE_SHEET_CSV_URL || !GOOGLE_SHEET_CSV_URL.trim()) {
    return false;
  }

  if (GOOGLE_SHEET_CSV_URL.includes("PASTE_YOUR_GOOGLE_SHEETS")) {
    return false;
  }

  return /^https:\/\/docs\.google\.com\//i.test(
    GOOGLE_SHEET_CSV_URL.trim()
  );
}

function addCacheBuster(url) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_quiz_cache_buster=${Date.now()}`;
}

function createDataError(message, dataType) {
  const error = new Error(message);
  error.dataType = dataType;
  return error;
}

// =====================================================
// RFC 4180 風格 CSV parser
// 可處理雙引號、逗號、CRLF/LF 與雙引號欄位內換行。
// =====================================================

function parseCSV(csvText) {
  const source = String(csvText).replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let afterClosingQuote = false;

  const pushField = () => {
    row.push(field);
    field = "";
    afterClosingQuote = false;
  };

  const pushRow = () => {
    // 忽略真正的空白行，但保留有欄位數的資料列供格式檢查。
    if (row.length > 1 || row[0] !== "") {
      rows.push(row);
    }
    row = [];
  };

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const nextCharacter = source[index + 1];

    if (inQuotes) {
      if (character === '"') {
        if (nextCharacter === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
          afterClosingQuote = true;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (afterClosingQuote) {
      if (character === ",") {
        pushField();
        continue;
      }

      if (character === "\r" || character === "\n") {
        pushField();
        pushRow();
        if (character === "\r" && nextCharacter === "\n") {
          index += 1;
        }
        continue;
      }

      if (character === " " || character === "\t") {
        // 容許結束引號後的空白，下一個非空白字元仍須是逗號或換行。
        continue;
      }

      throw createDataError(
        `CSV 第 ${rows.length + 1} 列的雙引號後出現不合法字元。`,
        "CSV 格式錯誤"
      );
    }

    if (character === '"') {
      if (field.length !== 0) {
        throw createDataError(
          `CSV 第 ${rows.length + 1} 列出現未正確包住欄位的雙引號。`,
          "CSV 格式錯誤"
        );
      }
      inQuotes = true;
    } else if (character === ",") {
      pushField();
    } else if (character === "\r" || character === "\n") {
      pushField();
      pushRow();
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
    } else {
      field += character;
    }
  }

  if (inQuotes) {
    throw createDataError(
      "CSV 內容有未關閉的雙引號。請檢查包含逗號或換行的欄位。",
      "CSV 格式錯誤"
    );
  }

  if (afterClosingQuote) {
    pushField();
  } else if (field.length > 0 || row.length > 0) {
    pushField();
  }

  if (row.length > 0) {
    pushRow();
  }

  if (rows.length === 0) {
    throw createDataError(
      "CSV 沒有任何資料。",
      "CSV 格式錯誤"
    );
  }

  return rows;
}

// =====================================================
// 建立與驗證題庫
// =====================================================

function buildQuestionBankFromRows(rows) {
  questionBank = [];

  if (!Array.isArray(rows) || rows.length === 0) {
    throw createDataError(
      "CSV 沒有可讀取的資料列。",
      "CSV 格式錯誤"
    );
  }

  const headers = rows[0].map((header) => String(header).trim());
  const headerIsCorrect =
    headers.length === REQUIRED_COLUMNS.length &&
    REQUIRED_COLUMNS.every((columnName, index) => {
      return headers[index] === columnName;
    });

  if (!headerIsCorrect) {
    throw createDataError(
      `CSV 第一列欄位必須完全按照：${REQUIRED_COLUMNS.join(",")}`, 
      "CSV 格式錯誤"
    );
  }

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const displayRowNumber = rowIndex + 1;

    if (row.length !== REQUIRED_COLUMNS.length) {
      throw createDataError(
        `CSV 第 ${displayRowNumber} 列欄位數錯誤：應有 ${REQUIRED_COLUMNS.length} 欄，實際有 ${row.length} 欄。`,
        "CSV 格式錯誤"
      );
    }

    const questionText = String(row[0] ?? "").trim();
    const optionTexts = [
      String(row[1] ?? "").trim(),
      String(row[2] ?? "").trim(),
      String(row[3] ?? "").trim(),
      String(row[4] ?? "").trim()
    ];
    const answerText = String(row[5] ?? "").trim();
    const answerNumber = Number(answerText);

    const rowIsValid =
      questionText.length > 0 &&
      optionTexts.every((optionText) => optionText.length > 0) &&
      /^(1|2|3|4)$/.test(answerText) &&
      Number.isInteger(answerNumber);

    if (!rowIsValid) {
      throw createDataError(
        `CSV 第 ${displayRowNumber} 列資料格式錯誤：題目與四個選項不可空白，answer 必須是 1、2、3 或 4。`,
        "CSV 格式錯誤"
      );
    }

    questionBank.push({
      question: questionText,
      options: optionTexts,
      // CSV answer 是 1 到 4；程式陣列索引是 0 到 3。
      answer: answerNumber - 1
    });
  }

  if (questionBank.length < TOTAL_QUESTIONS_REQUIRED) {
    throw createDataError(
      `題數不足：目前只有 ${questionBank.length} 題，至少需要 ${TOTAL_QUESTIONS_REQUIRED} 題。`,
      "題數不足"
    );
  }

  dataStatus = "ready";
  dataErrorType = "";
  dataErrorMessage = "";
  startQuiz();
}

function setDataError(message, errorType = "資料錯誤") {
  dataStatus = "error";
  dataErrorType = errorType;
  dataErrorMessage = message;
  questionBank = [];
  quizQuestions = [];
  console.error(`[${errorType}] ${message}`);
}

// =====================================================
// 主要繪圖迴圈
// =====================================================

function draw() {
  background(BACKGROUND_COLOR);
  layout = getQuizLayout();

  if (dataStatus === "loading") {
    drawLoadingScreen();
    return;
  }

  if (dataStatus === "error") {
    drawDataErrorScreen();
    return;
  }

  if (isFinished) {
    drawFinishScreen();
    return;
  }

  drawTitle();
  drawQuestion();
  drawOptions();
  drawNextButton();
}

// =====================================================
// 隨機抽題與測驗流程
// =====================================================

function startQuiz() {
  if (
    dataStatus !== "ready" &&
    questionBank.length < QUESTIONS_PER_QUIZ
  ) {
    return;
  }

  // 從完整題庫複製後洗牌，確保本次 5 題不重複。
  quizQuestions = shuffle(questionBank.slice()).slice(
    0,
    QUESTIONS_PER_QUIZ
  );

  currentQuestion = 0;
  score = 0;
  selectedOption = -1;
  keyboardFocus = -1;
  hasAnswered = false;
  isFinished = false;
}

function restartQuiz() {
  startQuiz();
}

function selectOption(optionIndex) {
  if (
    hasAnswered ||
    optionIndex < 0 ||
    optionIndex > 3 ||
    quizQuestions.length === 0
  ) {
    return;
  }

  selectedOption = optionIndex;
  keyboardFocus = optionIndex;
  hasAnswered = true;

  if (selectedOption === quizQuestions[currentQuestion].answer) {
    score += 1;
  }
}

function selectOptionByKeyboard(optionIndex) {
  selectOption(optionIndex);
}

function goToNextQuestion() {
  if (!hasAnswered) {
    return;
  }

  if (currentQuestion < quizQuestions.length - 1) {
    currentQuestion += 1;
    selectedOption = -1;
    keyboardFocus = -1;
    hasAnswered = false;
  } else {
    isFinished = true;
  }
}

// =====================================================
// 響應式版面計算
// =====================================================

function getQuizLayout() {
  const canvasWidth = width;
  const canvasHeight = height;
  const isMobile = canvasWidth < 700;
  const isShortScreen = canvasHeight < 600;
  const margin = constrain(min(canvasWidth, canvasHeight) * 0.05, 16, 64);
  const contentWidth = min(canvasWidth - margin * 2, 1120);
  const titleTextSize = isMobile
    ? constrain(canvasWidth * 0.065, 23, 38)
    : constrain(canvasWidth * 0.044, 30, 52);
  const questionTextSize = isMobile
    ? constrain(canvasWidth * 0.043, 17, 28)
    : constrain(canvasWidth * 0.025, 21, 34);
  const optionTextSize = isMobile
    ? constrain(canvasWidth * 0.036, 15, 23)
    : constrain(canvasWidth * 0.019, 17, 27);
  const buttonTextSize = isMobile
    ? constrain(canvasWidth * 0.038, 16, 23)
    : constrain(canvasWidth * 0.018, 17, 25);
  const buttonHeight = isMobile ? 48 : 56;
  const buttonWidth = isMobile ? 158 : 194;
  const titleY = max(titleTextSize * 0.85, canvasHeight * 0.075);
  const progressY = titleY + titleTextSize * 0.82;
  const questionTop = max(
    progressY + titleTextSize * 0.6,
    canvasHeight * 0.16
  );
  const questionHeight = isShortScreen
    ? constrain(canvasHeight * 0.17, 78, 130)
    : constrain(canvasHeight * 0.18, 105, 185);
  const questionY = questionTop + questionHeight / 2;
  const optionsTop = questionTop + questionHeight + (isMobile ? 12 : 18);
  const bottomReserved = buttonHeight + max(16, canvasHeight * 0.035);
  const availableOptionsHeight = max(
    120,
    canvasHeight - optionsTop - bottomReserved - 12
  );
  const useTwoColumns = !isMobile && canvasHeight >= 560;
  const optionColumnGap = isMobile
    ? 0
    : constrain(contentWidth * 0.025, 16, 32);
  const optionRowGap = isMobile
    ? constrain(canvasHeight * 0.014, 7, 15)
    : constrain(canvasHeight * 0.022, 12, 22);
  const optionWidth = useTwoColumns
    ? (contentWidth - optionColumnGap) / 2
    : contentWidth;
  let optionHeight;
  let optionGap;

  if (useTwoColumns) {
    optionHeight = constrain(
      (availableOptionsHeight - optionRowGap) / 2,
      58,
      102
    );
    optionGap = optionHeight + optionRowGap;
  } else {
    const calculatedHeight =
      (availableOptionsHeight - optionRowGap * 3) / 4;
    optionHeight = constrain(calculatedHeight, 42, 76);
    optionGap = optionHeight + optionRowGap;
  }

  const optionRects = [];

  for (let index = 0; index < 4; index += 1) {
    let optionX;
    let optionY;

    if (useTwoColumns) {
      const column = index % 2;
      const row = floor(index / 2);
      optionX =
        width / 2 +
        (column === 0 ? -1 : 1) *
          (optionWidth + optionColumnGap) / 2;
      optionY = optionsTop + optionHeight / 2 + row * optionGap;
    } else {
      optionX = width / 2;
      optionY = optionsTop + optionHeight / 2 + index * optionGap;
    }

    optionRects.push({
      x: optionX,
      y: optionY,
      width: optionWidth,
      height: optionHeight
    });
  }

  const lastOptionBottom = useTwoColumns
    ? optionsTop + optionHeight * 2 + optionRowGap
    : optionsTop + optionHeight * 4 + optionRowGap * 3;
  const buttonY = min(
    canvasHeight - buttonHeight / 2 - max(12, canvasHeight * 0.025),
    lastOptionBottom + buttonHeight / 2 + max(10, canvasHeight * 0.02)
  );

  return {
    canvasWidth,
    canvasHeight,
    isMobile,
    isShortScreen,
    margin,
    contentWidth,
    titleTextSize,
    questionTextSize,
    optionTextSize,
    buttonTextSize,
    titleY,
    progressY,
    questionY,
    questionHeight,
    questionTextWidth: contentWidth * 0.86,
    optionTextWidthRatio: 0.82,
    optionRects,
    useTwoColumns,
    buttonX: width / 2,
    buttonY,
    buttonWidth,
    buttonHeight
  };
}

// =====================================================
// 字型與混合文字處理
// =====================================================

function containsChinese(text) {
  return /[\u3400-\u9FFF\uF900-\uFAFF]/.test(String(text));
}

function isChineseCharacter(character) {
  return /[\u3400-\u9FFF\uF900-\uFAFF]/.test(character);
}

function getFontForCharacter(character) {
  return isChineseCharacter(character) ? CHINESE_FONT : LATIN_FONT;
}

function setTextFont(text) {
  textFont(containsChinese(text) ? CHINESE_FONT : LATIN_FONT);
}

function measureMixedTextWidth(content, size) {
  const characters = Array.from(String(content));
  let totalWidth = 0;

  push();
  textSize(size);

  characters.forEach((character) => {
    textFont(getFontForCharacter(character));
    totalWidth += textWidth(character);
  });

  pop();
  return totalWidth;
}

function drawMixedText(textContent, x, y, size, options = {}) {
  const content = String(textContent);
  const alignX = options.alignX ?? CENTER;
  const alignY = options.alignY ?? CENTER;
  const fillColor = options.fillColor ?? TEXT_COLOR;
  const characters = Array.from(content);
  const widths = [];

  push();
  textSize(size);

  characters.forEach((character) => {
    textFont(getFontForCharacter(character));
    widths.push(textWidth(character));
  });

  const totalWidth = widths.reduce(
    (total, characterWidth) => total + characterWidth,
    0
  );
  let startX = x;

  if (alignX === CENTER) {
    startX = x - totalWidth / 2;
  } else if (alignX === RIGHT) {
    startX = x - totalWidth;
  }

  textAlign(LEFT, alignY);
  textSize(size);
  fill(fillColor);
  noStroke();

  characters.forEach((character, index) => {
    textFont(getFontForCharacter(character));
    text(character, startX, y);
    startX += widths[index];
  });

  pop();
}

function wrapTextLines(content, maxWidth, size) {
  const sourceLines = String(content).split("\n");
  const lines = [];

  sourceLines.forEach((sourceLine) => {
    const characters = Array.from(sourceLine);
    let currentLine = "";

    characters.forEach((character) => {
      const testLine = currentLine + character;

      if (
        currentLine.length > 0 &&
        measureMixedTextWidth(testLine, size) > maxWidth
      ) {
        lines.push(currentLine);
        currentLine = character;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine.length > 0) {
      lines.push(currentLine);
    } else if (sourceLines.length > 1) {
      lines.push("");
    }
  });

  return lines.length > 0 ? lines : [""];
}

function drawWrappedMixedText(
  content,
  x,
  y,
  maxWidth,
  size,
  lineHeight,
  options = {}
) {
  const alignX = options.alignX ?? CENTER;
  const alignY = options.alignY ?? CENTER;
  const fillColor = options.fillColor ?? TEXT_COLOR;
  const lines = wrapTextLines(content, maxWidth, size);
  const totalHeight = lines.length * lineHeight;
  let currentY = y - totalHeight / 2 + lineHeight / 2;

  lines.forEach((line) => {
    drawMixedText(line, x, currentY, size, {
      alignX,
      alignY,
      fillColor
    });
    currentY += lineHeight;
  });
}

// =====================================================
// 載入中、錯誤與提示畫面
// =====================================================

function drawLoadingScreen() {
  drawMixedText(
    "正在從 Google Sheets 載入題庫...",
    width / 2,
    height * 0.45,
    layout.questionTextSize,
    {
      alignX: CENTER,
      alignY: CENTER,
      fillColor: TEXT_COLOR
    }
  );

  drawMixedText(
    "請稍候",
    width / 2,
    height * 0.56,
    layout.optionTextSize,
    {
      alignX: CENTER,
      alignY: CENTER,
      fillColor: SECONDARY_TEXT_COLOR
    }
  );
}

function drawDataErrorScreen() {
  drawMixedText(
    "題庫載入失敗",
    width / 2,
    height * 0.28,
    layout.titleTextSize,
    {
      alignX: CENTER,
      alignY: CENTER,
      fillColor: WRONG_COLOR
    }
  );

  drawMixedText(
    dataErrorType,
    width / 2,
    height * 0.38,
    layout.questionTextSize * 0.82,
    {
      alignX: CENTER,
      alignY: CENTER,
      fillColor: WRONG_COLOR
    }
  );

  drawWrappedMixedText(
    dataErrorMessage,
    width / 2,
    height * 0.54,
    min(width * 0.84, 820),
    layout.questionTextSize * 0.78,
    layout.questionTextSize * 1.35,
    {
      alignX: CENTER,
      alignY: CENTER,
      fillColor: TEXT_COLOR
    }
  );
}

// =====================================================
// 測驗畫面
// =====================================================

function drawTitle() {
  drawMixedText(
    "p5.js 程式設計測驗",
    width / 2,
    layout.titleY,
    layout.titleTextSize,
    {
      alignX: CENTER,
      alignY: CENTER,
      fillColor: TEXT_COLOR
    }
  );

  const progressText = `第 ${currentQuestion + 1} / ${quizQuestions.length} 題`;
  drawMixedText(
    progressText,
    width / 2,
    layout.progressY,
    layout.titleTextSize * 0.48,
    {
      alignX: CENTER,
      alignY: CENTER,
      fillColor: SECONDARY_TEXT_COLOR
    }
  );
}

function drawQuestion() {
  const currentData = quizQuestions[currentQuestion];

  push();
  fill(QUESTION_BOX_COLOR);
  stroke(BORDER_COLOR);
  strokeWeight(2);
  rect(
    width / 2,
    layout.questionY,
    layout.contentWidth,
    layout.questionHeight,
    18
  );
  pop();

  drawWrappedMixedText(
    currentData.question,
    width / 2,
    layout.questionY,
    layout.questionTextWidth,
    layout.questionTextSize,
    layout.questionTextSize * 1.32,
    {
      alignX: CENTER,
      alignY: CENTER,
      fillColor: TEXT_COLOR
    }
  );
}

function getAnimatedOptionRect(index) {
  const baseRect = layout.optionRects[index];
  const currentData = quizQuestions[currentQuestion];
  let animatedX = baseRect.x;
  let animatedY = baseRect.y;

  if (hasAnswered && index === currentData.answer) {
    animatedY += sin(frameCount * 0.18) * 8;
  }

  if (
    hasAnswered &&
    index === selectedOption &&
    selectedOption !== currentData.answer
  ) {
    animatedX += sin(frameCount * 0.45) * 11;
  }

  return {
    x: animatedX,
    y: animatedY,
    width: baseRect.width,
    height: baseRect.height
  };
}

function drawOptions() {
  const currentData = quizQuestions[currentQuestion];

  currentData.options.forEach((optionText, index) => {
    const optionRect = getAnimatedOptionRect(index);
    const isHovering = isPointInsideRect(
      mouseX,
      mouseY,
      optionRect.x,
      optionRect.y,
      optionRect.width,
      optionRect.height
    );
    const isCorrectOption = hasAnswered && index === currentData.answer;
    const isWrongSelection =
      hasAnswered &&
      index === selectedOption &&
      selectedOption !== currentData.answer;

    let optionBackground = OPTION_COLOR;
    let optionTextColor = TEXT_COLOR;

    if (!hasAnswered && (isHovering || keyboardFocus === index)) {
      optionBackground = OPTION_HOVER_COLOR;
    }

    if (isCorrectOption) {
      optionBackground = CORRECT_COLOR;
    }

    if (isWrongSelection) {
      optionBackground = WRONG_COLOR;
      optionTextColor = "#FFFFFF";
    }

    push();
    fill(optionBackground);
    stroke(BORDER_COLOR);
    strokeWeight(2);
    rect(
      optionRect.x,
      optionRect.y,
      optionRect.width,
      optionRect.height,
      14
    );
    pop();

    drawWrappedMixedText(
      `${index + 1}. ${optionText}`,
      optionRect.x,
      optionRect.y,
      optionRect.width * layout.optionTextWidthRatio,
      layout.optionTextSize,
      layout.optionTextSize * 1.22,
      {
        alignX: CENTER,
        alignY: CENTER,
        fillColor: optionTextColor
      }
    );
  });
}

function drawNextButton() {
  const buttonIsEnabled = hasAnswered;
  const buttonIsHovering =
    buttonIsEnabled &&
    isPointInsideRect(
      mouseX,
      mouseY,
      layout.buttonX,
      layout.buttonY,
      layout.buttonWidth,
      layout.buttonHeight
    );
  const buttonColor = !buttonIsEnabled
    ? BUTTON_DISABLED_COLOR
    : buttonIsHovering
      ? BUTTON_HOVER_COLOR
      : BUTTON_COLOR;
  const buttonText = buttonIsEnabled ? "下一題" : "請先選擇答案";

  push();
  fill(buttonColor);
  noStroke();
  rect(
    layout.buttonX,
    layout.buttonY,
    layout.buttonWidth,
    layout.buttonHeight,
    16
  );
  pop();

  drawMixedText(
    buttonText,
    layout.buttonX,
    layout.buttonY,
    layout.buttonTextSize,
    {
      alignX: CENTER,
      alignY: CENTER,
      fillColor: BUTTON_TEXT_COLOR
    }
  );
}

// =====================================================
// 完成畫面
// =====================================================

function drawFinishScreen() {
  const percentage = Math.round((score / quizQuestions.length) * 100);
  const scoreText = `答對 ${score} / ${quizQuestions.length} 題`;
  const restartWidth = layout.isMobile ? 180 : 220;
  const restartHeight = layout.isMobile ? 52 : 60;
  const restartY = height * 0.72;
  const restartHovering = isPointInsideRect(
    mouseX,
    mouseY,
    width / 2,
    restartY,
    restartWidth,
    restartHeight
  );

  drawMixedText(
    "測驗完成！",
    width / 2,
    height * 0.23,
    layout.titleTextSize * 1.15,
    {
      alignX: CENTER,
      alignY: CENTER,
      fillColor: TEXT_COLOR
    }
  );

  drawMixedText(
    scoreText,
    width / 2,
    height * 0.40,
    layout.questionTextSize,
    {
      alignX: CENTER,
      alignY: CENTER,
      fillColor: TEXT_COLOR
    }
  );

  drawMixedText(
    `${percentage}%`,
    width / 2,
    height * 0.53,
    layout.titleTextSize * 1.35,
    {
      alignX: CENTER,
      alignY: CENTER,
      fillColor: BUTTON_COLOR
    }
  );

  push();
  fill(restartHovering ? BUTTON_HOVER_COLOR : BUTTON_COLOR);
  noStroke();
  rect(width / 2, restartY, restartWidth, restartHeight, 16);
  pop();

  drawMixedText(
    "重新開始",
    width / 2,
    restartY,
    layout.buttonTextSize,
    {
      alignX: CENTER,
      alignY: CENTER,
      fillColor: BUTTON_TEXT_COLOR
    }
  );
}

// =====================================================
// 滑鼠、觸控與鍵盤操作
// =====================================================

function mousePressed() {
  handleInput(mouseX, mouseY);
  return false;
}

function touchStarted() {
  const inputX = touches.length > 0 ? touches[0].x : mouseX;
  const inputY = touches.length > 0 ? touches[0].y : mouseY;
  handleInput(inputX, inputY);
  return false;
}

function handleInput(inputX, inputY) {
  if (dataStatus !== "ready") {
    return;
  }

  if (isFinished) {
    const restartWidth = layout.isMobile ? 180 : 220;
    const restartHeight = layout.isMobile ? 52 : 60;
    const restartY = height * 0.72;

    if (
      isPointInsideRect(
        inputX,
        inputY,
        width / 2,
        restartY,
        restartWidth,
        restartHeight
      )
    ) {
      restartQuiz();
    }
    return;
  }

  if (!hasAnswered) {
    for (
      let index = 0;
      index < quizQuestions[currentQuestion].options.length;
      index += 1
    ) {
      const optionRect = getAnimatedOptionRect(index);

      if (
        isPointInsideRect(
          inputX,
          inputY,
          optionRect.x,
          optionRect.y,
          optionRect.width,
          optionRect.height
        )
      ) {
        selectOption(index);
        return;
      }
    }
  }

  if (
    hasAnswered &&
    isPointInsideRect(
      inputX,
      inputY,
      layout.buttonX,
      layout.buttonY,
      layout.buttonWidth,
      layout.buttonHeight
    )
  ) {
    goToNextQuestion();
  }
}

function keyPressed() {
  if (dataStatus !== "ready") {
    return false;
  }

  if (isFinished) {
    if (key === "r" || key === "R") {
      restartQuiz();
    }
    return false;
  }

  if (!hasAnswered && ["1", "2", "3", "4"].includes(key)) {
    selectOptionByKeyboard(Number.parseInt(key, 10) - 1);
    return false;
  }

  if (!hasAnswered && (keyCode === UP_ARROW || keyCode === LEFT_ARROW)) {
    keyboardFocus = keyboardFocus <= 0 ? 3 : keyboardFocus - 1;
    return false;
  }

  if (!hasAnswered && (keyCode === DOWN_ARROW || keyCode === RIGHT_ARROW)) {
    keyboardFocus = keyboardFocus >= 3 ? 0 : keyboardFocus + 1;
    return false;
  }

  if (hasAnswered && (keyCode === ENTER || key === " ")) {
    goToNextQuestion();
    return false;
  }

  if (key === " ") {
    return false;
  }

  return true;
}

// =====================================================
// 視窗尺寸與輔助函式
// =====================================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  layout = getQuizLayout();
}

function isPointInsideRect(
  pointX,
  pointY,
  centerX,
  centerY,
  rectWidth,
  rectHeight
) {
  return (
    pointX >= centerX - rectWidth / 2 &&
    pointX <= centerX + rectWidth / 2 &&
    pointY >= centerY - rectHeight / 2 &&
    pointY <= centerY + rectHeight / 2
  );
}

function preventDefaultTouchActions() {
  const canvasElement = document.querySelector("canvas");

  if (canvasElement) {
    canvasElement.style.touchAction = "none";
  }
}

// =====================================================
// p5.js CSV 選擇題測驗系統
// questions.csv 必須與 index.html、sketch.js 位於同一個資料夾。
// 中文：Cactus Classical Serif；英文與數字：Isometra。
// =====================================================

const CHINESE_FONT = "Cactus Classical Serif";
const LATIN_FONT = "Isometra";

const BACKGROUND_COLOR = "#F7F9FB";
const QUESTION_BOX_COLOR = "#BDE0FE";
const OPTION_COLOR = "#FFFFFF";
const OPTION_HOVER_COLOR = "#EAF4FC";
const CORRECT_COLOR = "#FFE381";
const WRONG_COLOR = "#C1121F";
const TEXT_COLOR = "#263238";
const SECONDARY_TEXT_COLOR = "#607D8B";
const BUTTON_COLOR = "#457B9D";
const BUTTON_HOVER_COLOR = "#35627D";
const BUTTON_TEXT_COLOR = "#FFFFFF";
const BORDER_COLOR = "#90AFC5";

const QUIZ_SIZE = 5;

let questionTable = null;
let questionBank = [];
let quizQuestions = [];
let tableLoadState = "loading";
let loadErrorMessage = "";

let currentQuestion = 0;
let score = 0;
let selectedOption = -1;
let hasAnswered = false;
let isFinished = false;
let layout = {};
let lastTouchTime = -1000;


// ------------------------------
// 題庫載入與資料驗證
// ------------------------------

function preload() {
  questionTable = loadTable(
    "questions.csv",
    "csv",
    "header",
    handleTableLoaded,
    handleTableLoadFailed
  );
}

function handleTableLoaded(table) {
  try {
    const requiredColumns = [
      "question",
      "option1",
      "option2",
      "option3",
      "option4",
      "answer"
    ];

    const columns = table.columns || [];
    const hasAllColumns = requiredColumns.every((columnName) =>
      columns.includes(columnName)
    );

    if (!hasAllColumns) {
      tableLoadState = "error";
      loadErrorMessage = "CSV 欄位不完整，必須包含 question、option1、option2、option3、option4、answer。";
      return;
    }

    for (let rowIndex = 0; rowIndex < table.getRowCount(); rowIndex += 1) {
      const row = table.getRow(rowIndex);
      const question = String(row.getString("question") || "").trim();
      const options = [
        String(row.getString("option1") || "").trim(),
        String(row.getString("option2") || "").trim(),
        String(row.getString("option3") || "").trim(),
        String(row.getString("option4") || "").trim()
      ];
      const answerText = String(row.getString("answer") || "").trim();
      const answer = Number(answerText);

      const validQuestion = question.length > 0;
      const validOptions = options.every((option) => option.length > 0);
      const validAnswer = Number.isInteger(answer) && answer >= 0 && answer <= 3;

      if (validQuestion && validOptions && validAnswer) {
        questionBank.push({
          question,
          options,
          answer
        });
      }
    }

    if (questionBank.length < QUIZ_SIZE) {
      tableLoadState = "error";
      loadErrorMessage = `有效題目不足 ${QUIZ_SIZE} 題，目前只有 ${questionBank.length} 題。`;
      return;
    }

    tableLoadState = "ready";
    startQuiz();
  } catch (error) {
    tableLoadState = "error";
    loadErrorMessage = "CSV 題庫內容無法解析，請檢查檔案格式。";
    console.error(error);
  }
}

function handleTableLoadFailed(error) {
  tableLoadState = "error";
  loadErrorMessage = "無法載入 questions.csv，請確認它與 index.html、sketch.js 位於同一個資料夾。";
  if (error) {
    console.error(error);
  }
}


// ------------------------------
// p5.js 生命週期
// ------------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  textWrap(WORD);
  layout = getQuizLayout();

  const canvasElement = document.querySelector("canvas");
  if (canvasElement) {
    canvasElement.style.touchAction = "none";
    canvasElement.style.display = "block";
  }

  if (tableLoadState === "ready" && quizQuestions.length === 0) {
    startQuiz();
  }
}

function draw() {
  background(BACKGROUND_COLOR);
  layout = getQuizLayout();

  if (tableLoadState === "loading") {
    drawLoadingScreen();
    return;
  }

  if (tableLoadState === "error") {
    drawErrorScreen();
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


// ------------------------------
// 響應式版面
// ------------------------------

function getQuizLayout() {
  const isMobile = width < 680;
  const margin = constrain(width * 0.055, 16, 58);
  const contentWidth = min(width - margin * 2, 1040);
  const titleTextSize = isMobile
    ? constrain(width * 0.065, 23, 37)
    : constrain(width * 0.043, 30, 52);
  const questionTextSize = isMobile
    ? constrain(width * 0.045, 17, 27)
    : constrain(width * 0.027, 21, 34);
  const optionTextSize = isMobile
    ? constrain(width * 0.039, 15, 23)
    : constrain(width * 0.021, 17, 27);
  const buttonTextSize = isMobile
    ? constrain(width * 0.041, 16, 23)
    : constrain(width * 0.019, 17, 25);

  const titleY = constrain(height * 0.085, 31, 61);
  const progressY = titleY + titleTextSize * 0.78;
  const fullScreenButtonWidth = isMobile ? 88 : 112;
  const fullScreenButtonHeight = isMobile ? 30 : 34;
  const questionHeight = isMobile
    ? constrain(height * 0.17, 92, 145)
    : constrain(height * 0.18, 120, 185);
  const questionY = max(
    titleY + titleTextSize * 0.82 + questionHeight * 0.55,
    height * 0.245
  );
  const nextButtonWidth = isMobile ? 154 : 190;
  const nextButtonHeight = isMobile ? 46 : 55;
  const nextButtonY = height - max(37, min(72, height * 0.085));
  const optionGap = isMobile ? constrain(height * 0.014, 8, 15) : 18;
  const optionColumns = isMobile ? 1 : 2;
  const optionRows = isMobile ? 4 : 2;
  const optionsStartY = questionY + questionHeight / 2 + (isMobile ? 20 : 26);
  const optionWidth = optionColumns === 1
    ? contentWidth
    : (contentWidth - optionGap) / 2;
  const preferredOptionHeight = isMobile
    ? constrain(height * 0.066, 42, 61)
    : constrain(height * 0.085, 53, 77);
  const availableHeight = nextButtonY - nextButtonHeight / 2 - optionsStartY - 18;
  const fittedOptionHeight = (availableHeight - optionGap * (optionRows - 1)) / optionRows;
  const optionHeight = max(36, min(preferredOptionHeight, fittedOptionHeight));
  const optionRects = [];

  for (let index = 0; index < 4; index += 1) {
    const row = optionColumns === 1 ? index : floor(index / 2);
    const column = optionColumns === 1 ? 0 : index % 2;
    const x = optionColumns === 1
      ? width / 2
      : width / 2 - (optionWidth + optionGap) / 2 + optionWidth / 2 + column * (optionWidth + optionGap);
    const y = optionsStartY + row * (optionHeight + optionGap);
    optionRects.push({ x, y, width: optionWidth, height: optionHeight });
  }

  return {
    isMobile,
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
    nextButtonX: width / 2,
    nextButtonY,
    nextButtonWidth,
    nextButtonHeight,
    optionGap,
    optionWidth,
    optionHeight,
    optionRects,
    fullScreenButtonX: width - margin - fullScreenButtonWidth / 2,
    fullScreenButtonY: fullScreenButtonHeight / 2 + 10,
    fullScreenButtonWidth,
    fullScreenButtonHeight
  };
}


// ------------------------------
// 螢幕狀態畫面
// ------------------------------

function drawLoadingScreen() {
  drawMixedText("正在載入題庫…", width / 2, height / 2 - 18, layout.questionTextSize, {
    alignX: CENTER,
    alignY: CENTER,
    fillColor: TEXT_COLOR
  });
  drawMixedText("請稍候", width / 2, height / 2 + 28, layout.optionTextSize, {
    alignX: CENTER,
    alignY: CENTER,
    fillColor: SECONDARY_TEXT_COLOR
  });
}

function drawErrorScreen() {
  drawMixedText("題庫載入失敗", width / 2, height * 0.34, layout.titleTextSize, {
    alignX: CENTER,
    alignY: CENTER,
    fillColor: WRONG_COLOR
  });
  drawWrappedMixedText(
    loadErrorMessage,
    width / 2,
    height * 0.49,
    min(layout.contentWidth * 0.9, 720),
    layout.optionTextSize,
    layout.optionTextSize * 1.45,
    { alignX: CENTER, alignY: CENTER, fillColor: TEXT_COLOR }
  );
  drawMixedText("請修正 CSV 後重新整理頁面", width / 2, height * 0.68, layout.optionTextSize, {
    alignX: CENTER,
    alignY: CENTER,
    fillColor: SECONDARY_TEXT_COLOR
  });
}


// ------------------------------
// 標題、題目與選項
// ------------------------------

function drawTitle() {
  drawMixedText("p5.js 程式設計測驗", width / 2, layout.titleY, layout.titleTextSize, {
    alignX: CENTER,
    alignY: CENTER,
    fillColor: TEXT_COLOR
  });

  drawMixedText(
    `${currentQuestion + 1} / ${quizQuestions.length}`,
    width / 2,
    layout.progressY,
    layout.titleTextSize * 0.48,
    { alignX: CENTER, alignY: CENTER, fillColor: SECONDARY_TEXT_COLOR }
  );

  drawFullScreenButton();
}

function drawQuestion() {
  const currentData = quizQuestions[currentQuestion];

  push();
  fill(QUESTION_BOX_COLOR);
  stroke(BORDER_COLOR);
  strokeWeight(2);
  rect(width / 2, layout.questionY, layout.contentWidth, layout.questionHeight, 18);
  pop();

  drawWrappedMixedText(
    currentData.question,
    width / 2,
    layout.questionY,
    layout.contentWidth * 0.86,
    layout.questionTextSize,
    layout.questionTextSize * 1.35,
    { alignX: CENTER, alignY: CENTER, fillColor: TEXT_COLOR }
  );
}

function drawOptions() {
  const currentData = quizQuestions[currentQuestion];

  currentData.options.forEach((optionText, index) => {
    const baseRect = layout.optionRects[index];
    let animatedX = baseRect.x;
    let animatedY = baseRect.y;

    if (hasAnswered && index === currentData.answer) {
      animatedY += sin(frameCount * 0.16) * 7;
    }

    if (hasAnswered && selectedOption !== currentData.answer && index === selectedOption) {
      animatedX += sin(frameCount * 0.38) * 11;
    }

    const hovering = isPointInsideRect(
      mouseX,
      mouseY,
      animatedX,
      animatedY,
      baseRect.width,
      baseRect.height
    );

    let backgroundColor = OPTION_COLOR;
    if (!hasAnswered && hovering) {
      backgroundColor = OPTION_HOVER_COLOR;
    }
    if (hasAnswered && index === currentData.answer) {
      backgroundColor = CORRECT_COLOR;
    }
    if (hasAnswered && index === selectedOption && selectedOption !== currentData.answer) {
      backgroundColor = WRONG_COLOR;
    }

    push();
    fill(backgroundColor);
    stroke(BORDER_COLOR);
    strokeWeight(2);
    rect(animatedX, animatedY, baseRect.width, baseRect.height, 14);
    pop();

    const optionTextColor = hasAnswered && index === selectedOption && selectedOption !== currentData.answer
      ? "#FFFFFF"
      : TEXT_COLOR;

    drawWrappedMixedText(
      optionText,
      animatedX,
      animatedY,
      baseRect.width * 0.84,
      layout.optionTextSize,
      layout.optionTextSize * 1.25,
      { alignX: CENTER, alignY: CENTER, fillColor: optionTextColor }
    );
  });
}

function drawNextButton() {
  const hovering = isPointInsideRect(
    mouseX,
    mouseY,
    layout.nextButtonX,
    layout.nextButtonY,
    layout.nextButtonWidth,
    layout.nextButtonHeight
  );
  const buttonColor = hovering ? BUTTON_HOVER_COLOR : BUTTON_COLOR;

  push();
  fill(buttonColor);
  noStroke();
  rect(layout.nextButtonX, layout.nextButtonY, layout.nextButtonWidth, layout.nextButtonHeight, 15);
  pop();

  drawMixedText(
    hasAnswered ? (currentQuestion === quizQuestions.length - 1 ? "查看分數" : "下一題") : "請先選擇答案",
    layout.nextButtonX,
    layout.nextButtonY,
    layout.buttonTextSize,
    { alignX: CENTER, alignY: CENTER, fillColor: BUTTON_TEXT_COLOR }
  );
}

function drawFullScreenButton() {
  const hovering = isPointInsideRect(
    mouseX,
    mouseY,
    layout.fullScreenButtonX,
    layout.fullScreenButtonY,
    layout.fullScreenButtonWidth,
    layout.fullScreenButtonHeight
  );

  push();
  fill(hovering ? BUTTON_HOVER_COLOR : BUTTON_COLOR);
  noStroke();
  rect(
    layout.fullScreenButtonX,
    layout.fullScreenButtonY,
    layout.fullScreenButtonWidth,
    layout.fullScreenButtonHeight,
    10
  );
  pop();

  drawMixedText("全螢幕", layout.fullScreenButtonX, layout.fullScreenButtonY, layout.isMobile ? 14 : 16, {
    alignX: CENTER,
    alignY: CENTER,
    fillColor: BUTTON_TEXT_COLOR
  });
}


// ------------------------------
// 結束畫面
// ------------------------------

function drawFinishScreen() {
  const percentage = Math.round((score / quizQuestions.length) * 100);

  drawMixedText("測驗完成！", width / 2, height * 0.24, layout.titleTextSize * 1.15, {
    alignX: CENTER,
    alignY: CENTER,
    fillColor: TEXT_COLOR
  });

  drawMixedText(`答對 ${score} / ${quizQuestions.length} 題`, width / 2, height * 0.40, layout.questionTextSize, {
    alignX: CENTER,
    alignY: CENTER,
    fillColor: TEXT_COLOR
  });

  drawMixedText(`${percentage}%`, width / 2, height * 0.53, layout.titleTextSize * 1.35, {
    alignX: CENTER,
    alignY: CENTER,
    fillColor: BUTTON_COLOR
  });

  const restartWidth = layout.isMobile ? 178 : 220;
  const restartHeight = layout.isMobile ? 50 : 59;
  const restartY = height * 0.72;
  const hovering = isPointInsideRect(mouseX, mouseY, width / 2, restartY, restartWidth, restartHeight);

  push();
  fill(hovering ? BUTTON_HOVER_COLOR : BUTTON_COLOR);
  noStroke();
  rect(width / 2, restartY, restartWidth, restartHeight, 15);
  pop();

  drawMixedText("重新開始", width / 2, restartY, layout.buttonTextSize, {
    alignX: CENTER,
    alignY: CENTER,
    fillColor: BUTTON_TEXT_COLOR
  });

  drawMixedText("按 R 也可以重新開始", width / 2, height * 0.84, layout.optionTextSize * 0.82, {
    alignX: CENTER,
    alignY: CENTER,
    fillColor: SECONDARY_TEXT_COLOR
  });
}


// ------------------------------
// 輸入操作：滑鼠、觸控、鍵盤
// ------------------------------

function mousePressed() {
  if (millis() - lastTouchTime < 500) {
    return false;
  }
  handleInput(mouseX, mouseY);
  return false;
}

function touchStarted() {
  lastTouchTime = millis();
  const touchX = touches.length > 0 ? touches[0].x : mouseX;
  const touchY = touches.length > 0 ? touches[0].y : mouseY;
  handleInput(touchX, touchY);
  return false;
}

function handleInput(inputX, inputY) {
  if (tableLoadState !== "ready") {
    return;
  }

  if (isFinished) {
    const restartY = height * 0.72;
    const restartWidth = layout.isMobile ? 178 : 220;
    const restartHeight = layout.isMobile ? 50 : 59;
    if (isPointInsideRect(inputX, inputY, width / 2, restartY, restartWidth, restartHeight)) {
      restartQuiz();
    }
    return;
  }

  if (isPointInsideRect(
    inputX,
    inputY,
    layout.fullScreenButtonX,
    layout.fullScreenButtonY,
    layout.fullScreenButtonWidth,
    layout.fullScreenButtonHeight
  )) {
    toggleFullscreen();
    return;
  }

  if (!hasAnswered) {
    layout.optionRects.forEach((optionRect, index) => {
      if (isPointInsideRect(inputX, inputY, optionRect.x, optionRect.y, optionRect.width, optionRect.height)) {
        selectOption(index);
      }
    });
  }

  if (isPointInsideRect(
    inputX,
    inputY,
    layout.nextButtonX,
    layout.nextButtonY,
    layout.nextButtonWidth,
    layout.nextButtonHeight
  ) && hasAnswered) {
    goToNextQuestion();
  }
}

function keyPressed() {
  if (key === "f" || key === "F") {
    toggleFullscreen();
    return false;
  }

  if (tableLoadState !== "ready") {
    return false;
  }

  if (isFinished) {
    if (key === "r" || key === "R" || keyCode === ENTER) {
      restartQuiz();
    }
    return false;
  }

  if (!hasAnswered) {
    const keyOptions = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
    const pressedKey = String(key).toLowerCase();
    if (Object.prototype.hasOwnProperty.call(keyOptions, pressedKey)) {
      selectOption(keyOptions[pressedKey]);
      return false;
    }
  }

  if (hasAnswered && (keyCode === ENTER || key === " ")) {
    goToNextQuestion();
    return false;
  }

  return false;
}

function selectOption(optionIndex) {
  if (hasAnswered || optionIndex < 0 || optionIndex > 3) {
    return;
  }

  selectedOption = optionIndex;
  hasAnswered = true;
  if (selectedOption === quizQuestions[currentQuestion].answer) {
    score += 1;
  }
}

function goToNextQuestion() {
  if (!hasAnswered) {
    return;
  }

  if (currentQuestion < quizQuestions.length - 1) {
    currentQuestion += 1;
    selectedOption = -1;
    hasAnswered = false;
  } else {
    isFinished = true;
  }
}


// ------------------------------
// 抽樣與重新開始
// ------------------------------

function startQuiz() {
  if (questionBank.length < QUIZ_SIZE) {
    tableLoadState = "error";
    loadErrorMessage = `有效題目不足 ${QUIZ_SIZE} 題，無法開始測驗。`;
    return;
  }

  const shuffledIndexes = questionBank.map((_, index) => index);
  fisherYatesShuffle(shuffledIndexes);
  quizQuestions = shuffledIndexes
    .slice(0, QUIZ_SIZE)
    .map((index) => questionBank[index]);

  currentQuestion = 0;
  score = 0;
  selectedOption = -1;
  hasAnswered = false;
  isFinished = false;
}

function restartQuiz() {
  if (tableLoadState === "ready") {
    startQuiz();
  }
}

function fisherYatesShuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = floor(random(index + 1));
    const temporary = items[index];
    items[index] = items[swapIndex];
    items[swapIndex] = temporary;
  }
  return items;
}


// ------------------------------
// 字型與文字繪製
// ------------------------------

function isChineseCharacter(character) {
  return /[\u3400-\u9FFF\uF900-\uFAFF]/.test(character);
}

function setFontForCharacter(character) {
  textFont(isChineseCharacter(character) ? CHINESE_FONT : LATIN_FONT);
}

function measureMixedTextWidth(content, size) {
  const characters = Array.from(String(content));
  let totalWidth = 0;
  textSize(size);
  characters.forEach((character) => {
    setFontForCharacter(character);
    totalWidth += textWidth(character);
  });
  return totalWidth;
}

function drawMixedText(content, x, y, size, options = {}) {
  const alignX = options.alignX === undefined ? CENTER : options.alignX;
  const alignY = options.alignY === undefined ? CENTER : options.alignY;
  const fillColor = options.fillColor === undefined ? TEXT_COLOR : options.fillColor;
  const characters = Array.from(String(content));
  const widths = [];

  textSize(size);
  characters.forEach((character) => {
    setFontForCharacter(character);
    widths.push(textWidth(character));
  });

  const totalWidth = widths.reduce((total, characterWidth) => total + characterWidth, 0);
  let currentX = x;
  if (alignX === CENTER) {
    currentX -= totalWidth / 2;
  } else if (alignX === RIGHT) {
    currentX -= totalWidth;
  }

  push();
  textAlign(LEFT, alignY);
  textSize(size);
  fill(fillColor);
  noStroke();
  characters.forEach((character, index) => {
    setFontForCharacter(character);
    text(character, currentX, y);
    currentX += widths[index];
  });
  pop();
}

function wrapTextLines(content, maxWidth, size) {
  const characters = Array.from(String(content));
  const lines = [];
  let currentLine = "";

  characters.forEach((character) => {
    if (character === "\n") {
      lines.push(currentLine);
      currentLine = "";
      return;
    }

    const candidate = currentLine + character;
    if (currentLine.length > 0 && measureMixedTextWidth(candidate, size) > maxWidth) {
      lines.push(currentLine);
      currentLine = character;
    } else {
      currentLine = candidate;
    }
  });

  if (currentLine.length > 0 || lines.length === 0) {
    lines.push(currentLine);
  }
  return lines;
}

function drawWrappedMixedText(content, x, y, maxWidth, size, lineHeight, options = {}) {
  const alignX = options.alignX === undefined ? CENTER : options.alignX;
  const alignY = options.alignY === undefined ? CENTER : options.alignY;
  const fillColor = options.fillColor === undefined ? TEXT_COLOR : options.fillColor;
  const lines = wrapTextLines(content, maxWidth, size);
  const totalHeight = lines.length * lineHeight;
  let firstY = y - totalHeight / 2 + lineHeight / 2;

  lines.forEach((line) => {
    drawMixedText(line, x, firstY, size, { alignX, alignY, fillColor });
    firstY += lineHeight;
  });
}


// ------------------------------
// 其他輔助函式
// ------------------------------

function isPointInsideRect(pointX, pointY, centerX, centerY, rectWidth, rectHeight) {
  return pointX >= centerX - rectWidth / 2 &&
    pointX <= centerX + rectWidth / 2 &&
    pointY >= centerY - rectHeight / 2 &&
    pointY <= centerY + rectHeight / 2;
}

function toggleFullscreen() {
  fullscreen(!fullscreen());
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  layout = getQuizLayout();
}

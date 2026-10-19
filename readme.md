---
title: 選擇題測驗卷網站講義（學生版）.md

---

---
title: 選擇題測驗卷網站講義（學生版）

---

---
title: 選擇題測驗卷網站講義（學生版）
tags: [114程式設計與實習_上學期]

---

# 選擇題測驗卷網站講義（學生版）

學號：＿＿＿＿＿＿＿＿　　姓名：＿＿＿＿＿＿＿＿

> **填寫方式**
> 1. 每個學習都要放：**執行截圖**、**三次問 AI 的提示詞**、**最後採用的程式碼**。
> 2. 問 AI 的提示詞請**逐字貼上**自己實際輸入的內容（不要寫摘要），第一次、第二次、第三次依序記錄。
> 3. 程式碼貼在「點開貼上」的收合區塊裡，貼上**你最後真正採用、而且能執行**的版本。

---

## 學習1：產生一個選擇題測驗卷網站

https://cfchen58.synology.me/115/week4/stage1/

**這個階段的目標：** 用 p5.js 做出一個一次顯示一題、四個選項、答完會顯示對錯與總分的測驗網站（題目先寫在程式裡）。
**這個階段會修改的檔案：** index.html、sketch.js

### 執行截圖

（把截圖拖曳到這裡，或貼上圖片連結）
![20261008](https://hackmd.io/_uploads/BktYc2Nofg.gif)

![學習1截圖](請貼上截圖)
![螢幕擷取畫面 2026-10-08 143344](https://hackmd.io/_uploads/SkNtYhVjze.png)

### 第一次問 AI

```tex!
使用p5.js撰寫選擇題網頁測驗系統 我已經產生一個p5.js專案 請把程式碼寫到sketch.js檔案內 每條指令都須加上中文註解 測驗系統題目設定為五題 測驗題目的內容為程式設計p5.js簡易指令練習測驗 系統採用全螢幕畫布 使用著答錯時 系統會在正確答案選項上 加上FFE381背景顏色 該選項要上下跳動 答錯的選項採用c1121f背景顏色 選項左右移動 選擇題選項共有四個選項 當五題結束後需要顯示答對的題數 每次顯示一個題目 需要有下一題的按鈕


```

### 第二次問 AI

```tex!
題目的顯示到整個視窗畫布的右邊 造成無法全部都正確顯示 題目請顯示在整個視窗得中間 並加上方框 方框得背景顏色為bde0fe

編輯
刪除

```

### 第三次問 AI

```tex!
（逐字貼上你第三次問 AI 的提示詞）
```

### 程式碼內容

:::info
:::spoiler 點開貼上學習1的程式碼
```javascript=
//學習1程式碼所在
// 宣告目前題目的索引值
let currentQuestion = 0;

// 宣告使用者答對的題數
let score = 0;

// 宣告使用者目前選擇的選項索引值
let selectedOption = -1;

// 宣告使用者是否已經作答
let hasAnswered = false;

// 宣告測驗是否已經結束
let isFinished = false;

// 宣告按鈕的座標與尺寸
let nextButton = { x: 0, y: 0, w: 180, h: 55 };

// 宣告重新測驗按鈕的座標與尺寸
let restartButton = { x: 0, y: 0, w: 220, h: 60 };

// 宣告黃色正確答案顏色
const CORRECT_COLOR = "#FFE381";

// 宣告紅色錯誤答案顏色
const WRONG_COLOR = "#C1121F";

// 宣告深色文字顏色
const TEXT_COLOR = "#263238";

// 宣告背景顏色
const BACKGROUND_COLOR = "#F4F7F9";

// 建立五題 p5.js 程式設計選擇題
const questions = [
  {
    question: "在 p5.js 中，哪一個函式會在程式開始時執行一次？",
    options: ["draw()", "setup()", "start()", "begin()"],
    answer: 1
  },
  {
    question: "在 p5.js 中，哪一個函式會持續重複執行？",
    options: ["loop()", "repeat()", "draw()", "update()"],
    answer: 2
  },
  {
    question: "下列哪一個指令可以設定畫布大小？",
    options: ["canvas(400, 300)", "size(400, 300)", "createCanvas(400, 300)", "setCanvas(400, 300)"],
    answer: 2
  },
  {
    question: "在 p5.js 中，哪一個指令可以繪製圓形？",
    options: ["circle()", "ellipse()", "round()", "oval()"],
    answer: 1
  },
  {
    question: "下列哪一個指令可以設定背景顏色？",
    options: ["background()", "bgColor()", "colorBackground()", "setBackground()"],
    answer: 0
  }
];

// p5.js 初始化函式
function setup() {
  // 建立符合瀏覽器視窗大小的畫布
  createCanvas(windowWidth, windowHeight);

  // 設定文字使用置中對齊
  textAlign(CENTER, CENTER);

  // 設定矩形繪製模式為以中心點定位
  rectMode(CENTER);

  // 設定畫布支援觸控操作
  touchStarted();
}

// p5.js 每一幀執行一次的函式
function draw() {
  // 設定畫布背景顏色
  background(BACKGROUND_COLOR);

  // 判斷測驗是否已結束
  if (isFinished) {
    // 顯示測驗結束畫面
    drawFinishScreen();

    // 結束本次繪圖流程
    return;
  }

  // 顯示測驗標題
  drawTitle();

  // 顯示目前題目
  drawQuestion();

  // 顯示四個選項
  drawOptions();

  // 顯示下一題按鈕
  drawNextButton();
}

// 顯示測驗標題
function drawTitle() {
  // 設定標題文字顏色
  fill(TEXT_COLOR);

  // 移除文字外框
  noStroke();

  // 設定標題文字大小
  textSize(min(width * 0.06, 42));

  // 顯示標題文字
  text("p5.js 程式設計簡易測驗", width / 2, height * 0.08);

  // 設定進度文字大小
  textSize(min(width * 0.03, 22));

  // 顯示目前答題進度
  text("第 " + (currentQuestion + 1) + " 題／共 " + questions.length + " 題", width / 2, height * 0.145);
}

// 顯示目前題目
function drawQuestion() {
  // 取得目前題目的資料
  const questionData = questions[currentQuestion];

  // 計算題目區塊的寬度
  const questionWidth = min(width * 0.88, 900);

  // 設定題目區塊填滿顏色
  fill("#FFFFFF");

  // 設定題目區塊外框顏色
  stroke("#D8E0E5");

  // 設定題目區塊外框粗細
  strokeWeight(2);

  // 繪製題目區塊
  rect(width / 2, height * 0.25, questionWidth, 110, 18);

  // 移除文字外框
  noStroke();

  // 設定題目文字顏色
  fill(TEXT_COLOR);

  // 設定題目文字大小
  textSize(min(width * 0.035, 27));

  // 顯示題目文字
  text(questionData.question, width / 2, height * 0.25);
}

// 顯示選項
function drawOptions() {
  // 取得目前題目的資料
  const questionData = questions[currentQuestion];

  // 計算選項區塊寬度
  const optionWidth = min(width * 0.82, 760);

  // 計算選項區塊高度
  const optionHeight = min(height * 0.085, 62);

  // 計算選項之間的間距
  const optionGap = min(height * 0.025, 20);

  // 計算第一個選項的垂直位置
  const firstY = height * 0.40;

  // 逐一繪製四個選項
  for (let i = 0; i < questionData.options.length; i++) {
    // 設定選項的基本水平位置
    let optionX = width / 2;

    // 設定選項的基本垂直位置
    let optionY = firstY + i * (optionHeight + optionGap);

    // 判斷是否已經作答
    if (hasAnswered) {
      // 判斷目前選項是否為正確答案
      if (i === questionData.answer) {
        // 讓正確答案上下跳動
        optionY += sin(frameCount * 0.12) * 10;
      }

      // 判斷目前選項是否為使用者答錯的選項
      if (i === selectedOption && selectedOption !== questionData.answer) {
        // 讓錯誤選項左右移動
        optionX += sin(frameCount * 0.25) * 12;
      }
    }

    // 設定未作答時的選項背景顏色
    let optionColor = "#FFFFFF";

    // 判斷目前選項是否為已選擇的選項
    if (hasAnswered && i === questionData.answer) {
      // 將正確答案設定為淡黃色
      optionColor = CORRECT_COLOR;
    }

    // 判斷目前選項是否為答錯的選項
    if (hasAnswered && i === selectedOption && selectedOption !== questionData.answer) {
      // 將錯誤選項設定為紅色
      optionColor = WRONG_COLOR;
    }

    // 設定選項背景顏色
    fill(optionColor);

    // 設定選項外框顏色
    stroke("#B8C4CA");

    // 設定選項外框粗細
    strokeWeight(2);

    // 繪製選項區塊
    rect(optionX, optionY, optionWidth, optionHeight, 14);

    // 移除文字外框
    noStroke();

    // 判斷目前選項是否為錯誤選項
    if (hasAnswered && i === selectedOption && selectedOption !== questionData.answer) {
      // 設定錯誤選項文字為白色
      fill("#FFFFFF");
    } else {
      // 設定一般選項文字為深色
      fill(TEXT_COLOR);
    }

    // 設定選項文字大小
    textSize(min(width * 0.028, 22));

    // 建立選項顯示文字
    const optionText = String.fromCharCode(65 + i) + ". " + questionData.options[i];

    // 顯示選項文字
    text(optionText, optionX, optionY);
  }
}

// 顯示下一題按鈕
function drawNextButton() {
  // 判斷使用者是否尚未作答
  if (!hasAnswered) {
    // 不顯示下一題按鈕
    return;
  }

  // 計算下一題按鈕的水平位置
  nextButton.x = width / 2;

  // 計算下一題按鈕的垂直位置
  nextButton.y = height * 0.91;

  // 設定按鈕背景顏色
  fill("#1976D2");

  // 設定按鈕外框顏色
  stroke("#125A9C");

  // 設定按鈕外框粗細
  strokeWeight(2);

  // 繪製下一題按鈕
  rect(nextButton.x, nextButton.y, nextButton.w, nextButton.h, 14);

  // 移除文字外框
  noStroke();

  // 設定按鈕文字顏色
  fill("#FFFFFF");

  // 設定按鈕文字大小
  textSize(22);

  // 判斷目前是否為最後一題
  if (currentQuestion === questions.length - 1) {
    // 顯示查看結果文字
    text("查看結果", nextButton.x, nextButton.y);
  } else {
    // 顯示下一題文字
    text("下一題", nextButton.x, nextButton.y);
  }
}

// 顯示測驗結束畫面
function drawFinishScreen() {
  // 設定結果標題文字顏色
  fill(TEXT_COLOR);

  // 移除文字外框
  noStroke();

  // 設定結果標題文字大小
  textSize(min(width * 0.08, 56));

  // 顯示測驗完成文字
  text("測驗完成！", width / 2, height * 0.28);

  // 設定答題結果文字大小
  textSize(min(width * 0.065, 46));

  // 顯示答對題數
  text("你答對了 " + score + "／" + questions.length + " 題", width / 2, height * 0.43);

  // 設定鼓勵文字大小
  textSize(min(width * 0.035, 26));

  // 判斷答對題數
  if (score === questions.length) {
    // 顯示滿分鼓勵文字
    text("太厲害了！全部答對！", width / 2, height * 0.53);
  } else if (score >= 3) {
    // 顯示良好成績鼓勵文字
    text("表現很好，繼續加油！", width / 2, height * 0.53);
  } else {
    // 顯示繼續練習鼓勵文字
    text("再多練習幾次，你一定會進步！", width / 2, height * 0.53);
  }

  // 設定重新測驗按鈕水平位置
  restartButton.x = width / 2;

  // 設定重新測驗按鈕垂直位置
  restartButton.y = height * 0.70;

  // 設定重新測驗按鈕背景顏色
  fill("#1976D2");

  // 設定重新測驗按鈕外框顏色
  stroke("#125A9C");

  // 設定重新測驗按鈕外框粗細
  strokeWeight(2);

  // 繪製重新測驗按鈕
  rect(restartButton.x, restartButton.y, restartButton.w, restartButton.h, 14);

  // 移除文字外框
  noStroke();

  // 設定重新測驗按鈕文字顏色
  fill("#FFFFFF");

  // 設定重新測驗按鈕文字大小
  textSize(24);

  // 顯示重新測驗文字
  text("重新測驗", restartButton.x, restartButton.y);
}

// 處理滑鼠按下事件
function mousePressed() {
  // 呼叫滑鼠點擊處理函式
  handleInput(mouseX, mouseY);

  // 回傳 false 以避免瀏覽器預設行為
  return false;
}

// 處理觸控開始事件
function touchStarted() {
  // 判斷是否有觸控座標
  if (touches.length > 0) {
    // 取得第一個觸控點的水平座標
    const touchX = touches[0].x;

    // 取得第一個觸控點的垂直座標
    const touchY = touches[0].y;

    // 處理觸控輸入
    handleInput(touchX, touchY);
  }

  // 回傳 false 以避免頁面捲動
  return false;
}

// 處理使用者點擊或觸控輸入
function handleInput(inputX, inputY) {
  // 判斷測驗是否已結束
  if (isFinished) {
    // 判斷是否點擊重新測驗按鈕
    if (isInsideButton(inputX, inputY, restartButton)) {
      // 重新開始測驗
      restartQuiz();
    }

    // 結束輸入處理
    return;
  }

  // 判斷使用者是否已經作答
  if (!hasAnswered) {
    // 檢查使用者是否點擊某個選項
    const clickedOption = getClickedOption(inputX, inputY);

    // 判斷是否有點擊選項
    if (clickedOption !== -1) {
      // 記錄使用者選擇的選項
      selectedOption = clickedOption;

      // 設定作答狀態為已作答
      hasAnswered = true;

      // 判斷使用者是否答對
      if (selectedOption === questions[currentQuestion].answer) {
        // 答對題數加一
        score++;
      }
    }

    // 結束輸入處理
    return;
  }

  // 判斷是否點擊下一題按鈕
  if (isInsideButton(inputX, inputY, nextButton)) {
    // 判斷目前是否為最後一題
    if (currentQuestion === questions.length - 1) {
      // 設定測驗完成狀態
      isFinished = true;
    } else {
      // 前往下一題
      currentQuestion++;

      // 清除選項選擇狀態
      selectedOption = -1;

      // 設定作答狀態為尚未作答
      hasAnswered = false;
    }
  }
}

// 判斷點擊位置是否位於選項內
function getClickedOption(inputX, inputY) {
  // 計算選項區塊寬度
  const optionWidth = min(width * 0.82, 760);

  // 計算選項區塊高度
  const optionHeight = min(height * 0.085, 62);

  // 計算選項之間的間距
  const optionGap = min(height * 0.025, 20);

  // 計算第一個選項的垂直位置
  const firstY = height * 0.40;

  // 逐一檢查四個選項
  for (let i = 0; i < questions[currentQuestion].options.length; i++) {
    // 計算目前選項的垂直位置
    const optionY = firstY + i * (optionHeight + optionGap);

    // 判斷點擊位置是否在目前選項內
    if (
      inputX >= width / 2 - optionWidth / 2 &&
      inputX <= width / 2 + optionWidth / 2 &&
      inputY >= optionY - optionHeight / 2 &&
      inputY <= optionY + optionHeight / 2
    ) {
      // 回傳被點擊的選項索引值
      return i;
    }
  }

  // 沒有點擊任何選項時回傳 -1
  return -1;
}

// 判斷點擊位置是否位於按鈕內
function isInsideButton(inputX, inputY, button) {
  // 判斷水平位置是否在按鈕範圍內
  const insideX = inputX >= button.x - button.w / 2 && inputX <= button.x + button.w / 2;

  // 判斷垂直位置是否在按鈕範圍內
  const insideY = inputY >= button.y - button.h / 2 && inputY <= button.y + button.h / 2;

  // 回傳水平與垂直條件是否都成立
  return insideX && insideY;
}

// 處理鍵盤按鍵事件
function keyPressed() {
  // 判斷使用者是否尚未作答
  if (!hasAnswered && !isFinished) {
    // 將鍵盤數字轉換成選項索引值
    const keyIndex = int(key) - 1;

    // 判斷按鍵是否對應四個選項
    if (keyIndex >= 0 && keyIndex < 4) {
      // 記錄使用者選擇的選項
      selectedOption = keyIndex;

      // 設定作答狀態為已作答
      hasAnswered = true;

      // 判斷使用者是否答對
      if (selectedOption === questions[currentQuestion].answer) {
        // 答對題數加一
        score++;
      }
    }
  } else if (hasAnswered && !isFinished && keyCode === ENTER) {
    // 按下 Enter 鍵時進入下一題
    if (currentQuestion === questions.length - 1) {
      // 設定測驗完成狀態
      isFinished = true;
    } else {
      // 前往下一題
      currentQuestion++;

      // 清除選項選擇狀態
      selectedOption = -1;

      // 設定作答狀態為尚未作答
      hasAnswered = false;
    }
  } else if (isFinished && keyCode === ENTER) {
    // 測驗結束時按下 Enter 鍵重新開始
    restartQuiz();
  }

  // 回傳 false 以避免瀏覽器預設行為
  return false;
}

// 重新開始測驗
function restartQuiz() {
  // 將目前題目重設為第一題
  currentQuestion = 0;

  // 將答對題數歸零
  score = 0;

  // 清除選項選擇狀態
  selectedOption = -1;

  // 設定作答狀態為尚未作答
  hasAnswered = false;

  // 設定測驗為進行中
  isFinished = false;
}

// 當瀏覽器視窗尺寸改變時執行
function windowResized() {
  // 重新調整畫布尺寸
  resizeCanvas(windowWidth, windowHeight);
}
```
:::


---

## 學習2：網頁設定為響應式網頁

https://cfchen58.synology.me/115/week4/stage2/

**這個階段的目標：** 讓網站在電腦、平板、手機（直向與橫向）都能正常顯示，視窗大小改變時版面自動調整。
**這個階段會修改的檔案：** index.html、sketch.js

### 執行截圖

（把截圖拖曳到這裡，或貼上圖片連結）

![學習2截圖](請貼上截圖)
![螢幕擷取畫面 2026-10-08 150014](https://hackmd.io/_uploads/SyPoJ6NjGx.png)

### 第一次問 AI

```tex!
網頁設定為響應式網頁 主要是要讓網站在電腦平板手機 (直向與橫向)都能正常顯示 視窗大小改變時版面自動調整
```

### 第二次問 AI

```tex!
（逐字貼上你第二次問 AI 的提示詞）
```

### 第三次問 AI

```tex!
（逐字貼上你第三次問 AI 的提示詞）
```

### 程式碼內容

:::info
:::spoiler 點開貼上學習2的程式碼
```javascript=
//學習2程式碼所在
// 宣告目前題目索引
let currentQuestion = 0; // 儲存目前顯示的題目編號

// 宣告答對題數
let score = 0; // 儲存使用者答對的題目數量

// 宣告選取的選項
let selectedOption = -1; // -1 代表尚未選擇任何選項

// 宣告是否已經作答
let hasAnswered = false; // 記錄目前題目是否已經回答

// 宣告測驗是否結束
let isFinished = false; // 記錄測驗是否已經完成

// 宣告目前版面資料
let layout = {}; // 儲存所有響應式版面座標與尺寸

// 宣告正確答案顏色
const CORRECT_COLOR = "#FFE381"; // 設定正確答案背景顏色

// 宣告錯誤答案顏色
const WRONG_COLOR = "#C1121F"; // 設定錯誤答案背景顏色

// 宣告題目方框顏色
const QUESTION_BOX_COLOR = "#BDE0FE"; // 設定題目方框背景顏色

// 宣告畫布背景顏色
const BACKGROUND_COLOR = "#F4F7F9"; // 設定畫布背景顏色

// 宣告主要文字顏色
const TEXT_COLOR = "#263238"; // 設定一般文字顏色

// 建立測驗題目資料
const questions = [
  {
    question: "在 p5.js 中，哪一個函式會在程式開始時執行一次？",
    options: ["draw()", "setup()", "start()", "begin()"],
    answer: 1
  },
  {
    question: "在 p5.js 中，哪一個函式會持續重複執行？",
    options: ["loop()", "repeat()", "draw()", "update()"],
    answer: 2
  },
  {
    question: "下列哪一個指令可以設定畫布大小？",
    options: [
      "canvas(400, 300)",
      "size(400, 300)",
      "createCanvas(400, 300)",
      "setCanvas(400, 300)"
    ],
    answer: 2
  },
  {
    question: "在 p5.js 中，哪一個指令可以繪製圓形？",
    options: ["circle()", "ellipse()", "round()", "oval()"],
    answer: 1
  },
  {
    question: "下列哪一個指令可以設定背景顏色？",
    options: [
      "background()",
      "bgColor()",
      "colorBackground()",
      "setBackground()"
    ],
    answer: 0
  }
];

// p5.js 初始化函式
function setup() {
  // 建立符合瀏覽器大小的畫布
  createCanvas(windowWidth, windowHeight);

  // 設定文字水平置中
  textAlign(CENTER, CENTER);

  // 設定矩形以中心點方式繪製
  rectMode(CENTER);

  // 設定文字換行模式
  textWrap(WORD);

  // 計算響應式版面
  layout = getQuizLayout();
}

// p5.js 每一幀執行一次
function draw() {
  // 設定畫布背景
  background(BACKGROUND_COLOR);

  // 重新計算目前版面
  layout = getQuizLayout();

  // 判斷測驗是否完成
  if (isFinished) {
    // 顯示測驗完成畫面
    drawFinishScreen();

    // 結束本次繪圖
    return;
  }

  // 顯示測驗標題
  drawTitle();

  // 顯示題目方框
  drawQuestion();

  // 顯示選項
  drawOptions();

  // 顯示下一題按鈕
  drawNextButton();
}

// 計算響應式版面
function getQuizLayout() {
  // 取得畫布寬度
  const canvasWidth = width;

  // 取得畫布高度
  const canvasHeight = height;

  // 取得畫布最短邊
  const shortestSide = min(canvasWidth, canvasHeight);

  // 判斷是否為窄版手機畫面
  const isNarrow = canvasWidth < 600;

  // 判斷是否為橫向矮畫面
  const isShort = canvasHeight < 560;

  // 設定安全邊界
  const margin = constrain(shortestSide * 0.06, 14, 42);

  // 設定標題字體大小
  const titleSize = constrain(shortestSide * 0.075, 22, 42);

  // 設定進度字體大小
  const progressSize = constrain(shortestSide * 0.037, 14, 22);

  // 設定題目字體大小
  const questionSize = constrain(shortestSide * 0.045, 16, 27);

  // 設定選項字體大小
  const optionSize = constrain(shortestSide * 0.037, 15, 22);

  // 設定按鈕字體大小
  const buttonSize = constrain(shortestSide * 0.04, 16, 23);

  // 設定題目卡片寬度
  const questionWidth = min(canvasWidth - margin * 2, 920);

  // 設定題目卡片內距
  const questionPadding = constrain(shortestSide * 0.05, 16, 38);

  // 設定題目文字最大寬度
  const questionTextWidth = questionWidth - questionPadding * 2;

  // 設定題目文字大小
  textSize(questionSize);

  // 將題目文字自動換行
  const questionLines = wrapTextByWidth(
    questions[currentQuestion].question,
    questionTextWidth
  );

  // 計算題目每一行高度
  const questionLineHeight = questionSize * 1.35;

  // 計算題目文字總高度
  const questionTextHeight = questionLines.length * questionLineHeight;

  // 設定題目卡片高度
  const questionHeight = max(
    questionTextHeight + questionPadding * 2,
    isShort ? 82 : 110
  );

  // 設定標題區域位置
  const titleY = max(28, canvasHeight * 0.075);

  // 設定進度文字位置
  const progressY = titleY + titleSize * 0.75;

  // 設定題目卡片位置
  const questionY = progressY + progressSize + questionHeight * 0.58;

  // 設定內容起始位置
  const contentTop = questionY + questionHeight / 2;

  // 設定選項間距
  const optionGap = constrain(
    isShort ? shortestSide * 0.018 : shortestSide * 0.028,
    8,
    22
  );

  // 設定選項高度
  const optionHeight = constrain(
    isShort ? canvasHeight * 0.08 : canvasHeight * 0.072,
    42,
    64
  );

  // 設定選項寬度
  const optionWidth = min(canvasWidth - margin * 2, 780);

  // 計算四個選項總高度
  const optionsHeight = optionHeight * 4 + optionGap * 3;

  // 設定按鈕高度
  const buttonHeight = constrain(shortestSide * 0.095, 44, 60);

  // 設定按鈕寬度
  const buttonWidth = constrain(shortestSide * 0.32, 150, 230);

  // 設定底部安全距離
  const bottomMargin = constrain(shortestSide * 0.05, 12, 28);

  // 設定下一題按鈕位置
  const buttonY = canvasHeight - bottomMargin - buttonHeight / 2;

  // 設定選項第一個位置
  let optionsStartY = contentTop + optionGap + optionHeight / 2;

  // 計算可用內容底部位置
  const availableBottom = buttonY - buttonHeight / 2 - bottomMargin;

  // 計算選項區域底部位置
  const optionsBottom = optionsStartY + optionsHeight;

  // 判斷選項是否可能超出按鈕區域
  if (optionsBottom > availableBottom) {
    // 計算可上移的距離
    const moveUp = optionsBottom - availableBottom;

    // 將選項整體向上移動
    optionsStartY -= moveUp;
  }

  // 建立選項矩形資料
  const optionRects = [];

  // 逐一建立四個選項的版面資料
  for (let i = 0; i < 4; i++) {
    // 計算選項垂直位置
    const optionY = optionsStartY + i * (optionHeight + optionGap);

    // 建立目前選項矩形資料
    optionRects.push({
      x: canvasWidth / 2,
      y: optionY,
      w: optionWidth,
      h: optionHeight
    });
  }

  // 回傳完整響應式版面資料
  return {
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
    shortestSide: shortestSide,
    isNarrow: isNarrow,
    isShort: isShort,
    margin: margin,
    titleSize: titleSize,
    progressSize: progressSize,
    questionSize: questionSize,
    optionSize: optionSize,
    buttonSize: buttonSize,
    questionWidth: questionWidth,
    questionHeight: questionHeight,
    questionPadding: questionPadding,
    questionTextWidth: questionTextWidth,
    questionLines: questionLines,
    questionLineHeight: questionLineHeight,
    questionTextHeight: questionTextHeight,
    questionY: questionY,
    optionWidth: optionWidth,
    optionHeight: optionHeight,
    optionGap: optionGap,
    optionRects: optionRects,
    buttonWidth: buttonWidth,
    buttonHeight: buttonHeight,
    buttonY: buttonY
  };
}

// 顯示測驗標題
function drawTitle() {
  // 移除外框
  noStroke();

  // 設定文字顏色
  fill(TEXT_COLOR);

  // 設定標題文字大小
  textSize(layout.titleSize);

  // 顯示標題
  text("p5.js 程式設計簡易測驗", width / 2, layout.titleY);

  // 設定進度文字大小
  textSize(layout.progressSize);

  // 顯示答題進度
  text(
    "第 " + (currentQuestion + 1) + " 題／共 " + questions.length + " 題",
    width / 2,
    layout.progressY
  );
}

// 顯示題目
function drawQuestion() {
  // 設定題目方框背景顏色
  fill(QUESTION_BOX_COLOR);

  // 設定題目方框外框顏色
  stroke("#8DB9DD");

  // 設定外框粗細
  strokeWeight(2);

  // 繪製置中的題目方框
  rect(
    width / 2,
    layout.questionY,
    layout.questionWidth,
    layout.questionHeight,
    18
  );

  // 移除文字外框
  noStroke();

  // 設定題目文字顏色
  fill(TEXT_COLOR);

  // 設定題目文字大小
  textSize(layout.questionSize);

  // 設定文字對齊方式
  textAlign(CENTER, CENTER);

  // 計算題目文字起始位置
  const startY =
    layout.questionY -
    layout.questionTextHeight / 2 +
    layout.questionLineHeight / 2;

  // 逐行顯示題目
  for (let i = 0; i < layout.questionLines.length; i++) {
    // 顯示目前一行題目文字
    text(
      layout.questionLines[i],
      width / 2,
      startY + i * layout.questionLineHeight
    );
  }
}

// 依照文字寬度自動換行
function wrapTextByWidth(content, maxWidth) {
  // 建立文字行陣列
  const lines = [];

  // 建立目前文字行
  let currentLine = "";

  // 將文字拆成單一字元
  const characters = content.split("");

  // 逐一處理文字
  for (let i = 0; i < characters.length; i++) {
    // 取得目前字元
    const character = characters[i];

    // 建立測試文字
    const testLine = currentLine + character;

    // 測量測試文字寬度
    const measuredWidth = textWidth(testLine);

    // 判斷是否超出最大寬度
    if (measuredWidth > maxWidth && currentLine.length > 0) {
      // 將目前文字行加入陣列
      lines.push(currentLine);

      // 將目前字元設定為下一行文字
      currentLine = character;
    } else {
      // 將字元加入目前文字行
      currentLine = testLine;
    }
  }

  // 判斷是否還有最後一行
  if (currentLine.length > 0) {
    // 將最後一行加入陣列
    lines.push(currentLine);
  }

  // 回傳自動換行結果
  return lines;
}

// 顯示選項
function drawOptions() {
  // 取得目前題目資料
  const questionData = questions[currentQuestion];

  // 設定選項文字大小
  textSize(layout.optionSize);

  // 逐一繪製選項
  for (let i = 0; i < questionData.options.length; i++) {
    // 取得目前選項矩形資料
    const option = layout.optionRects[i];

    // 設定選項水平位置
    let optionX = option.x;

    // 設定選項垂直位置
    let optionY = option.y;

    // 判斷是否已經作答
    if (hasAnswered) {
      // 判斷是否為正確答案
      if (i === questionData.answer) {
        // 讓正確答案上下跳動
        optionY += sin(frameCount * 0.12) * layout.shortestSide * 0.018;
      }

      // 判斷是否為答錯的選項
      if (i === selectedOption && selectedOption !== questionData.answer) {
        // 讓錯誤選項左右移動
        optionX += sin(frameCount * 0.25) * layout.shortestSide * 0.02;
      }
    }

    // 設定選項預設背景
    let optionColor = "#FFFFFF";

    // 判斷是否為正確答案
    if (hasAnswered && i === questionData.answer) {
      // 設定正確答案背景
      optionColor = CORRECT_COLOR;
    }

    // 判斷是否為錯誤答案
    if (
      hasAnswered &&
      i === selectedOption &&
      selectedOption !== questionData.answer
    ) {
      // 設定錯誤答案背景
      optionColor = WRONG_COLOR;
    }

    // 設定選項背景顏色
    fill(optionColor);

    // 設定選項外框
    stroke("#B8C4CA");

    // 設定外框粗細
    strokeWeight(2);

    // 繪製選項
    rect(optionX, optionY, option.w, option.h, 14);

    // 移除文字外框
    noStroke();

    // 設定文字顏色
    if (
      hasAnswered &&
      i === selectedOption &&
      selectedOption !== questionData.answer
    ) {
      // 錯誤選項使用白色文字
      fill("#FFFFFF");
    } else {
      // 一般選項使用深色文字
      fill(TEXT_COLOR);
    }

    // 建立選項文字
    const optionText =
      String.fromCharCode(65 + i) + ". " + questionData.options[i];

    // 顯示選項文字
    text(optionText, optionX, optionY);
  }
}

// 顯示下一題按鈕
function drawNextButton() {
  // 尚未作答時不顯示按鈕
  if (!hasAnswered) {
    // 結束函式
    return;
  }

  // 設定按鈕水平位置
  const buttonX = width / 2;

  // 設定按鈕背景顏色
  fill("#1976D2");

  // 設定按鈕外框顏色
  stroke("#125A9C");

  // 設定外框粗細
  strokeWeight(2);

  // 繪製下一題按鈕
  rect(
    buttonX,
    layout.buttonY,
    layout.buttonWidth,
    layout.buttonHeight,
    14
  );

  // 移除外框
  noStroke();

  // 設定按鈕文字顏色
  fill("#FFFFFF");

  // 設定按鈕文字大小
  textSize(layout.buttonSize);

  // 判斷是否為最後一題
  if (currentQuestion === questions.length - 1) {
    // 顯示查看結果文字
    text("查看結果", buttonX, layout.buttonY);
  } else {
    // 顯示下一題文字
    text("下一題", buttonX, layout.buttonY);
  }
}

// 顯示測驗完成畫面
function drawFinishScreen() {
  // 取得最短邊
  const shortestSide = min(width, height);

  // 設定結果標題文字大小
  const resultTitleSize = constrain(shortestSide * 0.09, 26, 56);

  // 設定結果分數文字大小
  const resultScoreSize = constrain(shortestSide * 0.07, 22, 46);

  // 設定結果說明文字大小
  const resultTextSize = constrain(shortestSide * 0.04, 16, 28);

  // 設定結果標題文字顏色
  fill(TEXT_COLOR);

  // 移除外框
  noStroke();

  // 設定標題文字大小
  textSize(resultTitleSize);

  // 顯示完成文字
  text("測驗完成！", width / 2, height * 0.25);

  // 設定分數文字大小
  textSize(resultScoreSize);

  // 顯示答對題數
  text(
    "你答對了 " + score + "／" + questions.length + " 題",
    width / 2,
    height * 0.42
  );

  // 設定說明文字大小
  textSize(resultTextSize);

  // 判斷分數
  if (score === questions.length) {
    // 顯示滿分訊息
    text("太厲害了！全部答對！", width / 2, height * 0.53);
  } else if (score >= 3) {
    // 顯示良好訊息
    text("表現很好，繼續加油！", width / 2, height * 0.53);
  } else {
    // 顯示鼓勵訊息
    text("再多練習幾次，你一定會進步！", width / 2, height * 0.53);
  }

  // 設定重新測驗按鈕尺寸
  const buttonWidth = constrain(shortestSide * 0.38, 170, 240);

  // 設定重新測驗按鈕高度
  const buttonHeight = constrain(shortestSide * 0.11, 48, 64);

  // 設定重新測驗按鈕位置
  const buttonY = height * 0.70;

  // 儲存重新測驗按鈕位置
  layout.restartButton = {
    x: width / 2,
    y: buttonY,
    w: buttonWidth,
    h: buttonHeight
  };

  // 設定按鈕背景顏色
  fill("#1976D2");

  // 設定按鈕外框顏色
  stroke("#125A9C");

  // 設定外框粗細
  strokeWeight(2);

  // 繪製重新測驗按鈕
  rect(width / 2, buttonY, buttonWidth, buttonHeight, 14);

  // 移除外框
  noStroke();

  // 設定按鈕文字顏色
  fill("#FFFFFF");

  // 設定按鈕文字大小
  textSize(constrain(shortestSide * 0.045, 18, 25));

  // 顯示重新測驗文字
  text("重新測驗", width / 2, buttonY);
}

// 處理滑鼠按下
function mousePressed() {
  // 處理使用者輸入
  handleInput(mouseX, mouseY);

  // 停止瀏覽器預設行為
  return false;
}

// 處理觸控開始
function touchStarted() {
  // 判斷是否有觸控點
  if (touches.length > 0) {
    // 處理第一個觸控點
    handleInput(touches[0].x, touches[0].y);
  }

  // 停止手機頁面捲動
  return false;
}

// 處理滑鼠與觸控輸入
function handleInput(inputX, inputY) {
  // 判斷測驗是否已經結束
  if (isFinished) {
    // 取得重新測驗按鈕
    const button = layout.restartButton;

    // 判斷是否點擊重新測驗按鈕
    if (
      button &&
      inputX >= button.x - button.w / 2 &&
      inputX <= button.x + button.w / 2 &&
      inputY >= button.y - button.h / 2 &&
      inputY <= button.y + button.h / 2
    ) {
      // 重新開始測驗
      restartQuiz();
    }

    // 結束輸入處理
    return;
  }

  // 判斷是否尚未作答
  if (!hasAnswered) {
    // 逐一檢查所有選項
    for (let i = 0; i < layout.optionRects.length; i++) {
      // 取得目前選項
      const option = layout.optionRects[i];

      // 判斷是否點擊目前選項
      if (
        inputX >= option.x - option.w / 2 &&
        inputX <= option.x + option.w / 2 &&
        inputY >= option.y - option.h / 2 &&
        inputY <= option.y + option.h / 2
      ) {
        // 記錄選取選項
        selectedOption = i;

        // 設定已作答
        hasAnswered = true;

        // 判斷答案是否正確
        if (selectedOption === questions[currentQuestion].answer) {
          // 答對題數加一
          score++;
        }

        // 結束選項檢查
        return;
      }
    }

    // 尚未點擊選項時結束處理
    return;
  }

  // 設定下一題按鈕資料
  const nextButton = {
    x: width / 2,
    y: layout.buttonY,
    w: layout.buttonWidth,
    h: layout.buttonHeight
  };

  // 判斷是否點擊下一題按鈕
  if (
    inputX >= nextButton.x - nextButton.w / 2 &&
    inputX <= nextButton.x + nextButton.w / 2 &&
    inputY >= nextButton.y - nextButton.h / 2 &&
    inputY <= nextButton.y + nextButton.h / 2
  ) {
    // 判斷目前是否為最後一題
    if (currentQuestion === questions.length - 1) {
      // 設定測驗結束
      isFinished = true;
    } else {
      // 前往下一題
      currentQuestion++;

      // 清除選項
      selectedOption = -1;

      // 設定為尚未作答
      hasAnswered = false;
    }
  }
}

// 處理鍵盤按鍵
function keyPressed() {
  // 判斷是否尚未作答
  if (!hasAnswered && !isFinished) {
    // 將數字鍵轉成選項索引
    const keyIndex = int(key) - 1;

    // 判斷是否為有效選項
    if (keyIndex >= 0 && keyIndex < 4) {
      // 記錄選取選項
      selectedOption = keyIndex;

      // 設定已經作答
      hasAnswered = true;

      // 判斷答案是否正確
      if (selectedOption === questions[currentQuestion].answer) {
        // 答對題數加一
        score++;
      }
    }
  } else if (hasAnswered && !isFinished && keyCode === ENTER) {
    // 判斷目前是否為最後一題
    if (currentQuestion === questions.length - 1) {
      // 設定測驗結束
      isFinished = true;
    } else {
      // 前往下一題
      currentQuestion++;

      // 清除選項
      selectedOption = -1;

      // 設定尚未作答
      hasAnswered = false;
    }
  } else if (isFinished && keyCode === ENTER) {
    // 重新開始測驗
    restartQuiz();
  }

  // 停止瀏覽器預設行為
  return false;
}

// 重新開始測驗
function restartQuiz() {
  // 回到第一題
  currentQuestion = 0;

  // 分數歸零
  score = 0;

  // 清除選項
  selectedOption = -1;

  // 設定尚未作答
  hasAnswered = false;

  // 設定測驗尚未完成
  isFinished = false;
}

// 當視窗大小改變時執行
function windowResized() {
  // 重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);

  // 重新計算響應式版面
  layout = getQuizLayout();
}
```
:::


---

## 學習3：設定嵌入 Google 字型，網頁文字採用這些字型

https://cfchen58.synology.me/115/week4/stage3/

**這個階段的目標：** 從 Google Fonts 嵌入繁體中文字型，並讓畫布上的題目與選項文字使用這些字型。
**這個階段會修改的檔案：** index.html、sketch.js

### 執行截圖

（把截圖拖曳到這裡，或貼上圖片連結）

![學習3截圖](請貼上截圖)

### 第一次問 AI

```tex!
（逐字貼上你第一次問 AI 的提示詞）
```

### 第二次問 AI

```tex!
（逐字貼上你第二次問 AI 的提示詞）
```

### 第三次問 AI

```tex!
（逐字貼上你第三次問 AI 的提示詞）
```

### 程式碼內容

:::info
:::spoiler 點開貼上學習3的程式碼
```javascript=
//學習3程式碼所在

```
:::


---

## 學習4：設定題庫並抽題顯示題目網頁（CSV 檔案）

https://cfchen58.synology.me/115/week4/stage4/

**這個階段的目標：** 把題目移到 questions.csv，網站讀取題庫後每次隨機抽出 5 題。
**這個階段會修改的檔案：** index.html、sketch.js、questions.csv

### 執行截圖

（把截圖拖曳到這裡，或貼上圖片連結）

![學習4截圖](請貼上截圖)

### 第一次問 AI

```tex!
（逐字貼上你第一次問 AI 的提示詞）
```

### 第二次問 AI

```tex!
（逐字貼上你第二次問 AI 的提示詞）
```

### 第三次問 AI

```tex!
（逐字貼上你第三次問 AI 的提示詞）
```

### 程式碼內容

:::info
:::spoiler 點開貼上學習4的程式碼
```javascript=
//學習4程式碼所在

```
:::


---

## 學習5：利用 Google Sheets 當題庫

https://cfchen58.synology.me/115/week4/stage5/

**這個階段的目標：** 把題庫放在 Google 試算表，網站直接讀取，老師改試算表，網站題目就跟著更新。
**這個階段會修改的檔案：** index.html、sketch.js（questions.csv 當備用題庫）

### 執行截圖

（把截圖拖曳到這裡，或貼上圖片連結）

![學習5截圖](請貼上截圖)

### 第一次問 AI

```tex!
（逐字貼上你第一次問 AI 的提示詞）
```

### 第二次問 AI

```tex!
（逐字貼上你第二次問 AI 的提示詞）
```

### 第三次問 AI

```tex!
（逐字貼上你第三次問 AI 的提示詞）
```

### 程式碼內容

:::info
:::spoiler 點開貼上學習5的程式碼
```javascript=
//學習5程式碼所在

```
:::


---

## 我的心得

這五個學習中，哪一個最困難？你是怎麼解決的？（請寫出實際發生的事）

＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿

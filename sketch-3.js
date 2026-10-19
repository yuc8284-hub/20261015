let questionTable;

function preload() {
  questionTable = loadTable(
    "questions.csv",
    "csv",
    "header",
    csvLoaded,
    csvLoadFailed
  );
}

function setup() {
  const canvas = createCanvas(
    windowWidth,
    windowHeight
  );

  canvas.parent("p5-container");

  background("#F4F7F9");

  textAlign(CENTER, CENTER);
  textSize(28);
  fill("#263238");

  if (questionTable) {
    text(
      `p5.js 正常載入，CSV 共有 ${questionTable.getRowCount()} 題`,
      width / 2,
      height / 2
    );
  } else {
    text(
      "p5.js 已載入，但找不到 CSV",
      width / 2,
      height / 2
    );
  }
}

function draw() {
  // 測試版本不需要重複繪圖
}

function csvLoaded(table) {
  console.log(
    "questions.csv 載入成功",
    table.getRowCount()
  );
}

function csvLoadFailed(error) {
  console.error(
    "questions.csv 載入失敗",
    error
  );
}

function windowResized() {
  resizeCanvas(
    windowWidth,
    windowHeight
  );
}
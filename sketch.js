// THE GARDEN OF FEELINGS — integrated project
// Scene 1: Enter the garden | Scene 2: Choose a color | Scene 3: Interact with a flower

let gardenImage;
let scene = 1;
let cameraStarted = false;
let cameraProgress = 0;
let textAlpha = 255;

let colors = [
  { name: "Joy", hex: "#F4C95D", sound: 392 },
  { name: "Calm", hex: "#9CC9B8", sound: 330 },
  { name: "Love", hex: "#E98B91", sound: 440 },
  { name: "Sadness", hex: "#829BCB", sound: 262 },
  { name: "Hope", hex: "#B6A0D8", sound: 494 },
  { name: "Energy", hex: "#E99B58", sound: 523 }
];
let selectedColor = -1;
let feelingText = "";
let messages = [];
// Example visitor notes shown as a small community wall. These are sample messages,
// not live submissions from other devices.
let otherMessages = [
  "I hope tomorrow feels lighter.",
  "Today, I choose a little courage.",
  "I am learning to slow down.",
  "Even small things can bring joy."
];
let feelingInput;
let canvasLeft = 0;
let customColorPicker;
let addColorButton;
let flower;
let selectedPetal = -1;
let pressX = 0, pressY = 0, startDistance = 0, originalPetalLength = 0;
const FLOWER_SCALE = 0.85;

let imageLoading = true;
let imageError = false;

function setup() {
  // The canvas fills the browser window. The artwork keeps an 800 x 600
  // design coordinate system and is scaled in draw().
  createCanvas(windowWidth, windowHeight);
  canvasLeft = 0;
  imageMode(CENTER);
  textFont("Georgia");
  flower = new Flower(400, 270, 1, colors[0].hex);

  // A real HTML input lets visitors click the box and type normally.
  feelingInput = createInput("");
  feelingInput.attribute("placeholder", "Click here and type a short feeling...");
  feelingInput.position(canvasLeft + 160 * (width / 800), 384 * (height / 600));
  feelingInput.size(480 * (width / 800), 42 * (height / 600));
  feelingInput.style("box-sizing", "border-box");
  feelingInput.style("padding", "0 14px");
  feelingInput.style("font-size", "15px");
  feelingInput.style("border", "1px solid #e8dfcf");
  feelingInput.style("border-radius", "8px");
  feelingInput.style("background", "rgba(255,255,255,0.96)");
  feelingInput.style("color", "#46413a");
  feelingInput.input(function () {
    feelingText = feelingInput.value();
  });
  feelingInput.hide();

  // Visitors can choose any color and add it to the color choices.
  customColorPicker = createColorPicker("#e6a6c7");
  customColorPicker.position(canvasLeft + 300 * (width / 800), 300 * (height / 600));
  customColorPicker.size(54 * (width / 800), 28 * (height / 600));
  customColorPicker.hide();

  addColorButton = createButton("Add my color");
  addColorButton.position(canvasLeft + 370 * (width / 800), 300 * (height / 600));
  addColorButton.size(130 * (width / 800), 30 * (height / 600));
  addColorButton.style("border", "1px solid #f5e8d4");
  addColorButton.style("border-radius", "16px");
  addColorButton.style("padding", "4px 12px");
  addColorButton.style("background", "#fff7e8");
  addColorButton.style("color", "#51483d");
  addColorButton.style("cursor", "pointer");
  addColorButton.mousePressed(addCustomColor);
  addColorButton.hide();

  // p5.js 2.x: loadImage() returns a Promise. The old preload() lifecycle is not used.
  loadImage("garden-background.png")
    .then(function (img) {
      gardenImage = img;
      imageLoading = false;
    })
    .catch(function (error) {
      console.error("Could not load garden-background.png:", error);
      imageLoading = false;
      imageError = true;
    });
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  canvasLeft = 0;
  if (feelingInput) {
    feelingInput.position(160 * (width / 800), 384 * (height / 600));
    feelingInput.size(480 * (width / 800), 42 * (height / 600));
  }
  if (customColorPicker) {
    customColorPicker.position(300 * (width / 800), 300 * (height / 600));
    customColorPicker.size(54 * (width / 800), 28 * (height / 600));
  }
  if (addColorButton) {
    addColorButton.position(370 * (width / 800), 300 * (height / 600));
    addColorButton.size(130 * (width / 800), 30 * (height / 600));
  }
}

function drawGardenBackground(zoom = 1) {
  background(45, 60, 47);

  if (!gardenImage) {
    push();
    textAlign(CENTER, CENTER);
    noStroke();
    fill(255);
    textSize(20);
    if (imageLoading) {
      text("Loading the garden...", width / 2, height / 2);
    } else if (imageError) {
      text("Garden image not found. Check garden-background.png.", width / 2, height / 2);
    }
    pop();
    return;
  }

  // Calculate the cover size in screen pixels, then convert it back to
  // the 800 x 600 drawing coordinates so the photo is not distorted.
  let screenScale = max(width / gardenImage.width, height / gardenImage.height) * zoom;
  let scaleX = width / 800;
  let scaleY = height / 600;
  image(gardenImage, 400, 300,
    gardenImage.width * screenScale / scaleX,
    gardenImage.height * screenScale / scaleY);
}

function draw() {
  // Scale the 800 x 600 composition to the full browser window.
  push();
  scale(width / 800, height / 600);
  if (scene === 1) drawWelcomeScene();
  else if (scene === 2) drawColorScene();
  else if (scene === 3) drawFlowerScene();
  pop();
}

function drawWelcomeScene() {
  feelingInput.hide();
  customColorPicker.hide();
  addColorButton.hide();
  if (cameraStarted && cameraProgress < 1) {
    cameraProgress = min(1, cameraProgress + 0.003);
    textAlpha = max(0, textAlpha - 3);
  }
  let smooth = cameraProgress * cameraProgress * (3 - 2 * cameraProgress);
  drawGardenBackground(lerp(1, 1.7, smooth));
  if (textAlpha > 0) {
    push(); textAlign(CENTER, CENTER);
    fill(255, 245, 230, textAlpha); noStroke();
    textSize(43); textStyle(ITALIC);
    text("The Garden of Feelings", 400, 220);
    textSize(18); textStyle(NORMAL);
    text("A garden for your emotions, and for the future.", 400, 285);
    noFill(); stroke(255, 245, 230, textAlpha); strokeWeight(1.5);
    rectMode(CENTER); rect(400, 430, 180, 48, 25);
    noStroke(); fill(255, 245, 230, textAlpha); textSize(17);
    text("Enter the Garden  ✦", 400, 430);
    pop();
  }
  if (cameraStarted && cameraProgress >= 1) {
    scene = 2;
  }
}

function drawColorScene() {
  drawGardenBackground(1.12);
  feelingInput.show();
  customColorPicker.show();
  addColorButton.show();

  // translucent panel keeps the same garden visible behind the interface
  noStroke(); fill(25, 38, 29, 175); rect(55, 45, 690, 510, 24);
  fill(255, 247, 232); textAlign(CENTER, CENTER);
  textStyle(ITALIC); textSize(31); text("Choose Your Feeling", 400, 92);
  textStyle(NORMAL); textSize(15);
  text("Colors can mean different things to different people. Choose the color that feels right to you.", 400, 137);

  // Keep the color choices centered, including any colors added by visitors.
  let gap = min(96, 570 / max(1, colors.length - 1));
  let firstX = 400 - gap * (colors.length - 1) / 2;
  for (let i = 0; i < colors.length; i++) {
    let x = firstX + i * gap;
    let y = 225;
    fill(colors[i].hex); stroke(255, 245, 230, selectedColor === i ? 255 : 100);
    strokeWeight(selectedColor === i ? 5 : 1.5);
    ellipse(x, y, selectedColor === i ? 62 : 54);
    noStroke(); fill(255, 247, 232); textSize(12); text(colors[i].name, x, 267);
  }

  fill(255, 247, 232); textSize(17);
  text("Choose your own color:", 400, 288);
  textSize(18);
  text("What does this color mean to you today?", 400, 355);
  fill(255, 247, 232); textSize(11);
  text("Click the white box to type. Press ENTER to save your feeling.", 400, 444);

  // Community-inspired notes underneath the feeling input.
  textAlign(CENTER, CENTER);
  textStyle(ITALIC); textSize(15); fill(255, 247, 232);
  text("Others are saying...", 400, 469);
  textStyle(NORMAL); textSize(11);
  fill(255, 247, 232, 235);
  text('“' + otherMessages[0] + '”', 260, 491);
  text('“' + otherMessages[1] + '”', 540, 491);
  text('“' + otherMessages[2] + '”', 260, 510);
  text('“' + otherMessages[3] + '”', 540, 510);

  if (messages.length > 0) {
    textSize(10); fill(255, 235, 190);
    text("Your note: " + messages[messages.length - 1], 400, 531);
  }
  // Draw the button and its label from the same centered rectangle.
  rectMode(CENTER);
  fill(255, 247, 232, 235); stroke(255, 245, 230); strokeWeight(1.5);
  rect(400, 570, 250, 44, 22);
  noStroke(); fill(65, 76, 57); textAlign(CENTER, CENTER);
  textStyle(NORMAL); textSize(15); text("Continue to the flower  →", 400, 570);
  rectMode(CORNER);
}
function drawFlowerScene() {
  feelingInput.hide();
  customColorPicker.hide();
  addColorButton.hide();
  drawGardenBackground(1.12);
  // soft backing behind the white flower without replacing the garden scene
  noStroke(); fill(245, 239, 220, 115); ellipse(400, 280, 330, 330);
  push(); translate(flower.x, flower.y); scale(FLOWER_SCALE); translate(-flower.x, -flower.y);
  flower.display(); pop();
  fill(255, 248, 235); textAlign(CENTER, CENTER); textSize(24); textStyle(ITALIC);
  text("Let your feelings grow", 400, 48);
  textStyle(NORMAL); textSize(13);
  text("Click a petal to remove it · Drag a petal to change its length", 400, 78);
  text("Press 1–4 to change flower · A to add a petal · R to reset · B to return", 400, 555);
}

function mousePressed() {
  let mx = mouseX * 800 / width;
  let my = mouseY * 600 / height;
  if (scene === 1) {
    if (!cameraStarted && mx > 310 && mx < 490 && my > 406 && my < 454) cameraStarted = true;
    return;
  }
  if (scene === 2) {
    let gap = min(96, 570 / max(1, colors.length - 1));
    let firstX = 400 - gap * (colors.length - 1) / 2;
    for (let i = 0; i < colors.length; i++) {
      let x = firstX + i * gap;
      if (dist(mx, my, x, 225) < 36) { selectedColor = i; return; }
    }
    if (mx > 275 && mx < 525 && my > 548 && my < 592 && selectedColor !== -1) {
      flower.setColor(colors[selectedColor].hex);
      flower.setStyle(flower.style);
      scene = 3;
      feelingInput.hide();
      customColorPicker.hide();
      addColorButton.hide();
      return;
    }
    return;
  }
  if (scene === 3) {
    let mx = getFlowerMouseX(), my = getFlowerMouseY();
    selectedPetal = flower.getPetalAt(mx, my);
    if (selectedPetal !== -1) {
      pressX = mouseX * 800 / width; pressY = mouseY * 600 / height;
      startDistance = dist(mx, my, flower.x, flower.y);
      originalPetalLength = flower.petals[selectedPetal].petalLength;
    }
  }
}

function mouseDragged() {
  if (scene === 3 && selectedPetal !== -1) {
    let mx = getFlowerMouseX(), my = getFlowerMouseY();
    let currentDistance = dist(mx, my, flower.x, flower.y);
    let change = currentDistance - startDistance;
    flower.petals[selectedPetal].petalLength = constrain(originalPetalLength + change * 1.5, 30, 150);
  }
}

function mouseReleased() {
  if (scene === 3 && selectedPetal !== -1) {
    let movement = dist(pressX, pressY, mouseX * 800 / width, mouseY * 600 / height);
    if (movement < 6) flower.removePetal(selectedPetal);
  }
  selectedPetal = -1;
}

function keyPressed() {
  if (scene === 2) {
    if (keyCode === ENTER || keyCode === RETURN) {
      saveFeeling();
      return false;
    }
  }
  if (scene === 3) {
    if (key === "1") flower.setStyle(1);
    else if (key === "2") flower.setStyle(2);
    else if (key === "3") flower.setStyle(3);
    else if (key === "4") flower.setStyle(4);
    else if (key === "a" || key === "A") flower.addPetal();
    else if (key === "r" || key === "R") flower.reset();
    else if (key === "b" || key === "B") scene = 2;
  }
}

function addCustomColor() {
  let hexValue = customColorPicker.value();
  let colorName = "My Color " + (colors.length - 5);
  colors.push({ name: colorName, hex: hexValue, sound: 392 });
  selectedColor = colors.length - 1;
}

function saveFeeling() {
  feelingText = feelingInput.value().trim();
  if (selectedColor !== -1 && feelingText !== "") {
    messages.push(colors[selectedColor].name + ": " + feelingText);
    feelingInput.value("");
    feelingText = "";
  }
}

function getFlowerMouseX() {
  let logicalX = mouseX * 800 / width;
  return (logicalX - flower.x) / FLOWER_SCALE + flower.x;
}
function getFlowerMouseY() {
  let logicalY = mouseY * 600 / height;
  return (logicalY - flower.y) / FLOWER_SCALE + flower.y;
}

// ====================
// FLOWER CLASS
// ====================

class Flower {
  constructor(x, y, style, colorHex) {
    this.x = x;
    this.y = y;
    this.style = style;
    this.colorHex = colorHex || "#F4C95D";
    this.petals = [];
    this.setStyle(style);
  }

  setColor(colorHex) {
    this.colorHex = colorHex;
    for (let i = 0; i < this.petals.length; i++) {
      this.petals[i].colorHex = colorHex;
    }
  }


  setStyle(style) {
    this.style = style;
    this.petals = [];

    if (style === 1) {
      this.createCupFlower();
    }

    else if (style === 2) {
      this.createSunflower();
    }

    else if (style === 3) {
      this.createLily();
    }

    else if (style === 4) {
      this.createChrysanthemum();
    }
  }


  // ====================
  // FLOWER 1: CUP FLOWER
  // ====================

  createCupFlower() {
    // Eight petals arranged in an open cup shape

    this.createPetal(-HALF_PI, 100, 43, "cup", 0, 0);

    this.createPetal(-2.35, 88, 46, "cup", 0, 0);
    this.createPetal(-0.79, 88, 46, "cup", 0, 0);

    this.createPetal(-2.95, 72, 45, "cup", 0, 0);
    this.createPetal(-0.19, 72, 45, "cup", 0, 0);

    this.createPetal(2.75, 75, 47, "cup", 1, 0);
    this.createPetal(0.39, 75, 47, "cup", 1, 0);

    this.createPetal(PI / 2, 65, 43, "cup", 1, 0);
  }


  // ====================
  // FLOWER 2: SUNFLOWER
  // ====================

  createSunflower() {
    // 12 wide petals
    this.createLayer(
      12, 85, 32, 0,
      "sunflower", 0
    );
  }


  // ====================
  // FLOWER 3: LILY
  // ====================

  createLily() {
    // Exactly 6 separate petals in one circle
    for (let i = 0; i < 6; i++) {
      let angle = -HALF_PI + TWO_PI * i / 6;

      this.createPetal(
        angle,
        100,
        34,
        "lily",
        0,
        0
      );
    }
  }


  // ====================
  // FLOWER 4: CHRYSANTHEMUM
  // ====================

  createChrysanthemum() {
    // Outer petals
    this.createLayer(
      16, 100, 20, 0,
      "chrysanthemum", 0
    );

    // Inner petals
    this.createLayer(
      10, 65, 19, 3,
      "chrysanthemum", 1
    );
  }


  // ====================
  // CREATE PETAL
  // ====================

  createPetal(angle, petalLength, petalWidth, shape, layer, radius) {
    this.petals.push(
      new Petal(
        angle,
        petalLength,
        petalWidth,
        shape,
        layer,
        radius,
        this.colorHex
      )
    );
  }


  // ====================
  // CREATE PETAL LAYERS
  // ====================

  createLayer(count, petalLength, petalWidth, radius, shape, layer) {
    for (let i = 0; i < count; i++) {
      let angle = TWO_PI * i / count;
      angle += layer * 0.13;

      this.createPetal(
        angle,
        petalLength,
        petalWidth,
        shape,
        layer,
        radius
      );
    }
  }


  // ====================
  // DISPLAY FLOWER
  // ====================

  display() {
    this.drawStem();

    for (let i = 0; i < this.petals.length; i++) {
      this.petals[i].display(this.x, this.y);
    }

    if (this.style === 1) {
      this.drawCupCenter();
    }

    else if (this.style === 2) {
      this.drawSunflowerCenter();
    }

    else if (this.style === 3) {
      this.drawLilyCenter();
    }

    else if (this.style === 4) {
      this.drawChrysanthemumCenter();
    }
  }


  // ====================
  // STEM AND LEAVES
  // ====================

  drawStem() {
    push();

    noFill();
    stroke(125, 145, 112, 150);
    strokeWeight(1.15);
    strokeCap(ROUND);

    let previousX = this.x;
    let previousY = this.y + 5;

    for (let i = 1; i <= 40; i++) {
      let t = i / 40;

      let currentX = this.x + sin(t * PI) * 5;
      let currentY = this.y + 5 + t * 160;

      line(previousX, previousY, currentX, currentY);

      previousX = currentX;
      previousY = currentY;
    }

    noStroke();
    fill(145, 165, 130, 135);

    // Left leaf
    push();
    translate(this.x - 3, this.y + 85);
    rotate(-0.65);
    ellipse(-12, 0, 34, 13);
    pop();

    // Right leaf
    push();
    translate(this.x + 3, this.y + 125);
    rotate(0.65);
    ellipse(12, 0, 34, 13);
    pop();

    pop();
  }


  // ====================
  // FLOWER 1 CENTER
  // ====================

  drawCupCenter() {
    push();
    translate(this.x, this.y);

    noStroke();

    fill(190, 175, 135);
    ellipse(0, 0, 26, 18);

    fill(205, 185, 140);
    ellipse(0, -3, 20, 12);

    stroke(155, 135, 100, 150);
    strokeWeight(0.9);
    strokeCap(ROUND);

    for (let i = 0; i < 11; i++) {
      let t = map(i, 0, 10, -1, 1);

      let x1 = t * 7;
      let x2 = t * 17;
      let y2 = -17 - (1 - abs(t)) * 12;

      line(x1, -2, x2, y2);

      noStroke();
      fill(165, 125, 65);
      ellipse(x2, y2, 3.5, 4);

      stroke(155, 125, 75);
      strokeWeight(1.8);
    }

    pop();
  }


  // ====================
  // FLOWER 2 CENTER
  // ====================

  drawSunflowerCenter() {
    push();
    translate(this.x, this.y);

    noStroke();

    fill(175, 145, 95);
    ellipse(0, 0, 48, 48);

    fill(145, 115, 75);
    ellipse(0, 0, 39, 39);

    fill(215, 190, 135);

    for (let i = 0; i < 65; i++) {
      let angle = i * 2.4;
      let r = 3 + i * 0.24;

      let x = cos(angle) * r;
      let y = sin(angle) * r;

      ellipse(x, y, 2.2, 2.2);
    }

    pop();
  }


  // ====================
  // FLOWER 3 CENTER
  // ====================

  drawLilyCenter() {
    push();
    translate(this.x, this.y);

    // Short stamens close to the center
    stroke(165, 150, 115, 145);
    strokeWeight(0.8);
    strokeCap(ROUND);

    for (let i = 0; i < 5; i++) {
      let angle = TWO_PI * i / 5;

      let x2 = cos(angle) * 14;
      let y2 = sin(angle) * 14;

      line(0, 0, x2, y2);

      noStroke();
      fill(180, 150, 95);
      ellipse(x2, y2, 4, 4);

      stroke(165, 145, 105);
      strokeWeight(1.5);
    }

    noStroke();
    fill(210, 180, 120);
    ellipse(0, 0, 8, 8);

    pop();
  }


  // ====================
  // FLOWER 4 CENTER
  // ====================

  drawChrysanthemumCenter() {
    push();
    translate(this.x, this.y);

    noStroke();

    fill(190, 165, 115);
    ellipse(0, 0, 19, 19);

    fill(215, 190, 135);
    ellipse(0, 0, 11, 11);

    pop();
  }


  // ====================
  // PETAL INTERACTION
  // ====================

  getPetalAt(mx, my) {
    for (let i = this.petals.length - 1; i >= 0; i--) {
      if (this.petals[i].isMouseOver(this.x, this.y, mx, my)) {
        return i;
      }
    }

    return -1;
  }


  removePetal(index) {
    if (index >= 0 && index < this.petals.length) {
      this.petals.splice(index, 1);
    }
  }


  // A KEY: ADD PETAL
  addPetal() {
    if (this.petals.length >= 70) {
      return;
    }

    let shape = "cup";

    if (this.style === 2) {
      shape = "sunflower";
    }

    else if (this.style === 3) {
      shape = "lily";
    }

    else if (this.style === 4) {
      shape = "chrysanthemum";
    }

    let newAngle = TWO_PI * this.petals.length /
      (this.petals.length + 1);

    this.createPetal(
      newAngle,
      70,
      25,
      shape,
      0,
      0
    );
  }


  // R KEY: RESET
  reset() {
    this.setStyle(this.style);
  }
}


// ====================
// PETAL CLASS
// ====================

class Petal {
  constructor(angle, petalLength, petalWidth, shape, layer, radius, colorHex) {
    this.angle = angle;
    this.petalLength = petalLength;
    this.petalWidth = petalWidth;
    this.shape = shape;
    this.layer = layer;
    this.radius = radius;
    this.colorHex = colorHex || "#F4C95D";

    this.phase = random(TWO_PI);
  }


  display(cx, cy) {
    let px = cx + cos(this.angle) * this.radius;
    let py = cy + sin(this.angle) * this.radius;

    let sway = sin(frameCount * 0.02 + this.phase) * 0.008;

    push();

    translate(px, py);
    rotate(this.angle + HALF_PI + sway);

    if (this.shape === "cup") {
      this.drawCupPetal();
    }

    else if (this.shape === "sunflower") {
      this.drawSunflowerPetal();
    }

    else if (this.shape === "lily") {
      this.drawLilyPetal();
    }

    else if (this.shape === "chrysanthemum") {
      this.drawChrysanthemumPetal();
    }

    pop();
  }


  // ====================
  // WATERCOLOR PETALS
  // Soft transparent washes replace the previous solid marker-like fills.
  // No dark outlines: pigment is built up through several light layers.
  // ====================

  getWatercolorTones() {
    let base = color(this.colorHex);
    let pale = lerpColor(base, color(255, 250, 239), 0.38);
    let light = lerpColor(base, color(255, 255, 255), 0.66);
    let shadow = lerpColor(base, color(120, 112, 125), 0.18);
    return { base: base, pale: pale, light: light, shadow: shadow };
  }

  drawWatercolorPetal(lengthScale, widthScale, exponent, curl) {
    let tones = this.getWatercolorTones();
    noStroke();

    // A soft, diluted under-wash
    let wash = color(tones.pale);
    wash.setAlpha(105);
    fill(wash);
    this.drawOrganicShape(this.petalLength * lengthScale, this.petalWidth * widthScale,
      exponent, curl);

    // Main pigment layer, slightly transparent
    let pigment = color(tones.base);
    pigment.setAlpha(155);
    fill(pigment);
    this.drawOrganicShape(this.petalLength * (lengthScale * 0.97),
      this.petalWidth * (widthScale * 0.94), exponent, curl * 0.8);

    // Uneven translucent wash gives a hand-painted edge and pigment variation
    let shadow = color(tones.shadow);
    shadow.setAlpha(42);
    fill(shadow);
    push();
    translate(-this.petalWidth * 0.035, this.petalLength * 0.015);
    this.drawOrganicShape(this.petalLength * (lengthScale * 0.78),
      this.petalWidth * (widthScale * 0.68), exponent, curl * 0.5);
    pop();

    // A faint watery highlight, not a hard white stripe
    let highlight = color(tones.light);
    highlight.setAlpha(75);
    fill(highlight);
    push();
    translate(this.petalWidth * 0.06, -this.petalLength * 0.025);
    this.drawOrganicShape(this.petalLength * (lengthScale * 0.72),
      this.petalWidth * (widthScale * 0.28), exponent, curl * 0.4);
    pop();
  }

  drawCupPetal() {
    this.drawWatercolorPetal(1, 1, 0.58, 0.12);
  }

  drawSunflowerPetal() {
    this.drawWatercolorPetal(1, 1, 0.62, 0);
  }

  drawLilyPetal() {
    this.drawWatercolorPetal(1, 1, 0.65, 0.08);
  }

  drawChrysanthemumPetal() {
    this.drawWatercolorPetal(1, 1, 0.85, 0.17);
  }


  // ====================
  // ORGANIC PETAL SHAPE
  // ====================

  drawOrganicShape(petalLength, petalWidth, exponent, curl) {
    beginShape();

    // Left side
    for (let i = 0; i <= 32; i++) {
      let t = i / 32;

      let widthFactor = pow(sin(PI * t), exponent);
      let tipBend = curl * pow(t, 5) * petalWidth;

      let x = -petalWidth * 0.5 * widthFactor + tipBend;
      let y = -petalLength * t;

      vertex(x, y);
    }

    // Right side
    for (let i = 32; i >= 0; i--) {
      let t = i / 32;

      let widthFactor = pow(sin(PI * t), exponent);
      let tipBend = curl * pow(t, 5) * petalWidth;

      let x = petalWidth * 0.5 * widthFactor + tipBend;
      let y = -petalLength * t;

      vertex(x, y);
    }

    endShape(CLOSE);
  }


  // ====================
  // HIT DETECTION
  // ====================

  isMouseOver(cx, cy, mx, my) {
    let px = cx + cos(this.angle) * this.radius;
    let py = cy + sin(this.angle) * this.radius;

    let dx = mx - px;
    let dy = my - py;

    let rotation = this.angle + HALF_PI;

    let localX =
      dx * cos(rotation) +
      dy * sin(rotation);

    let localY =
      -dx * sin(rotation) +
      dy * cos(rotation);

    let centerY = -this.petalLength * 0.5;

    let a = this.petalWidth * 0.75;
    let b = this.petalLength * 0.55;

    let check =
      (localX * localX) / (a * a) +
      ((localY - centerY) * (localY - centerY)) / (b * b);

    return check <= 1;
  }
}



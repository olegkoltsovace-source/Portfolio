<template>
  <!-- Magic sparks. A transparent canvas laid over the whole hero; it never blocks the mouse.
       Other components ask for sparks with burstSparksFromElement(someElement). -->
  <canvas ref="sparkCanvas" class="spark-canvas" aria-hidden="true"></canvas>
</template>

<script setup>
// A small particle system: each spark flies out, slows down, drifts up, twinkles and fades.
// The drawing loop only runs while there are sparks alive, so it costs nothing when idle.
import { ref, onMounted, onBeforeUnmount } from "vue";
import gsap from "gsap";

const isSmallScreen = window.matchMedia("(max-width: 900px)").matches;

const SPARK_COLOR_RGB = "0, 240, 255"; // the same neon cyan as the rest of the site
const SPARKS_PER_BURST = isSmallScreen ? 12 : 26; // fewer on phones
const SPARK_AIR_FRICTION = 0.955; // every frame a spark keeps 95.5% of its speed, so it slows down
const SPARK_FLOAT_UP = 0.012; // every frame a spark drifts up a little, like magic dust
const SPARK_TWINKLE_SPEED = 0.3; // how fast the brightness flickers
const SPARK_GLOW_SCALE = 5; // the soft glow around a spark is 5x its radius
const STAR_SHARE = 0.4; // 40% of sparks are little 4-point stars, the rest are dots
const MAX_PIXEL_RATIO = 2; // draw at most at 2x resolution (sharp on retina, but not too heavy)

const sparkCanvas = ref(null);
let sparkPainter = null; // the canvas's 2D drawing tool (draws circles, shapes, colours)
let aliveSparks = []; // every spark currently flying
let sparkAnimationFrameId = null; // id of the next scheduled frame, or null when the loop is stopped

// ── Canvas size ──
// The canvas has its own pixel grid. Make it match the size on screen (× the screen's pixel ratio),
// otherwise the sparks would look stretched or blurry.
const fitCanvasToScreen = () => {
  const canvas = sparkCanvas.value;
  if (!canvas) return;
  // How many real screen pixels make up one CSS pixel (1 on normal screens, 2–3 on retina/phones)
  const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  canvas.width = canvas.clientWidth * pixelRatio;
  canvas.height = canvas.clientHeight * pixelRatio;
  sparkPainter = canvas.getContext("2d");
  sparkPainter.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0); // so we can keep drawing in CSS pixels
};

// ── Creating sparks ──
// Throw sparks out of an element (e.g. one letter of the name), in random directions
const burstSparksFromElement = (element, sparkCount = SPARKS_PER_BURST) => {
  if (!sparkPainter || !element) return;

  // Where is the element, measured from the canvas's top-left corner?
  const elementBox = element.getBoundingClientRect();
  const canvasBox = sparkCanvas.value.getBoundingClientRect();
  const elementCenterX =
    elementBox.left - canvasBox.left + elementBox.width / 2;
  const elementCenterY = elementBox.top - canvasBox.top + elementBox.height / 2;

  for (let sparkNumber = 0; sparkNumber < sparkCount; sparkNumber++) {
    const directionInRadians = Math.random() * Math.PI * 2; // any direction (a full circle)
    const startSpeed = gsap.utils.random(2, 7); // pixels per frame

    aliveSparks.push({
      // Position: somewhere inside the element, not all from the exact centre
      x:
        elementCenterX +
        gsap.utils.random(-elementBox.width / 3, elementBox.width / 3),
      y:
        elementCenterY +
        gsap.utils.random(-elementBox.height / 3, elementBox.height / 3),
      // Speed split into a horizontal and a vertical part (how far it moves each frame)
      speedX: Math.cos(directionInRadians) * startSpeed,
      speedY: Math.sin(directionInRadians) * startSpeed,
      radius: gsap.utils.random(1.4, 3.4),
      isStar: Math.random() < STAR_SHARE,
      bornAt: performance.now(), // time in ms
      lifetimeMs: gsap.utils.random(800, 1600),
      twinklePhase: gsap.utils.random(0, Math.PI * 2), // random start, so they don't flicker in sync
    });
  }

  // Start the drawing loop if it isn't running yet
  if (!sparkAnimationFrameId) {
    sparkAnimationFrameId = requestAnimationFrame(drawSparkFrame);
  }
};

// ── Drawing shapes ──
// A 4-point sparkle: four curved arms meeting in the middle
const drawFourPointStar = (painter, centerX, centerY, radius) => {
  const armLength = radius * 3;
  painter.beginPath();
  painter.moveTo(centerX, centerY - armLength); // top tip
  painter.quadraticCurveTo(centerX, centerY, centerX + armLength, centerY); // → right tip
  painter.quadraticCurveTo(centerX, centerY, centerX, centerY + armLength); // → bottom tip
  painter.quadraticCurveTo(centerX, centerY, centerX - armLength, centerY); // → left tip
  painter.quadraticCurveTo(centerX, centerY, centerX, centerY - armLength); // → back to the top
  painter.fill();
};

const drawCircle = (painter, centerX, centerY, radius) => {
  painter.beginPath();
  painter.arc(centerX, centerY, radius, 0, Math.PI * 2);
  painter.fill();
};

// ── Animation loop ──
// One frame: move every spark a little, then draw it
const drawSparkFrame = () => {
  const painter = sparkPainter;
  const canvas = sparkCanvas.value;
  if (!painter || !canvas) return;
  const now = performance.now();

  painter.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight); // wipe the previous frame
  painter.globalCompositeOperation = "lighter"; // overlapping sparks add up and glow brighter

  // Forget sparks whose lifetime is over
  aliveSparks = aliveSparks.filter(
    (spark) => now - spark.bornAt < spark.lifetimeMs,
  );

  for (const spark of aliveSparks) {
    const lifeProgress = (now - spark.bornAt) / spark.lifetimeMs; // 0 = just born, 1 = about to disappear

    // Move: slow down (air friction), drift upwards a little, then step forward
    spark.speedX *= SPARK_AIR_FRICTION;
    spark.speedY = spark.speedY * SPARK_AIR_FRICTION - SPARK_FLOAT_UP;
    spark.x += spark.speedX;
    spark.y += spark.speedY;
    spark.twinklePhase += SPARK_TWINKLE_SPEED;

    // Fade out over its life, and flicker a little on the way (sin goes between -1 and 1)
    const twinkle = 0.75 + Math.sin(spark.twinklePhase) * 0.25;
    const opacity = (1 - lifeProgress) * twinkle;
    const currentRadius = spark.radius * (1 - lifeProgress * 0.4); // shrinks to 60% of its size

    // Soft glow: a big, faint circle
    painter.fillStyle = `rgba(${SPARK_COLOR_RGB}, ${opacity * 0.4})`;
    drawCircle(painter, spark.x, spark.y, currentRadius * SPARK_GLOW_SCALE);

    // Bright core: a small star or dot on top
    painter.fillStyle = `rgba(${SPARK_COLOR_RGB}, ${opacity})`;
    if (spark.isStar) {
      drawFourPointStar(painter, spark.x, spark.y, currentRadius);
    } else {
      drawCircle(painter, spark.x, spark.y, currentRadius);
    }
  }

  painter.globalCompositeOperation = "source-over"; // back to normal drawing

  // Keep the loop going only while there are sparks left
  sparkAnimationFrameId =
    aliveSparks.length > 0 ? requestAnimationFrame(drawSparkFrame) : null;
};

// ── Start / clean up ──
onMounted(() => {
  fitCanvasToScreen();
  window.addEventListener("resize", fitCanvasToScreen);
});

onBeforeUnmount(() => {
  if (sparkAnimationFrameId) cancelAnimationFrame(sparkAnimationFrameId);
  window.removeEventListener("resize", fitCanvasToScreen);
});

// Lets the parent call this function through a template ref: sparkCanvas.value.burstSparksFromElement(el)
defineExpose({ burstSparksFromElement });
</script>

<style scoped>
/* Covers the hero, above the text, and never blocks the mouse */
.spark-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}
</style>

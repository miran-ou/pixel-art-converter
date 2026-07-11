const imageInput = document.getElementById("imageInput");
const presetSelect = document.getElementById("presetSelect");
const detailSelect = document.getElementById("detailSelect");
const colorSelect = document.getElementById("colorSelect");
const colorStepInput = document.getElementById("colorStepInput");
const colorStepValue = document.getElementById("colorStepValue");
const pixelSizeValue = document.getElementById("pixelSizeValue");
const pixelSizeInput = document.getElementById("pixelSizeInput");
const modeSelect = document.getElementById("modeSelect");
const paletteSelect = document.getElementById("paletteSelect");
const downloadButton = document.getElementById("downloadButton");
const originalCanvas = document.getElementById("originalCanvas");
const pixelCanvas = document.getElementById("pixelCanvas");

let currentImage = null;

const palettes = {
    rpg: [
        [24, 24, 32],
        [40, 32, 32],
        [48, 48, 56],
        [64, 48, 48],
        [80, 72, 72],
        [96, 64, 56],
        [120, 88, 72],
        [168, 112, 80],
        [216, 160, 104],
        [248, 208, 144],
        [255, 232, 184],
        [48, 88, 64],
        [80, 136, 80],
        [128, 176, 96],
        [184, 216, 128],
        [48, 80, 128],
        [80, 128, 184],
        [128, 176, 216],
        [160, 80, 88],
        [208, 112, 112],
        [216, 216, 216],
        [248, 248, 240]
    ],
    monster: [
        [16, 24, 32],
        [32, 32, 40],
        [40, 56, 48],
        [56, 48, 64],
        [64, 96, 64],
        [96, 152, 88],
        [144, 200, 104],
        [216, 232, 144],
        [48, 80, 136],
        [80, 128, 192],
        [128, 176, 224],
        [112, 72, 128],
        [168, 96, 160],
        [216, 128, 160],
        [184, 88, 88],
        [232, 144, 104],
        [248, 232, 184],
        [248, 248, 248]
    ],
    cool: [
        [16, 24, 28],
        [32, 40, 44],
        [48, 56, 60],
        [64, 76, 76],
        [72, 88, 84],
        [80, 96, 92],
        [88, 108, 104],
        [96, 120, 112],
        [104, 132, 124],
        [112, 144, 136],
        [128, 160, 152],
        [64, 104, 112],
        [80, 136, 152],
        [104, 176, 192],
        [136, 216, 224],
        [176, 240, 240],
        [48, 72, 112],
        [72, 104, 160],
        [112, 144, 200],
        [160, 192, 224],
        [112, 104, 104],
        [160, 152, 144],
        [216, 216, 208],
        [248, 248, 240]
    ],
    retro: [
        [0, 0, 0],
        [24, 24, 24],
        [48, 48, 48],
        [72, 72, 72],
        [96, 96, 96],
        [160, 160, 160],
        [224, 224, 224],
        [255, 255, 255],
        [128, 32, 32],
        [200, 72, 48],
        [240, 160, 80],
        [240, 216, 112],
        [48, 112, 64],
        [96, 176, 96],
        [48, 80, 160],
        [96, 144, 216],
        [120, 72, 160],
        [200, 112, 184]
    ]
};

const presets = {
    balanced: {
        mode: "palette",
        palette: "rpg",
        detail: "medium",
        color: "retro"
    },
    rpg: {
        mode: "palette",
        palette: "rpg",
        detail: "high",
        color: "retro"
    },
    monster: {
        mode: "palette",
        palette: "monster",
        detail: "medium",
        color: "retro"
    },
    cool: {
        mode: "palette",
        palette: "cool",
        detail: "medium",
        color: "natural"
    },
    retro: {
        mode: "palette",
        palette: "retro",
        detail: "low",
        color: "strong"
    },
    natural: {
        mode: "round",
        palette: "rpg",
        detail: "high",
        color: "natural"
    }
};

const detailSettings = {
    low: 64,
    medium: 96,
    high: 128
};

const colorSettings = {
    natural: 32,
    retro: 64,
    strong: 96
};


const originalContext = originalCanvas.getContext("2d");
const pixelContext = pixelCanvas.getContext("2d", {
    willReadFrequently: true
});

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (!file) {
        console.log("ファイルが選ばれていません");
        return;
    }

    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.addEventListener("load", () => {
        currentImage = image;

        originalCanvas.width = image.width;
        originalCanvas.height = image.height;

        originalContext.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
        originalContext.drawImage(image, 0, 0);

        convertToPixelArt();
    });

    image.src = imageUrl;
});

presetSelect.addEventListener("change", () => {
    applyPreset(presetSelect.value);
    convertToPixelArt();
});

detailSelect.addEventListener("change", () => {
    applySimpleControls();
    convertToPixelArt();
});

colorSelect.addEventListener("change", () => {
    applySimpleControls();
    convertToPixelArt();
});

colorStepInput.addEventListener("input", () => {
    colorStepValue.textContent = colorStepInput.value;
    convertToPixelArt();
});

pixelSizeInput.addEventListener("input", () => {
    pixelSizeValue.textContent = pixelSizeInput.value;
    convertToPixelArt();
});

modeSelect.addEventListener("change", () => {
    convertToPixelArt();
});

paletteSelect.addEventListener("change", () => {
    convertToPixelArt();
});

downloadButton.addEventListener("click", () => {
    if (!currentImage) {
        return;
    }

    const link = document.createElement("a");
    link.download = "pixel-art.png";
    link.href = pixelCanvas.toDataURL("image/png");
    link.click();
});

applyPreset(presetSelect.value);

function convertToPixelArt() {
    if (!currentImage) {
        return;
    }

    const image = currentImage;
    const pixelSize = getNumberInRange(pixelSizeInput.value, 96, 8, 256);

    pixelCanvas.width = pixelSize;
    pixelCanvas.height = pixelSize;

    pixelContext.imageSmoothingEnabled = true;

    pixelContext.clearRect(0, 0, pixelCanvas.width, pixelCanvas.height);
    pixelContext.fillStyle = "white";
    pixelContext.fillRect(0, 0, pixelCanvas.width, pixelCanvas.height);

    const ratio = Math.min(
        pixelSize / image.width,
        pixelSize / image.height
    );

    const drawWidth = image.width * ratio;
    const drawHeight = image.height * ratio;
    const drawX = (pixelSize - drawWidth) / 2;
    const drawY = (pixelSize - drawHeight) / 2;

    pixelContext.drawImage(image, drawX, drawY, drawWidth, drawHeight);

    const imageData = pixelContext.getImageData(0, 0, pixelCanvas.width, pixelCanvas.height);
    const data = imageData.data;
    const sourceData = new Uint8ClampedArray(data);
    const selectedPalette = palettes[paletteSelect.value];
    const colorStep = getNumberInRange(colorStepInput.value, 64, 1, 255);

    for (let i = 0; i < data.length; i += 4) {
        if (isSoftBackground(sourceData, i)) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            continue;
        }

        if (modeSelect.value === "palette") {
            const adjustedColor = liftDarkColor(data[i], data[i + 1], data[i + 2]);
            const nearestColor = findNearestColor(
                adjustedColor[0],
                adjustedColor[1],
                adjustedColor[2],
                selectedPalette
            );

            data[i] = nearestColor[0];
            data[i + 1] = nearestColor[1];
            data[i + 2] = nearestColor[2];
        }

        if (modeSelect.value === "round") {
            data[i] = roundColor(data[i], colorStep);
            data[i + 1] = roundColor(data[i + 1], colorStep);
            data[i + 2] = roundColor(data[i + 2], colorStep);
        }
    }

    addEdgeLines(imageData, sourceData);
    pixelContext.putImageData(imageData, 0, 0);
}

function applyPreset(presetName) {
    const preset = presets[presetName];

    if (!preset) {
        return;
    }

    modeSelect.value = preset.mode;
    paletteSelect.value = preset.palette;
    detailSelect.value = preset.detail;
    colorSelect.value = preset.color;

    applySimpleControls();
}

function applySimpleControls() {
    pixelSizeInput.value = detailSettings[detailSelect.value];
    colorStepInput.value = colorSettings[colorSelect.value];

    pixelSizeValue.textContent = pixelSizeInput.value;
    colorStepValue.textContent = colorStepInput.value;
}

function roundColor(value, step) {
    const rounded = Math.round(value / step) * step;
    return Math.min(rounded, 255);
}

function getNumberInRange(value, fallback, min, max) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return fallback;
    }

    return Math.min(Math.max(number, min), max);
}

function findNearestColor(r, g, b, palette) {
    let nearestColor = palette[0];
    let nearestDistance = Infinity;
    const brightness = getBrightness(r, g, b);

    for (const color of palette) {
        const redDiff = r - color[0];
        const greenDiff = g - color[1];
        const blueDiff = b - color[2];
        const brightnessDiff = brightness - getBrightness(color[0], color[1], color[2]);

        const distance =
            redDiff * redDiff +
            greenDiff * greenDiff +
            blueDiff * blueDiff +
            brightnessDiff * brightnessDiff * 2;

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestColor = color;
        }
    }

    return nearestColor;
}

function liftDarkColor(r, g, b) {
    const brightness = getBrightness(r, g, b);

    if (brightness >= 75) {
        return [r, g, b];
    }

    const liftAmount = Math.round((75 - brightness) * 0.2);

    return [
        Math.min(r + liftAmount, 255),
        Math.min(g + liftAmount, 255),
        Math.min(b + liftAmount, 255)
    ];
}

function addEdgeLines(imageData, sourceData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const edgeThreshold = 45;

    for (let y = 0; y < height - 1; y += 1) {
        for (let x = 0; x < width - 1; x += 1) {
            const index = (y * width + x) * 4;
            const rightIndex = (y * width + x + 1) * 4;
            const bottomIndex = ((y + 1) * width + x) * 4;

            if (isSoftBackground(sourceData, index)) {
                continue;
            }

            const brightness = getBrightness(
                sourceData[index],
                sourceData[index + 1],
                sourceData[index + 2]
            );
            const rightBrightness = getBrightness(
                sourceData[rightIndex],
                sourceData[rightIndex + 1],
                sourceData[rightIndex + 2]
            );
            const bottomBrightness = getBrightness(
                sourceData[bottomIndex],
                sourceData[bottomIndex + 1],
                sourceData[bottomIndex + 2]
            );

            const edgeStrength = Math.max(
                Math.abs(brightness - rightBrightness),
                Math.abs(brightness - bottomBrightness)
            );

            if (edgeStrength > edgeThreshold && brightness > 55) {
                const darkenAmount = brightness < 110 ? 0.88 : 0.72;
                darkenPixel(data, index, darkenAmount);
            }
        }
    }
}

function getBrightness(r, g, b) {
    return r * 0.299 + g * 0.587 + b * 0.114;
}

function isSoftBackground(data, index) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const brightness = getBrightness(r, g, b);
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);

    return brightness > 175 && saturation < 28;
}

function darkenPixel(data, index, amount) {
    data[index] = Math.round(data[index] * amount);
    data[index + 1] = Math.round(data[index + 1] * amount);
    data[index + 2] = Math.round(data[index + 2] * amount);
}

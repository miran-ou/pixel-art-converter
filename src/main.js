const imageInput = document.getElementById("imageInput");
const colorStepInput = document.getElementById("colorStepInput");
const pixelSizeInput = document.getElementById("pixelSizeInput");
const downloadButton = document.getElementById("downloadButton");
const originalCanvas = document.getElementById("originalCanvas");
const pixelCanvas = document.getElementById("pixelCanvas");

let currentImage = null;

const originalContext = originalCanvas.getContext("2d");
const pixelContext = pixelCanvas.getContext("2d");

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    
    if (!file){
        console.log("ファイルが選ばれました");
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

    console.log(imageUrl);
});

colorStepInput.addEventListener("input", () => {
    convertToPixelArt();
});

pixelSizeInput.addEventListener("input", () => {
    convertToPixelArt();
});
function convertToPixelArt() {
    if(!currentImage){
        return;
    }

    const image = currentImage;
    const pixelSize = Number(pixelSizeInput.value);

    pixelCanvas.width = pixelSize;
    pixelCanvas.height = pixelSize;
    
    pixelCanvas.style.width = "512px";
    pixelCanvas.style.height = "512px";


    pixelContext.imageSmoothingEnabled = false;

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
        // drawImage(画像, x, y, 横幅, 高さ)
    pixelContext.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    const imageData = pixelContext.getImageData(0, 0, pixelCanvas.width, pixelCanvas.height);

    const data = imageData.data;
    const colorStep = Number(colorStepInput.value);

    for (let i = 0; i < data.length; i += 4){
        data[i] = roundColor(data[i], colorStep);
        data[i + 1] = roundColor(data[i + 1], colorStep);
        data[i + 2] = roundColor(data[i + 2], colorStep);
    }

        pixelContext.putImageData(imageData, 0, 0);
}
    function roundColor(value, step){
        const rounded = Math.round(value / step) * step;
        return Math.min(rounded, 255);
}



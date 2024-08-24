const CANVAS_CONTAINER = document.querySelector(".canvas__container");
const CANVAS_LIST_ID = ["finishCanvas", "drawingCanvas", "cursorCanvas", "decorationCanvas"]
const CANVAS_SETTINGS = {
    width: 200,
    height: 100
}
const POINTS_ARRAY = [
    [10, 20],
    [20, 50],
    [30, 20],
    [190, 80]
    //x   y
];

class DrawingModule {
    isDrawing = false;
    canvasList = {};
    constructor(width, height, declarationElement, canvasListId) {
        this.width = width;
        this.height = height;
        this.declarationElement = declarationElement;
        this.canvasListId = canvasListId;

        this.init(this.width, this.height, this.declarationElement, this.canvasListId)
    }
    init(width, height, declarationElement, canvasListId) {
        for (const key of canvasListId) {
            const canvas = document.createElement("canvas");
            canvas.classList.add("canvas_item");
            canvas.id = key;
            canvas.width = width;
            canvas.height = height;
            this.canvasList[key] = canvas;
            declarationElement.appendChild(canvas);
        }
    }
    draw(POINTS_ARRAY, drawingWidth) {
        if (POINTS_ARRAY.length === 0) return;
        if (POINTS_ARRAY.length === 1) {
            this.drawLine(
                POINTS_ARRAY[0][0], POINTS_ARRAY[0][1],
                POINTS_ARRAY[0][0], POINTS_ARRAY[0][1],
                drawingWidth);
            return;
        }
        for (let i = 0; i < POINTS_ARRAY.length - 1; i++) {
            this.drawLine(
                POINTS_ARRAY[i][0], POINTS_ARRAY[i][1],
                POINTS_ARRAY[i + 1][0], POINTS_ARRAY[i + 1][1],
                drawingWidth);
        }
    }
    drawLine(x_start, y_start, x_end, y_end, drawingWidth) {
        const draw_ctx = this.canvasList.drawingCanvas.getContext("2d");
        const finish_ctx = this.canvasList.finishCanvas.getContext("2d");

        draw_ctx.lineWidth = drawingWidth;
        draw_ctx.lineCap = draw_ctx.lineJoin = "round";
        draw_ctx.beginPath();
        draw_ctx.moveTo(x_start, y_start);
        draw_ctx.lineTo(x_end, y_end);
        draw_ctx.stroke();

        finish_ctx.drawImage(this.canvasList.drawingCanvas, 0, 0);
        draw_ctx.clearRect(0, 0, this.width, this.height);
    }
}


let drawingModule = new DrawingModule(CANVAS_SETTINGS.width, CANVAS_SETTINGS.height, CANVAS_CONTAINER, CANVAS_LIST_ID);
drawingModule.draw(POINTS_ARRAY, 3)

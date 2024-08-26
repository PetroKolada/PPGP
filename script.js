const CANVAS_CONTAINER = document.querySelector(".canvas__container");
const CANVAS_LIST_ID = ["finishCanvas", "drawingCanvas", "cursorCanvas", "decorationCanvas"]
const CANVAS_SETTINGS = {
    width: 200,
    height: 100
}
const POINTS_ARRAY = [
    [10, 10],
    [20, 20],
    [30, 15],
    [40, 40],
    [70, 30],
    [90, 50],
    [110, 30],
    [150, 40],
    [170, 10],
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
            this.canvasList[key] = {
                element: canvas,
                context: canvas.getContext("2d")
            };
            declarationElement.appendChild(canvas);
        }
    }

    //CURVE
    draw(POINTS_ARRAY, drawingWidth, level) {
        if (POINTS_ARRAY.length === 0) return;
        if (POINTS_ARRAY.length === 1) {
            this.drawLine(
                POINTS_ARRAY[0][0], POINTS_ARRAY[0][1],
                POINTS_ARRAY[0][0], POINTS_ARRAY[0][1],
                drawingWidth);
            return;
        }
        if (POINTS_ARRAY.length === 2) {
            this.drawLine(
                POINTS_ARRAY[0][0], POINTS_ARRAY[0][1],
                POINTS_ARRAY[1][0], POINTS_ARRAY[1][1],
                drawingWidth);
            return;
        }

        //Если точек больше 2
        this.drawPoints(POINTS_ARRAY, "lightGray", 5);
        if (level === 0) {
            for (let i = 0; i < POINTS_ARRAY.length - 1; i++) {
                this.drawLine(
                    POINTS_ARRAY[i][0], POINTS_ARRAY[i][1],
                    POINTS_ARRAY[i + 1][0], POINTS_ARRAY[i + 1][1],
                    drawingWidth);
            }
            return
        }
        let POINTS_CURVE_ARRAY = [...POINTS_ARRAY];
        const averagePoint = function (start, end) {
            return [
                Math.round((start[0] + end[0]) / 2),
                Math.round((start[1] + end[1]) / 2)];
        }
        const smoothArray = function (array, step) {
            for (let i = 2; i < array.length; i++)
                array.splice(i, step);

            array.push(POINTS_ARRAY[POINTS_ARRAY.length - 1]);
            return array;
        }
        POINTS_CURVE_ARRAY = smoothArray(POINTS_CURVE_ARRAY, level - 1);
        this.drawPoints(POINTS_CURVE_ARRAY, "red", 5);

        for (let i = 1; i < POINTS_CURVE_ARRAY.length; i += 2) {
            POINTS_CURVE_ARRAY.splice(i, 0, averagePoint(POINTS_CURVE_ARRAY[i - 1], POINTS_CURVE_ARRAY[i]));
            this.drawPoints([POINTS_CURVE_ARRAY[i]], "green", 5);
        }

        // console.log(POINTS_CURVE_ARRAY);
        this.drawCurve(POINTS_CURVE_ARRAY, drawingWidth);
    }

    drawPoints(points, color, drawingWidth) {
        this.canvasList.drawingCanvas.context.fillStyle = color;

        for (let i = 0; i < points.length; i++) {
            this.canvasList.drawingCanvas.context.beginPath();
            this.canvasList.drawingCanvas.context.arc(points[i][0], points[i][1], drawingWidth / 2, 0, 2 * Math.PI);
            this.canvasList.drawingCanvas.context.fill();
        }
        this.canvasList.drawingCanvas.context.fillStyle = "black";
        this.finish();
    }

    drawLine(x_start, y_start, x_end, y_end, drawingWidth) {
        this.canvasList.drawingCanvas.context.lineWidth = drawingWidth;
        this.canvasList.drawingCanvas.context.lineCap = this.canvasList.drawingCanvas.context.lineJoin = "round";
        this.canvasList.drawingCanvas.context.beginPath();
        this.canvasList.drawingCanvas.context.moveTo(x_start, y_start);
        this.canvasList.drawingCanvas.context.lineTo(x_end, y_end);
        this.canvasList.drawingCanvas.context.stroke();
        this.finish();
    }

    drawCurve(points, drawingWidth) {
        this.canvasList.drawingCanvas.context.lineWidth = drawingWidth;
        this.canvasList.drawingCanvas.context.lineCap = this.canvasList.drawingCanvas.context.lineJoin = "round";
        this.canvasList.drawingCanvas.context.beginPath();
        this.canvasList.drawingCanvas.context.moveTo(points[0][0], points[0][1]);

        for (let i = 1; i < points.length - 2; i += 2)
            this.canvasList.drawingCanvas.context.bezierCurveTo(
                points[i][0], points[i][1],
                points[i + 1][0], points[i + 1][1],
                points[i + 2][0], points[i + 2][1]);

        this.canvasList.drawingCanvas.context.lineTo(points[points.length - 1][0], points[points.length - 1][1]);
        this.canvasList.drawingCanvas.context.stroke();
        this.finish();
    }

    finish() {
        this.canvasList.finishCanvas.context.drawImage(this.canvasList.drawingCanvas.element, 0, 0);
        this.canvasList.drawingCanvas.context.clearRect(0, 0, this.width, this.height);
    }
}

let drawingModule = new DrawingModule(CANVAS_SETTINGS.width, CANVAS_SETTINGS.height, CANVAS_CONTAINER, CANVAS_LIST_ID);

//РИСОВАНИЕ
drawingModule.draw(POINTS_ARRAY, 1, 1s)//точки, размер кисти, уровень сглаживания
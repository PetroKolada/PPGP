const CANVAS_CONTAINER = document.querySelector(".canvas__container");
const CANVAS_LIST_ID = ["finishCanvas", "drawingCanvas", "cursorCanvas", "decorationCanvas"]
const CANVAS_SETTINGS = {
    width: 200,
    height: 100
}
const POINTS_ARRAY = [
    [10, 10],
    [20, 20],
    [30, 10],
    [40, 20],
    [50, 10],
    [60, 20],
    [70, 10],
    [80, 20],
    [90, 10],
    [100, 20],
    [110, 10],
    [120, 20],
    [130, 10],
    [140, 20],
    [150, 10],
    [160, 20],
    [170, 10],
    [180, 20],
    [190, 50],
    [180, 80],
    [170, 90],
    [160, 80],
    [150, 90],
    [140, 80],
    [130, 90],
    [120, 80],
    [110, 90],
    [100, 80],
    [90, 90],
    [80, 80],
    [70, 90],
    [60, 80],
    [50, 90],
    [40, 80],
    [30, 90],
    [20, 80],
    [10, 90]
    //x   y
];
// const POINTS_ARRAY = [
//     [10, 50],
//     [20, 20],
//     [30, 70],
//     [40, 20],
//     [50, 70],
//     [60, 20],
//     [70, 70],
//     [80, 20],
//     [90, 70],
//     [100, 20],
//     [110, 70],
//     [120, 20],
//     [130, 70],
//     [140, 20],
//     [150, 70],
//     [160, 20],
//     [170, 50],
//     //x   y
// ];

class DrawingModule {
    isDrawing = false;
    canvasList = {};
    constructor(width, height, declarationElement, canvasListId) {
        this.width = width;
        this.height = height;
        this.declarationElement = declarationElement;
        this.canvasListId = canvasListId;

        this.init(this.width, this.height, this.declarationElement, this.canvasListId);
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
    draw(POINTS_ARRAY, drawingWidth, level, dash) {
        if (POINTS_ARRAY.length === 0) return;
        if (POINTS_ARRAY.length === 1) {
            this.drawLine([POINTS_ARRAY[0]], drawingWidth, dash);
            return;
        }
        if (POINTS_ARRAY.length === 2) {
            this.drawLine(POINTS_ARRAY, drawingWidth, dash);
            return;
        }

        //Если точек больше 2
        // this.drawPoints(POINTS_ARRAY, "lightGray", 5);

        if (level === 0) {
            this.drawLine(POINTS_ARRAY, drawingWidth, dash);
            return
        }

        let POINTS_CURVE_ARRAY = [...POINTS_ARRAY];
        const addAveragePoint = function (array) {
            for (let i = 1; i < array.length; i += 2) {
                array.splice(i, 0, [
                    Math.round((array[i - 1][0] + array[i][0]) / 2),
                    Math.round((array[i - 1][1] + array[i][1]) / 2)]);
            }
        }
        const crophArray = function (array, step) {
            for (let i = 0; i < array.length; i++)
                array.splice(i, step);
        }

        let crop = 0;
        for (let i = 0; i < level; i++) {
            addAveragePoint(POINTS_CURVE_ARRAY);
            if (i % 2 == 0)
                crop++;
            if (level != 1)
                crophArray(POINTS_CURVE_ARRAY, crop);
        }
        if (level != 1) {
            POINTS_CURVE_ARRAY.unshift(POINTS_ARRAY[0]);
            POINTS_CURVE_ARRAY.push(POINTS_ARRAY[POINTS_ARRAY.length - 1]);
        }
        // console.log(POINTS_CURVE_ARRAY);

        this.drawCurve(POINTS_CURVE_ARRAY, drawingWidth, dash);
        // this.drawPoints(POINTS_CURVE_ARRAY, "red", 5);
    }

    drawPoints(points, color, drawingWidth) {
        this.canvasList.drawingCanvas.context.fillStyle = color;

        for (const point of points) {
            this.canvasList.drawingCanvas.context.beginPath();
            this.canvasList.drawingCanvas.context.arc(point[0], point[1], drawingWidth / 2, 0, 2 * Math.PI);
            this.canvasList.drawingCanvas.context.fill();
        }
        this.canvasList.drawingCanvas.context.fillStyle = "black";
        this.finish();
    }

    drawLine(points, drawingWidth, dash) {
        this.canvasList.drawingCanvas.context.lineWidth = drawingWidth;
        this.canvasList.drawingCanvas.context.lineCap = this.canvasList.drawingCanvas.context.lineJoin = "round";
        this.canvasList.drawingCanvas.context.beginPath();
        this.canvasList.drawingCanvas.context.moveTo(points[0][0], points[0][1]);

        for (const point of points)
            this.canvasList.drawingCanvas.context.lineTo(point[0], point[1]);

        this.canvasList.drawingCanvas.context.setLineDash(dash);
        this.canvasList.drawingCanvas.context.stroke();
        this.finish();
    }

    drawCurve(points, drawingWidth, dash) {
        this.canvasList.drawingCanvas.context.lineWidth = drawingWidth;
        // this.canvasList.drawingCanvas.context.globalAlpha = .4;
        this.canvasList.drawingCanvas.context.lineCap = this.canvasList.drawingCanvas.context.lineJoin = "round";
        this.canvasList.drawingCanvas.context.beginPath();
        this.canvasList.drawingCanvas.context.moveTo(points[0][0], points[0][1]);

        for (let i = 1; i < points.length - 1; i++)
            this.canvasList.drawingCanvas.context.quadraticCurveTo(points[i][0], points[i][1],
                Math.round((points[i][0] + points[i + 1][0]) / 2),
                Math.round((points[i][1] + points[i + 1][1]) / 2));

        this.canvasList.drawingCanvas.context.lineTo(points[points.length - 1][0], points[points.length - 1][1]);
        this.canvasList.drawingCanvas.context.setLineDash(dash);
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
drawingModule.draw(POINTS_ARRAY, 3, 4, [1, 10])//точки, размер, сглаживания, [пунктир]


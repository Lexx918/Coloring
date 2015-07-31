/**
 *
 */
function Coloring(img, width, height)
{
    var img = img,
        width = width,
        height = height,
        backgroundColor = [255,255,255],
        borderColor = [0,0,0];

    var debug = function(){
        for (var str, row = 0; row < height; row++) {
            str = ""+row+": ";
            for (var i = 0, len = lines[row].length; i < len; i++) {
                str += "["+lines[row][i][0]+","+lines[row][i][1]+","+lines[row][i][2]+"], ";
            }
            console.log(str);
            str = "";
        }
    }

    /**
     * Extraction lines
     *
     * lines = [
     *   rowNum => [ [leftX, rightX, claster], [..], [..] ],
     *   rowNum => [ [leftX, rightX, claster], [..], [..] ],
     * ]
     */
    var lines = [],
        imageData = img.getImageData(0, 0, width, height).data,
        canFill = function(x, y){
            var offset = (y*width + x) * 4,
                dot = [imageData[offset], imageData[offset + 1], imageData[offset + 2]],
                error = 220;
            return ""+dot !== ""+borderColor &&
                Math.abs(backgroundColor[0] - dot[0]) <= error &&
                Math.abs(backgroundColor[1] - dot[1]) <= error &&
                Math.abs(backgroundColor[2] - dot[2]) <= error;
        };
    for (var left, row = 0; row < height; row++) {
        lines[row] = [];
        left = -1;
        for (var col = 0; col < width; col++) {
            if (canFill(col, row)) {
                if (left === -1) {
                    left = col;
                }
            } else {
                if (left !== -1) {
                    lines[row].push([left, col - 1, 0]);
                    left = -1;
                }
            }
        }
        if (left !== -1) {
            lines[row].push([left, width, 0]);
        }
    }
    imageData = null;

    // clustering
    var getChildren = function(left, right, row){
        if (row < 0 || row >= height) {
            return;
        }

        var children = [];
        // http://www.codeproject.com/Articles/6017/QuickFill-An-efficient-flood-fill-algorithm
        for (var i = 0, len = lines[row].length; i < len; i++) {
            if (
                lines[row][i][2] === 0 &&
                (
                    lines[row][i][0] >= left && lines[row][i][0] <= right ||
                    lines[row][i][1] >= left && lines[row][i][1] <= right ||
                    lines[row][i][0] < left && lines[row][i][1] >= left ||
                    lines[row][i][1] > right && lines[row][i][0] <= right
                )
            ) {
                children.push([row, i]);
                left = lines[row][i][1] + 2;
            }
        }
        return children;
    };
    for (var child, childrenUp, childrenDown, children = [], claster = row = 0; row < height; row++) {
        for (var i = 0, len = lines[row].length; i < len; i++) {
            if (lines[row][i][2] === 0) {
                claster++;

                children.push([row, i]);
                while (child = children.pop()) {
                    lines[child[0]][child[1]][2] = claster;

                    childrenUp   = getChildren(lines[child[0]][child[1]][0], lines[child[0]][child[1]][1], child[0] - 1);
                    childrenDown = getChildren(lines[child[0]][child[1]][0], lines[child[0]][child[1]][1], child[0] + 1);

                    if (childrenUp)   children = children.concat(childrenUp);
                    if (childrenDown) children = children.concat(childrenDown);
                }
            }
        }
    };

    this.fill = function(x, y, color){
        var row = y,
            left = x;

        if (row < 0 || row >= height) {
            return;
        }

        for (var claster = i = 0, len = lines[row].length; i < len; i++) {
            if (lines[row][i][0] <= left && lines[row][i][1] >= left) {
                claster = lines[row][i][2];
                break;
            }
        }

        if (!claster) {
            return;
        }

        img.fillStyle = "rgb("+color+")";

        // @TODO optimize!!!
        for (var row = 0; row < height; row++) {
            for (var i = 0, len = lines[row].length; i < len; i++) {
                if (lines[row][i][2] === claster) {
                    img.fillRect(lines[row][i][0], row, lines[row][i][1] - lines[row][i][0] + 1, 1);
                }
            }
        }
    }

    /* debug */
    this.next = function(){
        tick();
    }
    this.dot = function(x,y){
        imageData = img.getImageData(0, 0, width, height).data;
        var offset = (y*width + x) * 4;
        return [imageData[offset], imageData[offset + 1], imageData[offset + 2]];
    }
}

function Coloring(img, width, height, borderColor)
{
    var img = img,
        width = width,
        height = height,
        borderColor = borderColor,
        imageData,
        filledLines,
        bgColor,
        stack;

    init = function(){
        imageData = img.getImageData(0, 0, width, height).data;
        filledLines = [];
        stack = [];
    },

    clear = function(){
        imageData = null;
        filledLines = null;
        stack = null;
    },

    getDot = function(x, y){
        var offset = (y*width + x) * 4;
        return [imageData[offset], imageData[offset + 1], imageData[offset + 2]];
    },

    canFill = function(dot){
        var error = 20;
        return ""+dot !== ""+borderColor &&
            Math.abs(bgColor[0] - dot[0]) <= error &&
            Math.abs(bgColor[1] - dot[1]) <= error &&
            Math.abs(bgColor[2] - dot[2]) <= error;
    },

    filled = function(line){
        for (var i = 0, len = filledLines.length; i < len; i++) {
            if (line.left  === filledLines[i].left  &&
                line.right === filledLines[i].right &&
                line.top   === filledLines[i].top
            ) {
                return true;
            }
        }
        return false;
    },

    /**
     * @param int x
     * @param int y
     * return {left: int, right: int, top: int}
     */
    findLine = function(x, y){
        var left =
            right = x;
        if (canFill(getDot(x, y))) {
            while (left > 0) {
                left--;
                if (!canFill(getDot(left, y))) {
                    left++;
                    break;
                }
            }
            while (right < width - 1) {
                right++;
                if (!canFill(getDot(right, y))) {
                    right--;
                    break;
                }
            }
            return {left: left, right: right, top: y};
        } else {
            return false;
        }
    },

    findChildren = function(line){
        var children = [],
            y,
            left,
            child,
            find = function(left, y){
                if (y < 0 || y > height) {
                    return;
                }
                while (left <= line.right) {
                    child = findLine(left, y);
                    if (child === false) {
                        left++;
                    } else {
                        left = child.right + 2;
                        if (!filled(child)) {
                            children.push(child);
                            filledLines.push(child);
                        }
                    }
                }
            };

        find(line.left, line.top - 1);
        find(line.left, line.top + 1);

        return children;
    },

    tick = function(){
        var empty = !stack.length;

        if (line = stack.pop()) {
            img.fillRect(line.left, line.top, line.right - line.left + 1, 1);

            var children = findChildren(line);
            var len = children.length;
            if (len) {
                for (var i = 0; i < len; i++) {
                    stack.push(children[i]);
                }
            }
        }

        if (empty) {
            clear();
        } else {
            //setTimeout(tick, 0);
            tick();
        }
    };

    this.fill = function(x, y, color){
        init();

        bgColor = getDot(x, y);
        img.fillStyle = "rgb("+color+")";

        var startLine = findLine(x, y);
        if (startLine === false) {
            return;
        }
        stack.push(startLine);

        tick();
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

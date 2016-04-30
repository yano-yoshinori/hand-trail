var FabricText = require('./FabricText.js');

var keycodes = {
    TAB: 9,
    SPACE: 17,
    ESC: 27,
    BACKSPACE: 8
};

class Canvas {

    constructor (canvasEl) {
        var $document = $(document),
            $body = $(document.body);

        var editor = new fabric.Canvas(canvasEl, {
            isDrawingMode: true,
            imageSmoothingEnabled: true
        });
        window.editor = editor;

        var inputModeLabel = new FabricText("[", {
            opacity: 0.2
        });
        editor.add(inputModeLabel);

        var modeIcon = new FabricText('Pen', {
            opacity: 0.2,
            fontSize: 16
        });
        editor.add(modeIcon);

        var lastTextPos = { x: 0, y: 0 },
            lastText = null;

        $document.on('keyup', function (e) {
            // TODO modifier キーのときは文字入力しない

            if (e.keyCode === keycodes.TAB) {
                // change mode
                editor.isDrawingMode = !editor.isDrawingMode;
                if (editor.isDrawingMode) {
                    modeIcon.setText('Pen');
                } else {
                    modeIcon.setText('Select');
                }
                editor.renderAll();
                return;
            }

            var text = null,
                char = String.fromCharCode(e.keyCode).toLowerCase();
            if (e.shiftKey) {
                char = char.toUpperCase();
            }
            if (isMoved || !lastText) {
                isMoved = false;
                text = new FabricText(char, {
                    lockUniScaling: true
                });
                text.setTop(mousePos.y);
                text.setLeft(mousePos.x);
            } else {
                text = lastText;
                text.setText(text.getText() + char);
                //text.insertChars(char);
                //text.setSelectionEnd(9999);
                editor.renderAll();
            }
            editor.setActiveObject(text);
            editor.add(text);
            lastText = text;

            lastTextPos.x = mousePos.x;
            lastTextPos.y = mousePos.y;
        });

        // 最後のマウス位置
        var mousePos = { x: 0, y: 0 },
            // マウスカーソルが動いたかどうかを記録
            isMoved = false,
            // マウスカーソルが動いたかどうかのしきい値
            OFFSET = 10;

        $body.on('mousemove', function (e) {
            mousePos.x = e.clientX;
            mousePos.y = e.clientY;

            inputModeLabel.setLeft(mousePos.x - 15);
            inputModeLabel.setTop(mousePos.y);

            modeIcon.setLeft(mousePos.x - 30);
            modeIcon.setTop(mousePos.y - 20);

            editor.renderAll();

            // 10px ずれたら IText オブジェクトを新たに作る
            if (mousePos.x < lastTextPos.x - OFFSET || lastTextPos.x + OFFSET < mousePos.x ||
                mousePos.y < lastTextPos.y - OFFSET || lastTextPos.y + OFFSET < mousePos.y) {
                //console.log('moved');
                isMoved = true;
            }
        }).on('mousedown', function (e) {
            inputModeLabel.setVisible(false);
            modeIcon.setVisible(false);
        }).on('mouseup', function (e) {
            inputModeLabel.setVisible(true);
            modeIcon.setVisible(true);
        });
    }
}

module.exports = Canvas;

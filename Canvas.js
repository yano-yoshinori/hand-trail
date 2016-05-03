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

        var lastTextPos = { x: 0, y: 0 },
            lastText = null;

        // 前に保存したデータがあれば読み込む
        localforage.getItem('userData')
            .then((data) => {
                if (!data) { return; }
                editor.loadFromJSON(data, () => {
                    this.buildPixy();
                    editor.renderAll();
                });
            });

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
                    lockUniScaling: true,
                    hasControls: false,
                    fill: editor.freeDrawingBrush.color
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

        $body.on('mousemove', (e) => {
            mousePos.x = e.clientX;
            mousePos.y = e.clientY - 42; // header offset

            if (this.inputModeLabel) {
                this.inputModeLabel.setLeft(mousePos.x - 15);
                this.inputModeLabel.setTop(mousePos.y);
            }

            if (this.modeIcon) {
                this.modeIcon.setLeft(mousePos.x - 30);
                this.modeIcon.setTop(mousePos.y - 20);
            }

            // ht.pixy.set({
            //     left: mousePos.x - 12,
            //     top: mousePos.y + 28
            // });

            editor.renderAll();

            // 10px ずれたら IText オブジェクトを新たに作る
            if (mousePos.x < lastTextPos.x - OFFSET || lastTextPos.x + OFFSET < mousePos.x ||
                mousePos.y < lastTextPos.y - OFFSET || lastTextPos.y + OFFSET < mousePos.y) {
                //console.log('moved');
                isMoved = true;
            }
        }).on('mousedown', () => {
            this.inputModeLabel.setVisible(false);
            this.modeIcon.setVisible(false);
        }).on('mouseup', () => {
            this.inputModeLabel.setVisible(true);
            this.modeIcon.setVisible(true);
        });
    }

    buildPixy () {
        this.inputModeLabel = new FabricText("[", {
            opacity: 0.2
        });
        editor.add(this.inputModeLabel);
        window.inputModeLabel = this.inputModeLabel;

        this.modeIcon = new FabricText('Pen', {
            opacity: 0.2,
            fontSize: 16
        });
        editor.add(this.modeIcon);
        window.modeIcon = this.modeIcon;
    }
}

module.exports = Canvas;

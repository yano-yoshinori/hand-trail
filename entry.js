// TODO TABでフリーハンドとテキスト選択の切り替え
// TODO カーソルはフリーハンド用の十字と文字高さを表すぼうせんを表示する
// TODO モード切り替え時にカーソルが消える
// TODO モードチェンジしたときはもうちょい派手なエフェクトを出す
// TODO 描画モードのときの文字入力は、コントロール枠を表示しない
// TODO テキスト入力枠の中にいるときは、documentのキーボードイベントを殺す
// TODO 打ち間違いをバックスペースで消せるように。このときに文字枠の文字が選択されないように

var keycodes = {
    TAB: 9,
    SPACE: 17,
    ESC: 27,
    BACKSPACE: 8
};

fabric.StaticCanvas.prototype._setImageSmoothing = function() {
    var ctx = this.getContext();

    ctx.imageSmoothingEnabled       = this.imageSmoothingEnabled;
    //ctx.webkitImageSmoothingEnabled = this.imageSmoothingEnabled;
    ctx.mozImageSmoothingEnabled    = this.imageSmoothingEnabled;
    ctx.msImageSmoothingEnabled     = this.imageSmoothingEnabled;
    ctx.oImageSmoothingEnabled      = this.imageSmoothingEnabled;
};

var $document = $(document),
    $body = $(document.body),
    $canvas = $('.editor');

$canvas.attr({
    width: $document.width(),
    height: $document.height()
});
var editor = new fabric.Canvas($canvas[0], {
    isDrawingMode: true
});
window.editor = editor;

var lastTextPos = { x: 0, y: 0 },
    lastText = null;

$document.on('keydown', function (e) {
    if (e.keyCode === keycodes.TAB || e.keyCode === keycodes.BACKSPACE) {
        e.preventDefault();
    }
});

$document.on('keyup', function (e) {
    // TODO modifier キーのときは文字入力しない

    if (e.keyCode === keycodes.TAB) {
        // change mode
        editor.isDrawingMode = !editor.isDrawingMode;
        editor.renderAll();
        return;
    }

    var text = null,
        char = String.fromCharCode(e.keyCode).toLowerCase();
    if (isMoved || !lastText) {
        text = new fabric.IText(char);
        isMoved = false;
    } else {
        text = lastText;
        text.setText(text.getText() + char);
        //text.insertChars(char);
        //text.setSelectionEnd(9999);
        editor.renderAll();
    }
    text.setTop(mousePos.y);
    text.setLeft(mousePos.x);
    editor.setActiveObject(text);
    editor.add(text);
    lastText = text;

    lastTextPos.x = mousePos.x;
    lastTextPos.y = mousePos.y;
});

var mousePos = { x: 0, y: 0 },
    isMoved = false,
    OFFSET = 5;

$body.on('mousemove', function (e) {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;

    // TODO 5px ずれたら IText オブジェクトを新たに作る
    if (mousePos.x < lastTextPos.x - OFFSET || lastTextPos.x + OFFSET < mousePos.x ||
        mousePos.y < lastTextPos.y - OFFSET || lastTextPos.y + OFFSET < mousePos.y) {
        console.log('moved');
        isMoved = true;
    }
});

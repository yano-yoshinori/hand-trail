// DONE TABでフリーハンドとテキスト選択の切り替え
// TODO カーソルはフリーハンド用の十字と文字高さを表すぼうせんを表示する
// TODO モード切り替え時にカーソルが消える
// TODO モードチェンジしたときはもうちょい派手なエフェクトを出す
// TODO 描画モードのときの文字入力は、コントロール枠を表示しない
// TODO テキスト入力枠の中にいるときは、documentのキーボードイベントを殺す
// TODO 打ち間違いをバックスペースで消せるように。このときに文字枠の文字が選択されないように

require('./core.scss');
var Canvas = require('./Canvas.js');

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
    $canvas = $('.editor');

$document.on('keydown', function (e) {
    if (e.keyCode === keycodes.TAB || e.keyCode === keycodes.BACKSPACE) {
        e.preventDefault();
    }
});

$canvas.attr({
    width: $document.width(),
    height: $document.height()
});

$canvas.each((index, el) => {
    new Canvas(el);

    $(el).on('mouseover', () => {
        console.log('enter');
    });

    $('.editor-outer').hover(() => {
        console.log('in');
    }, () => {
        console.log('out');
    });
});

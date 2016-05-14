// DONE TABでフリーハンドとテキスト選択の切り替え
// TODO カーソルはフリーハンド用の十字と文字高さを表すぼうせんを表示する
// TODO モード切り替え時にカーソルが消える
// TODO モードチェンジしたときはもうちょい派手なエフェクトを出す
// TODO 描画モードのときの文字入力は、コントロール枠を表示しない
// TODO テキスト入力枠の中にいるときは、documentのキーボードイベントを殺す
// TODO 打ち間違いをバックスペースで消せるように。このときに文字枠の文字が選択されないように

require('./core/base.scss');

window.ht = {
    // canvas 上のテキスト入力モード
    inputMode: true
};

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

$(document).on('keydown', function (e) {
    if (!ht.inputMode) {
        return;
    }

    if (_.includes([keycodes.TAB, keycodes.BACKSPACE, keycodes.SPACE], e.keyCode)) {
        e.preventDefault();
    }
});

var Root = require('./core/Root.jsx');
var root = React.createElement(Root);
ReactDOM.render(
    root,
    document.getElementsByClassName('root')[0]
);

require('./vendor/analytics.js');

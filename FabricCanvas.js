var lastDrawingMode = false;

var FabricCanvas = fabric.util.createClass(fabric.Canvas, {

    drawStart: function (e) {
        // フリーハンドモードを on にする
        lastDrawingMode = editor.isDrawingMode;
        editor.isDrawingMode = true;
        this._onMouseDownInDrawingMode(e);
    },

    drawEnd: function (e) {
        // フリーハンドモードを off にする
        this._onMouseUpInDrawingMode(e);
        editor.isDrawingMode = lastDrawingMode;
    }

    // _onMouseMoveInDrawingMode: function(e) {
    //     this.callSuper('_onMouseMoveInDrawingMode', e);
    // }
});

module.exports = FabricCanvas;

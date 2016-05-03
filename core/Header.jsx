class Header extends React.Component {

    constructor () {
        super();

        this.state = {
            colorBtns: [
                {
                    color: 'black',
                    selected: true
                },
                {
                    color: 'red',
                    selected: false
                },
                {
                    color: 'blue',
                    selected: false
                }
            ]
        };
    }

    render () {
        return (
            <div style={styles.outer} className="row">
                <span className="col s1">LOGO</span>
                <span className="col s7">
                    {this.state.colorBtns.map((colorBtn) => {
                         return (
                             <button key={colorBtn.color } className={'mr4 btn waves-effect waves-light ' + colorBtn.color} style={styles.btn} onClick={this.onClickColor.bind(this)} data-color={colorBtn.color}>
                                 <i className={'fa fa-pencil ' + (colorBtn.selected ? '' : colorBtn.color + '-text')} style={{ fontSize: '1.2em'}}></i>
                             </button>
                         );
                     })}
                </span>
                <span className="col s4 right-align">
                    {/* <span className="mr4">user name</span>
                    <span>menu</span> */}
                    <button className="mr4 btn waves-effect waves-light grey" style={styles.btn} onClick={this.onClickClear.bind(this)}>clear</button>
                    <button className="mr4 btn waves-effect waves-light grey" style={styles.btn} onClick={this.onClickExport.bind(this)}>export</button>
                    <button className="mr4 btn waves-effect waves-light blue lighten-1" style={styles.btn} onClick={this.onClickSave.bind(this)}>save</button>
                </span>
            </div>
        );
    }

    onClickColor (e) {
        var $btn = $(e.currentTarget),
            color = $btn.data('color');
        var colorBtns = this.state.colorBtns;
        _.filter(colorBtns, 'selected')[0].selected = false;
        _.filter(colorBtns, { color })[0].selected = true;
        //$btn.find('i').removeClass(color + '-text');
        this.setState({ colorBtns });

        editor.freeDrawingBrush.color = color;
    }

    onClickClear () {
        editor.clear();
        editor.add(window.inputModeLabel);
        editor.add(window.modeIcon);
        editor.renderAll();
    }

    onClickExport () {
    }

    onClickSave () {
        window.editor.remove(window.inputModeLabel);
        window.editor.remove(window.modeIcon);
        localforage.setItem('userData', JSON.stringify(window.editor))
                   .then(() => {
                       window.editor.add(window.inputModeLabel);
                       window.editor.add(window.modeIcon);
                       Materialize.toast('saved', 2000);
                    });
    }
}

const styles = {
    outer: {
        marginBottom: 0,
        padding: '4px 0px',
        color: 'white',
        backgroundColor: '#6F6F6F'
    },
    btn: {
        padding: '0 10px',
        height: '24px',
        lineHeight: '26px',
        fontSize: '12px'
    }
};

module.exports = Header;

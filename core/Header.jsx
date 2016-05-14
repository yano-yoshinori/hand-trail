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
    },
    exportImg: {
        position: 'fixed',
        top: 0,
        left: 0,
        padding: '10px',
        backgroundColor: '#444',
        zIndex: 2,
        width: '90%',
        margin: '5%',
        boxSizing: 'content-box',
        borderRadius: '4px'
    },
    fileName: {
        height: '1rem',
        width: '140px',
        margin: '0 0 0 10px'
    },
    fileList: {
        display: 'inline',
        width: '140px',
        margin: '0 12px 0 0',
        height: '1.5rem',
        color: 'black'
    }
};

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
            ],
            fileName: '',
            currentFileName: '',
            fileNames: []
        };

        localforage.getItem('fileList').then(
            (data) => {
                var fileNames = data ? JSON.parse(data) : [];
                this.setState({ fileNames });
                if (fileNames.length > 0) {
                    localforage.getItem(_.first(fileNames)).then(
                        (data) => {
                            editor.clear();
                            editor.loadFromJSON(data, () => {
                                editor.renderAll();
                            });
                        });
                }
            });
    }

    render () {
        return (
            <div style={styles.outer} className="row">
                <span className="col s1">LOGO</span>
                <span className="col s7">
                    <select className="browser-default" style={ styles.fileList } value={this.state.currentFileName} onChange={this.onChangeFileList.bind(this)}>
                        {this.state.fileNames.map((fileName) => {
                             return (
                                 <option key={fileName}>{fileName}</option>
                             );
                         })}
                    </select>

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
                    <input text="file name" style={ styles.fileName } onFocus={this.onFocusFileName.bind(this)} onBlur={this.onBlurFileName.bind(this)} onMouseEnter={this.onEnterFileName.bind(this)} onMouseLeave={this.onLeaveFileName.bind(this)} onChange={this.onChangeFileName.bind(this)} value={this.state.fileName} />
                    <button className="mr4 btn waves-effect waves-light blue lighten-1" style={styles.btn} onClick={this.onClickSave.bind(this)}>save</button>
                </span>
            </div>
        );
    }

    onChangeFileList (e) {
        var fileName = e.target.value;
        this.setState({
            currentFileName: fileName,
            fileName
        });
        localforage.getItem(fileName).then(
            (data) => {
                editor.clear();
                editor.loadFromJSON(data, () => {
                    editor.renderAll();
                });
                Materialize.toast('loaded', 2000);
            });
    }

    onFocusFileName () {
    }

    onBlurFileName () {
    }

    onEnterFileName (e) {
        ht.inputMode = false;
        e.target.focus();
    }

    onLeaveFileName (e) {
        ht.inputMode = true;
        e.target.blur();
    }

    onChangeFileName (e) {
        this.setState({ fileName: e.target.value });
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
        var url = editor.toDataURL();
        window.open(url, '_blank');
    }

    onClickSave () {
        window.editor.remove(window.inputModeLabel);
        window.editor.remove(window.modeIcon);
        localforage.setItem(this.state.fileName, JSON.stringify(window.editor)).then(
            () => {

                window.editor.add(window.inputModeLabel);
                window.editor.add(window.modeIcon);

                localforage.getItem('fileList').then(
                    (data) => {
                        var fileNames = JSON.parse(data);;
                        if (!_.isArray(fileNames)) {
                            fileNames = [];
                        }
                        // 重複していたら追加しない
                        if (!_.includes(this.state.fileNames, this.state.fileName)) {
                            fileNames.push(this.state.fileName);
                        }
                        fileNames.sort();
                        localforage.setItem('fileList', JSON.stringify(fileNames)).then(
                            () => {
                                this.setState({ fileNames: fileNames });
                                Materialize.toast('saved', 2000);
                            });
                    });
                });
    }
}

module.exports = Header;

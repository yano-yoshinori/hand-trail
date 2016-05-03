var Header = require('./Header.jsx'),
    Canvas = require('../Canvas.js');

class Root extends React.Component {

    constructor () {
        super();

        this.state = {
            pixy: {}
        };
    }

    render () {
        return (
            <div>
                <Header />
                <div id="1" className="editor-outer">
                    <canvas className="editor" style={{ overfloe: 'hidden' }}></canvas>
                </div>
                {/*
                <div style={this.state.pixy}>
                    <div style={{position: 'absolute', top: '-3px', left: '-17px'}}>Pen</div>
                    <div style={{position: 'absolute', top: '17px', left: 0, fontSize: '36px'}}>[</div>
                    <div style={{position: 'absolute', top: '-6px', left: '-22px', width: '40px', height: '70px', backgroundColor: 'rgba(0, 0, 0, 0)'}}></div>
                </div>
                */}
            </div>
        );
    }

    componentDidMount () {
        var $document = $(document),
            $canvas = $('.editor');

        $canvas.attr({
            width: $document.width(),
            height: $document.height() - 40
        });

        var canvas = null;
        $canvas.each((index, el) => {
            canvas = new Canvas(el);

            /* $(el).on('mouseover', () => {
               console.log('enter');
               });

               $('.editor-outer').hover(() => {
               console.log('in');
               }, () => {
               console.log('out');
               }); */
        });

        /* var pixy = new Backbone.Model({
           position: 'fixed',
           top: 0,
           left: 0,
           opacity: 0.3
           });
           pixy.on('change', (model) => {
           this.setState({pixy: model.toJSON()});
           });
           ht.pixy = pixy; */
    }
}

const styles = {
    pixy: {
        position: 'fixed',
        top: 0,
        left: 0
    }
};

module.exports = Root;

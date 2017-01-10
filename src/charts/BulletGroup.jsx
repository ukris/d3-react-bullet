import React, {Component} from 'react';
import BulletChart from './BulletChart';
import * as ReactDOM from 'react-dom';
import  '../dashboard.css';
import ToolTip from './BulletToolTip';

import {Utils} from './Utils';
var themes = require('./theme.json');

class BulletGroup extends Component {
    constructor(props) {
        super(props);
        let width = window.innerWidth,
            small = false;

        if (width <= Utils.SMALL.WIDTH) {
            small = true;
        }
        small = this.init(small);

        if (props.vertical) {
            this.state = {
                width: this.params.theme.vertical.width,
                height: this.params.theme.vertical.height,
                small: small,
                currentChart: null,
                eventPosition: {}
            }
        } else {
            this.state = {
                width: this.params.theme.horizontal.width,
                height: this.params.theme.horizontal.height,
                small: small,
                currentChart: null,
                eventPosition: {}
            }
        }
    }

    init(small) {
        let themeName = this.props.themeName || null,
            theme,
            max,
            margin,
            cls = '',
            currentChart = null,
            eventPosition = {};

        if (!themeName || !themes[themeName] || !themes[themeName].group) {
            cls += ' default';
            theme = Utils.deepMerge(this.props.default_theme,this.props.theme);
        } else {
            cls += ' ' + themeName;
            theme = Utils.deepMerge(Utils.deepMerge(this.props.default_theme,themes[themeName].group), this.props.theme);
        }
        theme = JSON.parse(JSON.stringify(theme));
        if (this.props.vertical) {
            max = {
                height: theme.vertical.max.height
            }
            margin = theme.vertical.margin;
            if (small) {
                margin = theme.vertical.min.margin;
            }
        }
        else {
            if (theme.horizontal.width <= Utils.SMALL.WIDTH) {
                small = true;
            }
            max = {
                width: theme.horizontal.max.width
            }
            margin = theme.horizontal.margin;
            if (small) {
                margin = theme.horizontal.min.margin;
            }
        }
        this.params = {theme, cls, themeName, max, margin
                    ,currentChart,eventPosition};
        return small;
    }

    onResize() {
        let width = this.params.node.offsetWidth,
            height = this.params.node.offsetHeight,
            vertical = this.props.vertical,
            small = this.state.small;

        if (window.innerWidth < width) {
            width = window.innerWidth;
        }
         if (window.innerWidth < width) {
            width = window.innerWidth;
        }
        if (vertical) {
            if (height !== this.state.height) {

                if (height > this.params.theme.vertical.height) {
                    height = this.params.theme.vertical.height;
                }
                this.setState({height});
                this.params.margin = this.params.theme.margin;
            }
        } else {
            if (width !== this.state.width) {
                if (width > this.params.theme.horizontal.width) {
                    width = this.params.theme.horizontal.width;
                }
                if (width <= Utils.SMALL.WIDTH) {
                    small = true;
                    this.params.margin = this.params.theme.horizontal.min.margin;
                }
                else {
                    small = false;
                    this.params.margin = this.params.theme.horizontal.margin;
                }
                this.setState({width,small})
            }
        }
        
    }

    onMouseMove(event, chartData) {
        if (chartData) {
            event.stopPropagation();
        }
        
        this.setState({
            currentChart: chartData,
            eventPosition: {
                left: event.clientX,
                top: event.clientY
            }
        });
    }

    componentDidMount() {
        let node = ReactDOM.findDOMNode(this).children[1];
        this.params.node = node;
        this.onResize = this.onResize.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        
        this.onResizeDebounce = Utils.debounce(this.onResize, 5);
        window.addEventListener("resize", this.onResizeDebounce);
        this.onMouseMoveDebounce = Utils.debounce(this.onMouseMove, 10);
        window.addEventListener("mousemove", this.onMouseMoveDebounce);
        
        this.onResize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onResizeDebounce);
        window.removeEventListener("mousemove", this.onMouseMoveDebounce);
    }

    render() {
        const charts = this.props.charts,
            vertical = this.props.vertical,
            margin = this.params.margin,
            ocls = this.props.class || '',
            cls = this.params.cls,
            themeName = this.params.themeName,
            outerCls = 'item ' + ocls+ cls;

        let item = Object.assign({},this.params.theme.item),
            max = this.params.max,
            title = this.props.title,
            small = this.state.small,
            innerCls = cls;

        if (vertical) {
            //item.maxHeight = max.height;
            innerCls = 'row-content item-content ' + cls + ' ' + ocls;
        } else {
            innerCls = 'column-content item-content' + cls + ' ' + ocls;
        }

        title = title ? <h4>{title}</h4> : '';

        let eventPosition = this.state.eventPosition;

        return (
            <div className={outerCls} style={item}>
                <div className="chart-title">
                    {title}
                </div>
                <div className={innerCls}>
                    {
                        charts.map((chart, index) => {
                            return (
                                <div className="cover-chart" key={index} onMouseMove={(event) => this.onMouseMove(event, chart)}>
                                    <BulletChart
                                        id={index}
                                        key={index}
                                        markers={chart.markers}
                                        measures={chart.measures}
                                        ranges={chart.ranges}
                                        title={chart.title}
                                        subtitle={chart.subtitle}
                                        reverse={chart.reverse}
                                        vertical={vertical}
                                        themeName={themeName}
                                        width={this.state.width}
                                        height={this.state.height}
                                        max={max}
                                        small={small}
                                        margin={margin}
                                        triangle={chart.triangle}
                                        ocls={ocls}
                                    ></BulletChart>
                                </div>
                            )
                        })
                    }
                </div>
                <ToolTip chartData={this.state.currentChart} top={eventPosition.top} left={eventPosition.left} />
            </div>
        );
    }
}

BulletGroup.defaultProps = {

    vertical: true,

    default_theme: {
        vertical: {
            width: 100,
            height: 300,
            margin: {
                    top: 5,
                    right: 40,
                    bottom: 10,
                    left: 40
            },
            max: {
                height: 300,
            },
            min: {
                width: 90,
                margin: {
                    top: 5,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            }
        },
        horizontal: {
            height: 75,
            width: 450,
            margin: {
                    top: 10,
                    right: 20,
                    bottom: 50,
                    left: 20
            },
            max: {
               width: 800,
            },
            min: {
                width: 300,
                margin: {
                    top: 5,
                    right: 10,
                    bottom: 50,
                    left: 10
                }
            }
        },
        item: {}
    },
    title: 'Bullet Chart'
}

export default BulletGroup;

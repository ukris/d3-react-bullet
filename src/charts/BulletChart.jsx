import React, {
    Component
} from 'react';
import * as ReactDOM from 'react-dom';
import * as d3 from "d3";
import './bullet.css';

var themes = require('./theme.json');

class BulletChart extends Component {
    constructor(props) {
        super(props);
        this.init();
        this.state = {
            width: this.props.width ,
            height: this.props.height,
            small: this.props.small
        };
    }
    init() {
        let theme = Object.assign({}, this.props.default_theme),
            cls,
            themeName = this.props.themeName,
            vertical = this.props.vertical;

        if ((themeName) && (themes[themeName])) {
            theme = Object.assign(theme, themes[themeName].charts);
        }
        else {
            themeName = 'default';
        }
        theme = Object.assign(theme, this.props.theme);
        theme = JSON.parse(JSON.stringify(theme));

        const rangeZ = this.props.ranges.length ? this.props.ranges.slice(0).sort(d3.descending):[0],
            markerZ = this.props.markers.length ? this.props.markers.slice(0).sort(d3.descending):[0],
            measureZ = this.props.markers.length ? this.props.measures.slice(0).sort(d3.descending):[0],
            domain = Math.max(rangeZ[0], markerZ[0], measureZ[0]);

        cls = themeName  || 'default';
        cls += ' bullet';

        if (vertical) {
            cls += ' row';
        } else {
            cls += ' column';
        }
        let params = {
            rangeZ,
            markerZ,
            measureZ,
            domain,
            theme,
            themeName,
            cls
        };
        this.params = params;
    }
    shouldComponentUpdate(props,next) {
        if ((this.props.width !== this.state.width) 
            || (this.props.height !== this.state.height)
            || (this.props.small !== this.state.small))
            return true;
        else
            return false;
    }
    componentDidUpdate() {
        this.update();
    }
    update() {
        this.setResizeParams();
        this.renderBulletWrapper();
        this.renderAxis();
        this.renderTitle();
        this.renderBullet();
    }
    componentDidMount() {
        const vertical = this.props.vertical,
            node = this.params.node = ReactDOM.findDOMNode(this),
            D3node = this.params.D3node = d3.select(node);

        this.params.parentNode = node.parentNode;
        this.params.outerWrapper = D3node.select('.outer-wrap');
        this.params.bulletWrapper = D3node.select('.wrap');
        this.params.axisWrapper = D3node.select('.axis')
        this.params.titleWrapper=D3node.select('.title-wrap');
        this.params.xAxis = d3.svg.axis().ticks(5);
        this.params.xAxis.orient(vertical ? 'left' : 'bottom');
        this.update();
    }

    setResizeParams() {
        const vertical = this.props.vertical,
              margin = this.props.margin,
              hm = margin.right + margin.left,
              vm = margin.top + margin.bottom,
              theme = this.params.theme;

        let width = this.props.width,
            height = this.props.height,
            small = this.props.small,
            aHeight = height - vm ,
            aWidth = width - hm,
            extentX,
            extentY;

        if  (vertical) {
            aHeight  -= 50;
            this.setState({height,small});
        }
        else {
            // adjust for side label
            aWidth -= 50;
            if ((small) || (theme.title.position === 'bottom')) {
                aWidth += 50;
            }
            this.setState({width,small});
        }
        extentX = aWidth;
        extentY = aHeight;
        const props = this.props,
            params = this.params,
            domain = params.domain,
            reverse = props.reverse;

        if  (vertical) {
            extentX = aHeight;
            extentY = aWidth
        }
        this.params.aWidth = aWidth;
        this.params.aHeight = aHeight;

        var x1 = d3.scale.linear()
            .domain([0, domain])
            .range(reverse ? [extentX, 0] : [0, extentX]);
          // Retrieve the old x-scale, if this is an update.
        
        this.params.x1 = x1;

        this.params.extentX = extentX;
        this.params.extentY = extentY;
    }
    renderBulletWrapper() {
        const 
            params = this.params,
            aWidth = params.aWidth,
            vertical = this.props.vertical,
            wrap = params.bulletWrapper,
            outer = params.outerWrapper,
            theme = params.theme,
            margin = this.props.margin;

        if (vertical) {
            wrap.attr("transform", "rotate(90)translate(0," + - aWidth + ")");
        } else {
            if ((theme.title.position === 'bottom') || (this.state.small)) {
                wrap.attr("transform", null);
                outer.attr("transform", "translate("+margin.left+",0)");
            }
            else {
                outer.attr("transform", "translate("+(Number(margin.left)+65)+",0)");
            }
        }
    }
    renderBullet() {
        function bulletWidth(x) {
            debugger;
            var x0 = x(0);
            return function(d) {
                return Math.abs(x(d) - x0);
            };
        }

        const props = this.props,
            params = this.params,
            reverse = props.reverse,
            rangeZ = params.rangeZ,
            domain = params.domain,
            markerZ = params.markerZ,
            measureZ = params.measureZ,
            x1 = params.x1,
            w1 = bulletWidth(x1),
            wrap = params.bulletWrapper,
            extentY = params.extentY,
            extentX = params.extentX,
            theme = params.theme;

        let range = wrap.selectAll("rect.range")
            .data(rangeZ);

        range.enter().append("rect")
            .attr("class", function(d, i) { return "range s" + i })
            .attr("data-range", function(d, i) { return d })
            .attr("width", w1)
            .attr("height", extentY)
            .attr("x", reverse ? x1: 0)

        // Update the measure rects.
        var measure = wrap.selectAll("rect.measure")
            .data(measureZ);

        measure.enter().append("rect")
            .attr("class", function(d, i) { return "measure s" + i; })
            .attr("data-measure", function(d, i) { return d; })
            .attr("width", w1)
            .attr("height", extentY / 3)
            .attr("x", reverse ? x1 : 0)
            .attr("y", extentY / 3);

        let trig = props.triangle;

        if (trig) {
            if (!(trig === 'high') && !(trig==='low')) {
                trig = 'high';
            }
        }
        
        // Update the marker lines.
        if ((props.vertical) || (!props.vertical && !trig)) {
            let marker = wrap.selectAll("line.marker")
                            .data(markerZ),
                mval = markerZ.join(' '),
                y1 = extentY / 6,
                y2 = extentY * 5 / 6,
                cls = 'marker ';

                if (theme.marker.style) {
                    y1 = 0 - extentY;
                    y2 = 0 + extentY;
                }
                if (trig) {
                    cls += trig+'-marker';
                }
                marker
                    .enter()
                    .append("line")
                    .attr("class", cls)
                    .attr("data-marker",mval);
                d3.transition(marker)
                    .attr("x1", x1)
                    .attr("x2", x1)
                    .attr("y1", y1)
                    .attr("y2", y2);
        }
        else {
            let trig = props.triangle,
                rot="",
                marker = wrap.selectAll("path.triangle")
                            .data(markerZ)

                if (trig === 'high') {
                    trig = 'high';
                    rot="rotate(180)";
                }
                marker
                    .enter()
                    .append("path")
                    .attr("d",themes.helpers.triangle.d)
                    .attr("class",'triangle ' + trig)
                    .attr("transform", function(d, i) {return "translate("+Number(d/domain * extentX)+',' + 10 + ")"+rot});
        }
    }
    renderAxis() {
        const params = this.params,
              props = this.props,
              extentY = params.extentY,
              vertical = props.vertical,
              xAxis = params.xAxis,
              D3node = params.D3node,
              x1 = params.x1,
              axis= D3node.select("g.axis");

        axis
            .attr("transform", vertical ? null : "translate(0," + extentY + ")")
            .call(xAxis.scale(x1));
    }
    renderTitle() {
        if (!this.props.title) {
            return;
        }
        const aHeight = this.params.aHeight,
            aWidth = this.params.aWidth,
            vertical = this.props.vertical,
            title = this.params.titleWrapper,
            theme = this.params.theme,
            state = this.state,
            width = this.state.width,
            margin = this.props.margin;

        let w = aWidth,
            h = aHeight,
            dy1 = 0,
            dy2 = 0;

        if (vertical) {
            h += 20;
            w = width - margin.left;
        } else {
            if ((state.small) || (theme.title.position === 'bottom')) {
                w += margin.left;
                h = 50;
            }
            else {
                w = 80;
                h = 0;
                dy1 = "1em";
                dy2 = "2.5em";
                let t1 = title.select('.title'),
                    t2 = title.select('.subtitle')
                t1.attr('dy',dy1);
                t2.attr('dy',dy2);
            }
        }
        title.attr("transform", "translate(" + w + ',' + (h) + ")")

    }
    getTitle() {
        if (!this.props.title) {
            return null;
        }
        const props = this.props, 
                themeName = this.params.themeName,
                theme = this.params.theme,
                style = {
                    "textAnchor":"end"
                },
                title = this.props.title,
                titleCls = 'title-wrap ' + themeName,
                titleStyle = theme.title.style || {};

        let subtitleT = this.props.subtitle,
            subtitle,
            high_low = 'title ';
        if (props.triangle) {
            high_low += props.triangle+'-text';
        }
        if (subtitleT) {
            const  subtitleStyle = theme.subtitle.style || {};
            subtitle =  <text className = 'subtitle'
                            dy = "1em"
                            style = {subtitleStyle}>
                            {subtitleT}
                        </text>
        } else {
            subtitle = null;
        }
        return (
            <g  style={style}
                className={titleCls} data-title={title} data-subtitle={subtitleT}>
                <text className={high_low} style={titleStyle}>
                    {title}
                </text>
                {subtitle}
            </g>
        )
    }
    render() {
        const margin = this.props.margin,
            transform='translate(' + margin.left + ',' + margin.top + ')',
            theme = this.params.theme,
            themeCls = this.params.cls + ' ' + this.props.ocls,
            wrapStyle = theme.wrap || {},
            axisStyle = theme.axis || {},
            themeStyle = theme.style || {},
            Title = this.getTitle();

        let width = this.state.width,
            height = this.state.height;

        if (this.props.vertical) {
            height += margin.bottom;
        }
        else {
            width += margin.left+margin.right;
        }
        return (
            <svg width={width} height={height}
                className={themeCls}  style={themeStyle}
            >
                <g className='outer-wrap' transform={transform}>
                    <g className="wrap" style={wrapStyle}></g>
                    <g className="axis" style={axisStyle}></g>
                </g>
                {Title}
            </svg>
        );
    }
}

BulletChart.defaultProps = {

    vertical:true,
    reverse: false,

    default_theme: {
        font: '10 px Roboto sans-serif',
        marker: {
            stroke: '#000',
            'strokeWidth': '2px'
        },
        axis: {
            stroke: '#666',
            'strokeWidth': '.5px',
            'fill': 'none'
        },
        range: {
            s0: {
                'fill': '#eee'
            },
            s1: {
                'fill': '#ddd'
            },
            s2: {
                'fill': '#ccc'
            }
        },
        measure: {
            s0: {
                'fill': '#b0c4de'
            },
            s1: {
                'fill': '#4682b4'
            }
        },
        'title': {
          //  'fill': '#ddd'
        },
        'subtitle': {
//            'fill': '#999'
        }
    }
}

export default BulletChart;

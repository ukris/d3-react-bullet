import React, {Component, PropTypes} from 'react';
import "./tooltip.css";

class ToolTip extends Component {
    render() {
        if (!this.props.chartData) return null;
        const chartData = this.props.chartData;
        var x = this.props.left;
        var y = this.props.top;
        var width = 266;
        var height = 144;
        var translate = "";
        var arrowWidth = 20;
        var arrowHeight = 10;
        var transformArrow = "";

        if (y >= height) {
            arrowHeight = -10;
            translate = 'translate(' + (-width/2) + 'px,' + (-height) + 'px)';
            transformArrow = 'translate(' + (width/2 - arrowWidth) + ',' + (height + arrowHeight) +')';
        } else if (y < height) {
            translate = 'translate(' + (-width/2) + 'px,' + 0 + 'px)';
            transformArrow = 'translate(' + (width/2 - arrowWidth) + ',' + arrowHeight +') rotate(180,20,0)';
        }

        let customStyle = {
            top: y + arrowHeight * 2,
            left: x,
            width: width,
            transform: translate
        };

        return (
            <div className="cover-tooltip">
                <div className="tooltip" style={customStyle}>
                    <svg width={width} height={height}>
                        <polygon points="10,0  30,0  20,10" transform={transformArrow} fill="rgba(0, 0, 0, 0.5)"></polygon>
                    </svg>
                    <div className="tooltip-content" style={{height: height - 20}}>
                        <div className="tooltip-row">Title: {chartData.title}</div>
                        <div className="tooltip-row">SubTitle: {chartData.subtitle}</div>
                        <div className="tooltip-row">Measures: {chartData.measures.join(" ")}</div>
                        <div className="tooltip-row">Ranges: {chartData.ranges.join(" ")}</div>
                        <div className="tooltip-row">Markers: {chartData.markers.join(" ")}</div>
                    </div>
                </div>
            </div>
        );
    }
}

ToolTip.propTypes = {
    chartData: PropTypes.object
}

export default ToolTip;

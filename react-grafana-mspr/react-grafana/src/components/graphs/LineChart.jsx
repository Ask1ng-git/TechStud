import React, { Component } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { loadCSVData, transformWeatherData } from '../../utils/csvLoader';
import {ResponsiveContainer} from 'recharts'
import {updateData} from "../../actions/action-dispatcher";
import connect from "react-redux/es/connect/connect";

export const theme = {
    tickText: '#7c7c7c',
    gridStroke: '#000',
    lineStroke: '#ff8b00',
    dotFill: '#1c0d00',
    dotStroke: '#b1b1b1',
    legendColor: '#7c7c7c'
}

export class CustomizedAxisTick extends React.Component{
    constructor(props){
        super(props)
    }

    render () {
        const {x, y, stroke, payload} = this.props;
        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} textAnchor="end" fontSize={12} fill={theme.tickText}>{payload.value}</text>
            </g>
        );
    }
};

class LineChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        };
    }

    async componentDidMount() {
        try {
            const rawData = await loadCSVData('/data/csv/weather-data.csv');
            const transformedData = transformWeatherData(rawData);
            this.setState({ data: transformedData });
        } catch (error) {
            console.error('Error loading CSV data:', error);
        }
    }

    render() {
        const { data } = this.state;
        
        return (
            <ResponsiveContainer>
                <RechartsLineChart width={600} height={300} data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dt_txt" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="main.temp" stroke="#8884d8" name="Temperature" />
                    <Line type="monotone" dataKey="main.humidity" stroke="#82ca9d" name="Humidity" />
                </RechartsLineChart>
            </ResponsiveContainer>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        lineData: state.line.lineData
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        updateData: (type) => dispatch(updateData(type))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LineChart)

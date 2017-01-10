import React, { Component } from 'react';
import './dashboard.css';
import './App.css';
import BulletGroup from './charts/BulletGroup';
var groups = require('./data/bullets.json');

class App extends Component {
    render() {
        return(
            <div className="dashboard">
                {
                    groups.map((group, index) => {
                        const   vertical = group.vertical || false,
                                themeName = group.theme || null,
                                title = group.title || null,
                                charts = group.charts,
                                cls = group.class;
                        return  (
                            <BulletGroup
                                title={title}
                                vertical={vertical}
                                charts={charts}
                                themeName={themeName}
                                class={cls}
                                key={index}
                            ></BulletGroup>
                        );
                    })
                }
            </div>
        )
    }
}

export default App

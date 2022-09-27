import React from 'react';
import Login from "./Login";
import {Button, Card, Col, Row} from "antd";
import {Link} from "react-router-dom";
import axios from "axios";

export function Home() {
    return <div>
        <h1>Welcome to restchain</h1>

        <p>Introduction to restchain plattaform </p>

        <Button onClick={() => LoadInfo()}>Learn more</Button><Button>About</Button>

        <div style={{background: '#ECECEC', padding: '30px', marginTop: 30}}>
            <Row >
                <Col span={8}>
                    <Card title="Dapp Interaction" bordered={false} style={{textAlign: 'center'}}>
                        <p> Interact with a delpoyed bpmn choreography dapp </p>
                        <Link to={'/dapp'}><Button>Dapp interaction</Button></Link>
                    </Card>
                </Col>
            </Row>
        </div>
    </div>
}


function LoadInfo(id) {

    axios.get('api2/users/1').then((r) => console.log(" re", r, r.data)).catch((e) => console.log(" e", e));
}
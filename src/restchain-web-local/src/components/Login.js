import React, {useState} from 'react';
import {Button, Form, Icon, Input, Result, Row} from "antd";
import qs from 'querystring';
import axios from "axios";
import {Link, Redirect} from "react-router-dom";
import {useAuth} from "./Authentication/context/auth";

const FormItem = Form.Item;

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

const LoginForm = (props) => {

    const {isAuthenticated, setAuthenticated, user, setUser} = useAuth();
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const [address, setAddress] = useState("");

    function postLogin(props) {
        setIsError(false);
        setError("");

        const data = qs.stringify({
            address: address,
            password: password
        });
        axios.post('api2/login',
            data,
            // {
            //     headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            // }
        )
            .then(result => {
                if (result.status === 200) {

                    setAuthenticated(true);
                    return axios.get(`api2/users/${address}`).then(result => result.status == 200 ? setUser(result.data) : '')
                } else {
                    setIsError(true);
                    setError(result.data.message);
                }
            }).catch(e => {
            setIsError(true);
            setError(e.message);
        });
    }

    const {getFieldDecorator, getFieldsError} = props.form;

    if (isAuthenticated) {
        return <Redirect to="/"/>;
    }

    return (
        <div>
            <Result
                // style={{width:'100%',height:'100%'}}
                icon={<Icon type="login"/>}
                title="Login"
                subTitle={
                    <span>valid account:
                        <ul>
                            <li>0x535CCa8697F29DaC037a734D6984eeD7EA943A85</li>
                            <li>0x9515365F4cB7463E7d0B9A12De7706dE6EB62709</li>
                            <li>0x901D7C8d516a5c97bFeE31a781A1101D10BBc8e9</li>
                        </ul>
                        <p>
                            password: test
                        </p>
                    </span>

                }
            />
            <div
                style={{width: '50%', margin: '0 auto'}}
            >
                <Form id='loginForm' style={{width: '50%', margin: '0 auto'}}
                >
                    <FormItem>
                        {getFieldDecorator('address', {
                            rules: [{
                                required: true,
                                // message: 'login.form.message.username.required'
                            }],
                        })(
                            <Input
                                prefix={<Icon type="user" style={{fontSize: 13}}
                                />}
                                placeholder={'test address'}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('password', {
                            rules: [{
                                required: true,
                            }],
                        })(
                            <Input prefix={<Icon type="lock" style={{fontSize: 13}}/>} type="password"
                                   placeholder={'test'}
                                   onChange={(e) => setPassword(e.target.value)}
                            />
                        )}
                    </FormItem>
                    {(isError) ? <div style={{color: 'red'}}>{error}</div> : ''}
                    {isError && console.log("ee ", JSON.stringify(error))}
                    <FormItem>
                        <Row style={{display: 'flex', justifyContent: 'space-between'}}>
                            <Button type="primary" htmlType="submit" disabled={hasErrors(getFieldsError())}
                                    onClick={postLogin}>
                                Log in
                            </Button>
                            <Link to={'/signup'}>sing up</Link>
                        </Row>
                    </FormItem>
                </Form>
            </div>
        </div>
    )
}
const Login = Form.create()(LoginForm)

export default Login;
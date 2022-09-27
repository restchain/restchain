import {Modeler} from "./Modeler/Modeler";
import {Home} from "./Home";
import React from "react";
import {Route, Switch} from "react-router-dom";
import Deploy from "./Deploy/Deploy";
import PrivateRoute from "./Authentication/PrivateRoute";
import Login from "./Login";
import Signup from "./Signup";
import axios from "axios";
import Dapp from "./Dapp/Dapp";
import ContractLoader from "./Dapp/ContractLoader";

export function Routes() {
    // // Add a 401 response interceptor
    // axios.interceptors.response.use(function (response) {
    //
    //     console.log("Interceptors ",JSON.stringify(response))
    //
    //     return response;
    // }, function (error) {
    //     console.log(" ",)
    //     if (404 === error.response.status) {
    //         window.location = '/login';
    //     } else {
    //         return Promise.reject(error);
    //     }
    // });
    return (
        <Switch>
            <PrivateRoute path="/deploy/:id" component={Deploy}/>
            <PrivateRoute path="/deploy" component={Deploy}/>
            <PrivateRoute path="/design/:id" component={Modeler}/>
            <PrivateRoute path="/design" component={Modeler}/>
            <PrivateRoute path="/dapp/:id" component={ContractLoader}/>
            <PrivateRoute path="/dapp" component={Dapp}/>
            <Route path="/login">
                <Login/>
            </Route>
            <Route path="/signup">
                <Signup/>
            </Route>
            <Route path="/">
                <Home/>
            </Route>
        </Switch>
    )
}
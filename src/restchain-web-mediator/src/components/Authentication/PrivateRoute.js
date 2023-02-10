import React from "react";
import {Redirect, Route} from "react-router-dom";
import {useAuth} from "./context/auth";

function PrivateRoute({component: Component, ...rest}) {
    const {isAuthenticated} = useAuth();

    const onRender = (props) => {
        console.log("PrivateRoute, user isAuth?", isAuthenticated)
        return isAuthenticated ? (
            <Component {...props} />
        ) : (
            <Redirect to="/login"/>
        )
    }

    return (
        <Route
            {...rest}
            render={onRender}
        />
    );
}

export default PrivateRoute;
import axios from 'axios';
import React from "react";
import {Redirect} from "react-router-dom";

axios.interceptors.response.use((response) => {
    console.log("rr ",response)
    return response;
}, (error) => {

    switch (error.response.status) {
        case 400:
            console.log('Bad request');
            break;
        case 404:
            console.log('Bad request');
            break;
        case 401:
            return <Redirect to={'/login'} />
            break;
        default:
            console.error("axios interceptor error ", JSON.stringify(error));
    }
    return Promise.reject(error);
});
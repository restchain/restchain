import React from "react";

const UserView = (props) => {
    if (props.accounts)
        return (<div><strong>User account :</strong> {props.accounts[0]}</div>

        )
    return (<div>No Blockchain account loaded!</div>)

}

export  default UserView;
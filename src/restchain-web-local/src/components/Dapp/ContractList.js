import React from "react";
import {Button, Table} from "antd";
import {Link} from "react-router-dom";


function ContractList({dataSource, refreshModel}) {

    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            onFilter: (value, record) => record.id.indexOf(value) === 0,
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['descend'],

        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            render: (text,record)=>{
                return <Link to={'/dapp/'+record.id}>{text}</Link>
            }
        }, {
            title: 'ImplementationName',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'ChoreographyName',
            dataIndex: 'instanceName',
            key: 'instanceName',
        },
        {
            title: 'Created',
            dataIndex: 'created',
            key: 'created',
        },

    ]
    return (
        <Table dataSource={dataSource} columns={columns} rowKey={record => record.id}  />
    )
}

export default ContractList;
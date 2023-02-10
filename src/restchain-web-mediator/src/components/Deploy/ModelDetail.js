import React, {useState} from "react";
import _ from "lodash";
import {
    Button,
    Collapse,
    Descriptions,
    Divider,
    Drawer,
    Empty,
    Icon,
    notification,
    Select,
    Spin,
    Table,
    Tag,
} from "antd";
import axios from 'axios';
import {connect} from 'react-refetch'
import {CreateInstance} from "./CreateInstance";
import {useAuth} from "../Authentication/context/auth";
import SyntaxHighlighter from 'react-syntax-highlighter';
import {docco} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import EditorSol from "./EditorSol";

const {Panel} = Collapse;
const {Option} = Select;

function ModelDetail({visible, hide, id, modelFetch, refreshModel, selfSubscribe}) {

    const [showCreateInstance, setShowCreateInstance] = useState(false);
    const {user} = useAuth();

    console.log("user ", user)

    if (modelFetch.pending) {
        return <Spin/>
    } else if (modelFetch.rejected) {
        return <></>
        // return <div>{modelFetch.reason}</div>
    } else if (modelFetch.fulfilled) {
        const model = modelFetch.value;

        return (
            <Drawer
                title="Model detail"
                visible={visible}
                onClose={hide}
                width={800}
            >
                <Descriptions title="Model Info" column={2}>
                    <Descriptions.Item label="Id">{model.id}</Descriptions.Item>
                    <Descriptions.Item label="Uploaded by">{model.address}</Descriptions.Item>
                    <Descriptions.Item label="Name">{model.name}</Descriptions.Item>
                    <Descriptions.Item label="Available roles">
                        <ul>
                            {model.participants && model.participants.map((p, i) => <li key={i}>{p.name}</li>)}
                        </ul>
                    </Descriptions.Item>
                    <Descriptions.Item label="Created instances">
                        {model.instances && model.instances.length}</Descriptions.Item>
                </Descriptions>
                <div style={{float: 'right', margin: 10}}>
                    <Button type={'primary'} onClick={() => setShowCreateInstance(true)}>Create instance</Button>
                    <Button type={'danger'}>Delete model</Button>
                </div>
                <Divider/>
                <Collapse accordion>
                    {model.instances.map((data, key) => InstanceRow(data, key, refreshModel, user))}
                    {model.instances && model.instances.length === 0 && <Empty description={'No instances'}/>}
                    {console.log(" MODEL instanceRow", model)}
                </Collapse>
                {showCreateInstance &&
                <CreateInstance
                    model={model}
                    visible={showCreateInstance}
                    hide={() => setShowCreateInstance(false)}
                    refreshModel={refreshModel}
                />
                }
            </Drawer>
        )
    }
}

export default connect(props => {
    const url = `/api2/model/${props.id}`
    return {
        modelFetch: url,
        refreshModel: () => ({
            modelFetch: {
                url,
                force: true,
                refreshing: true
            }
        }),
    }
})(ModelDetail)


const InstanceRow = (data, key, refreshModel, user) => {
    // console.log("user ", user)
    // console.log("key ", key)
    // console.log("data ", data)
    const handleOnClick = (e) => {
        e.stopPropagation();
        console.log(" deploy",)
        axios.post("/api2/instance/deploy", {id: data.id}).then(
            function (response) {
                if (response.status === 201) {
                    notification['success']({
                        message: 'Deploy successful',
                        description: `Instance: ${data.id} has been correctly deployed`
                    });

                }
                refreshModel();
            }).catch((e) => {
            let error = {};

            if (e && e.response && e.response.data) {
                error = {message: e.message, description: e.response.data};
            }

            if (e && e.response && e.response.data && e.response.data.message) {
                error = {message: e.message, description: e.response.data.message};
            }

            notification['error']({
                message: 'Deploy failed - ' + error.message,
                description: error.description
            });
            console.error(JSON.stringify(e));

            // }
        })
    }

    const handleOnDelete = (e) => {
        e.stopPropagation();
        console.log(" deploy",)
        axios.delete(`/api2/instance/${data.id}`).then(
            function (response) {
                if (response.status === 200) {
                    notification['success']({
                        message: 'Instance successfully deleted',
                        description: response.data
                    });
                }
                refreshModel();
            }).catch((e) => {
            let error = {};

            if (e && e.response && e.response.data) {
                error = {message: e.message, description: e.response.data};
            }

            if (e && e.response && e.response.data && e.response.data.message) {
                error = {message: e.message, description: e.response.data.message};
            }

            notification['error']({
                message: 'Deploy failed - ' + error.message,
                description: error.description
            });
            console.error(JSON.stringify(e));

            // }
        })
    }

    const Header = ({data, user}) => {
        console.log("instance row ", user, data)
        return (
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                    <IconText type="number"
                              text={data.id}
                    />
                    <Divider type='vertical'/>
                    <span>Pending participants: </span>
                    <IconText type="team"
                              text={`${data.pendingParticipants}`}
                    />
                    <Divider type='vertical'/>
                    <span>CreatedBy: </span>
                    <IconText type="user"
                              text={`${data.createdBy.address}`}
                    />
                    <div>{data.mandatoryParticipants.filter((p) => p.user !== null).map((p,i) => {
                       // console.log("sss ", user, p.user)
                        return <Tag key={i} color={(user.id === p.user.id) ? 'green' : ''}>{p.participant.name}</Tag>
                    })}</div>
                </div>
                {data.smartContract === null &&
                <Button
                    style={{float: "right"}}
                    disabled={!data.done}
                    type='primary'
                    onClick={handleOnClick}>Deploy
                </Button>
                }
                {data.smartContract !== null &&
                <Button
                    disabled={true}
                    type='primary' style={{
                    float: "right",
                    background: 'lightGreen', width: 150,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}
                    onClick={(e) => e.stopPropagation()}
                >{data.smartContract.address}
                </Button>
                }
                <Button
                    style={{float: "right", marginLeft: 5}}
                    disabled={!data.done}
                    type='danger' ghost
                    onClick={handleOnDelete}>Delete
                </Button>

            </div>
        )
    }


    return (
        <Panel header={<Header data={data} user={user}/>} key={data.id}>
            {console.log(" dd", data)}
            {data.smartContract && data.smartContract.smartContractImpl && data.smartContract.smartContractImpl &&
            <SmartContractImplTable dataSource={data.smartContract.smartContractImpl}/>
            }
            Subscribe yourself as one or more Participants.
            <div style={{marginTop: 10, marginBottom: 10}}>
                <div>Mandatory participants:</div>
                <ParticipantSelect
                    participants={data.mandatoryParticipants.filter((p) => p.user === null)}
                    pendingParticipants={data.pendingParticipants}
                    refreshModel={refreshModel}
                />
            </div>
            {console.log("aaa ", data)}
            {/*{data.smartContract && <SolHigh codeString={data.smartContract.solidity}/>}*/}
            {data.smartContract && <EditorSol code={data.smartContract.solidity} contractId={data.smartContract.id}/>}
        </Panel>
    )
}

function ParticipantSelect({participants, pendingParticipants, refreshModel}) {

    const [value, setValue] = useState([]);
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);

    const handleOnClickSubscribe = () => {
        setLoading(true);
        const body = {instanceParticipantUserId: value};
        axios.post("/api2/instance/selfSubscribe", body)
            .then((r) => {
                refreshModel()
            })
            .catch((e) => {
                setError(e)
            });
        setLoading(false);
        refreshModel();
    }

    const handleOnChange = (value) => {
        setValue(value)
    }

    return (
        <div>
            <Select
                disabled={participants.length === 0}
                defaultValue=""
                style={{width: 120}}
                onChange={handleOnChange}
            >
                {participants.map((p, k) => {
                        return <Option key={k} value={p.id}>{p.participant.name}</Option>
                    }
                )}
            </Select>
            <Button
                loading={loading}
                onClick={handleOnClickSubscribe}
                type={'primary'}
                disabled={pendingParticipants === 0}
            >Subscribe</Button>
            {error && <div>{JSON.stringify(error)}</div>}
        </div>
    )
}

function ParticipantRemoteSelect({id, data}) {
    console.log("p ", id, data)

    const [fetchedData, setFetchedData] = useState([]);
    const [lastFetchId, setLastFetchId] = useState(0);
    const [value, setValue] = useState([data.user && data.user.address]);
    const [fetching, setFetching] = useState(false);
    const [disabled, setDisabled] = useState(!!(data.user && data.user.address));
    const fetchUser = _.debounce(user => sendFetchUser(user), 500);

    const sendFetchUser = value => {
        console.log('fetching user', value);
        setLastFetchId(lastFetchId + 1);
        const fetchId = lastFetchId;
        setFetchedData([]);
        setFetching(true);
        fetch('api2/users')
            .then(response => response.json())
            .then(body => {
                console.log(" body", body);
                if (fetchId !== lastFetchId) {
                    // for fetch callback order
                    return;
                }
                const data = body.elements.map((user,k) => ({
                    text: `${user.address}`,
                    value: user.address,
                }));
                setFetchedData(data);
                setFetching(false);
            });
    };

    const handleChange = value => {
        console.log(" value", value)
        setValue(value);
        setFetchedData([]);
        setFetching(false);
    };

    function handleSubscription(id, address) {
        console.log("aasaa a", id, address)

        const body = {instanceParticipantUserId: id, address: address};
        axios.post(`/api2/instance/subscribe`, body)
            .then(((result) => {
                console.log(" ress", result)
                setDisabled(true)
            }))

        // axios.post('/api2/subscribe').then()
    }

    return (
        <div>
            <Select
                showSearch
                value={value}
                placeholder="Select users"
                notFoundContent={fetching ? <Spin size="small"/> : null}
                filterOption={false}
                onSearch={fetchUser}
                onChange={handleChange}
                style={{width: '200px'}}
                disabled={disabled}
            >
                {fetchedData.map(d => (
                    <Option key={d.value}>{d.text}</Option>
                ))}
            </Select>
            <Button type='primary' onClick={() => handleSubscription(data.id, value)}
                    disabled={disabled}>Subscribe</Button>
        </div>
    )
}


export const IconText = ({type, text}) => (
    <span>
    <Icon type={type} style={{marginRight: 8}}/>
        {text}
  </span>
);


export const SolHigh = ({codeString}) => {
    if (codeString)
        return (
            <SyntaxHighlighter language="javascript" style={docco}>
                {codeString}
            </SyntaxHighlighter>
        );

    return <div>No code</div>
};


function SmartContractImplTable({dataSource}) {
    console.log(" ", dataSource);
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
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            // render: (text,record)=>{
            //     return <Link to={'/dapp/'+record.id}>{text}</Link>
            // }
        }, {
            title: 'Created',
            dataIndex: 'created',
            key: 'created',
        },
        {
            title: 'Action',
            key: 'act',
            render: (text, record) => {
                return <span><a href="#">Delete</a></span>
            }
        },
    ]
    return <div><h3>Implementations</h3>
        <Table dataSource={dataSource} columns={columns} rowKey={record => record.id}/>
    </div>
}
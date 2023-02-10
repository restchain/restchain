import React, {useEffect, useState} from "react";
import {useHistory, useParams} from "react-router-dom";
import {Avatar, Divider, List, Modal, notification, Spin,} from "antd";
import axios from 'axios';
import ModelDetail, {IconText} from "./ModelDetail";
import {CreateInstance} from "./CreateInstance";
import {ModalPreview} from "../Modeler/ActionMenu";
import canvg from 'canvg';

function ModelList({dataSource, refreshModel}) {

    const [showModelDetail, setShowModelDetail] = useState(false);
    const [model, setModel] = useState([]);
    const [item, setItem] = useState([]);
    const [showCreateInstance, setShowCreateInstance] = useState(false);
    const [showXmlPreview, setShowXmlPreview] = useState(false);
    const [xml, setXml] = useState();
    const [loading, setLoading] = useState(false);
    let history = useHistory();
    let {id} = useParams();

    useEffect(
        () => {
            if (id !== undefined) {
                setItem(id);
                setShowModelDetail(true);

                // svgr(id.svg, { prettier: false, componentName: 'MyComponent' }).then(
                //     jsCode => {
                //         console.log(jsCode)
                //     },
                // )

            } else {
                setShowModelDetail(false);
            }
        });

    const handleOnDelete = (id, refreshModel) => {
        setLoading(true)
        axios.delete(`api2/model/${id}`).then((result) => {
            if (result.status === 200) {
                setLoading(false);
                // window.location.reload();
                refreshModel();
            }
        }).catch((e) => {
            let error = {};

            if (e && e.response && e.response.data) {
                error = {message: e.message, description: e.response.data};
            }

            if (e && e.response && e.response.data && e.response.data.message) {
                error = {message: e.message, description: e.response.data.message};
            }

            notification['error']({
                message: 'Delete failed - ' + error.message,
                description: error.description
            });
            console.error(JSON.stringify(e));
        })
    }


    const handleOnPreview = (id) => {
        // console.log(" again",)
        fetch(`/api2/model/xml/${id}`)
            .then(function (response) {
                response.text().then((s) => {
                    setXml(s);
                    setShowXmlPreview(true)
                })
            })
    }


    return (
        <>
            {loading && <Spin/>}
            <List
                itemLayout="vertical"
                // size="normal"
                pagination={{
                    onChange: page => {
                        console.log(page);
                    },
                    pageSize: 5,
                }}
                dataSource={dataSource.elements}
                renderItem={item => (
                    <List.Item
                        style={{marginLeft: 20, marginRight: 20}}
                        key={item.title}
                        actions={[
                            <span onClick={
                                () => {
                                    setModel(item);
                                    setItem(item.id);
                                    setShowCreateInstance(true);
                                }
                            }>
                                <IconText type="plus-circle" text="Add instance" key="list-vertical-tool"/>
                            </span>,


                            <span onClick={() => handleOnDelete(item.id, refreshModel)}> <IconText
                                type="delete" text="Delete" key="list-vertical-delete"/></span>,
                            <span onClick={() => history.push(`/design/${item.id}`)}> <IconText
                                type="copy" text="Clone BPMN" key="list-vertical-copy"/></span>,
                            <span onClick={() => handleOnPreview(item.id)}> <IconText
                                type="eye" text="XML preview" key="list-vertical-xml-preview"/></span>
                        ]}
                        extra={<PreviewCanvas props={item}/>
                        }
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={'https://avatars3.githubusercontent.com/u/6481734?s=200&v=4'}/>}
                            title={<span style={{cursor: 'pointer'}}
                                         onClick={
                                             () => {
                                                 history.push(`/deploy/${item.id}`);
                                             }}
                            >
                                {item.name}
                            </span>}
                            description={item.description}
                        />
                        <span>
                            <div>
                                <IconText type="number"
                                          text={item.id}
                                />
                                <Divider type='vertical'/>
                                <IconText type="user"
                                          text={item.uploadedBy}
                                />
                                <Divider type='vertical'/>
                                <IconText type="clock-circle"
                                          text={item.uploaded}
                                />
                                <Divider type='vertical'/>
                                <IconText type="profile"
                                          text={`Instances ${item.instances && item.instances.length}`}
                                />
                                <Divider type='vertical'/>
                                <IconText type="team"
                                          text={`Participants ${item.participants && item.participants.length}`}
                                />
                            </div>
                    </span>
                    </List.Item>
                )}
            />
            {
                showModelDetail &&
                <ModelDetail
                    id={item}
                    visible={showModelDetail}
                    hide={() => history.push('/deploy')}
                />
            }
            {
                showCreateInstance &&
                <CreateInstance
                    model={model}
                    visible={showCreateInstance}
                    hide={() => setShowCreateInstance(false)}
                    refreshModel={refreshModel}
                />
            }
            {
                showXmlPreview &&
                <ModalPreview
                    showPreview={showXmlPreview}
                    hide={() => setShowXmlPreview(false)}
                    xml={xml}
                />
            }
        </>
    )
}

export default ModelList;


function deleteModel(id) {
    console.log("model ", id);

    return axios.delete(`api2/model/${id}`).then(function (response) {

        return response;

    })
        .catch(function (error) {
            return error;
        });

}

class PreviewCanvas extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            v: null,
            image: null,
            show: false
        };
    }

    async componentDidMount() {
        const canvas = document.getElementById('canvas' + this.props.props.id);
        const ctx = canvas.getContext('2d');
        let v = await canvg.from(ctx, this.props.props.svg);
        this.setState({image: canvas.toDataURL('image/png')});
        this.setState({v: v});
        v.resize(200, 100, 'xMidYMid meet');
        v.start();
    }

    // componentWillUnmount() {
    //     // this.state.v && this.state.v.stop();
    // }

    handleOnHide = () => {
        console.log("yeah ", this.state.show)
        this.setState({show: false})
        console.log("yeah2 ", this.state.show)
    }

    handleShow = () => {
        console.log("bu ",)
        this.setState({show: true})
    }

    onMouseOver = (e) => {
        e.target.style.background = '#E9F4F7';
        e.target.style.border = '1px solid black';
        e.target.style.borderRadius = '15px';

    }

    onMouseLeave = (e) => {
        e.target.style.background = '';
        e.target.style.border = '0px';

    }


    render() {
        // console.log("state ", this.state)
        return (
            <div style={{width: 220, height: 120, padding:20, overflow: "hidden"}}>
                <canvas id={'canvas' + this.props.props.id}
                        onClick={this.handleShow}
                        onMouseOver={this.onMouseOver}
                        onMouseLeave={this.onMouseLeave}/>
                {this.state.show && <ModalPreviewModel
                    visible={this.state.show}
                    onOk={this.handleOnHide}
                    onCancel={this.handleOnHide}
                    image={this.state.image}
                />}
            </div>)
    }
}


function ModalPreviewModel(props) {
    return <Modal
        title="Model preview"
        visible={props.visible}
        onOk={() => props.onOk()}
        onCancel={() => props.onCancel()}
    >
        <img src={props.image}/>
    </Modal>
}


export function NewInstanceForm() {
//     React.useEffect(() => {
//         if (props.value.domain !== undefined) {
//             props.form.validateFields();
//         }
//     }, [props.value.domain]);
//
//     console.log('DomainFormFinder ', props);
//     const { getFieldDecorator, getFieldsError } = props.form;
//     const isEmptyDomain = props.form.getFieldValue('domain') === undefined;
//     const enableSubmit = hasErrors(getFieldsError()) || isEmptyDomain;
// }
//     return (
//         <Form layout="inline" onSubmit={e => handleSubmit(e, props.form, props.onSubmit)}>
//
//         </Form>
//     )
}

// const NewInstance =  Form.create()(NewInstanceForm);
import {Button, Checkbox, Icon, Input, message, Modal, notification, Result, Spin, Upload as Import} from "antd";
import React, {useEffect, useState} from "react";
import {renderModel} from "./actions";
import emptyDiagram from "../../resources/EmptyDiagram.bpmn";
import axios from "axios";
import {Link} from "react-router-dom";
import XMLViewer from "react-xml-viewer"; //TODO capire se jquery è necessario e nel caso rimuoverlo dalle dipendenze se NO

const {confirm} = Modal;

export function ActionMenu({modeler}) {

    const acceptedFile = ".bpmn, .xml"

    const [loading, setLoading] = useState(false);

    const [showInput, setShowInput] = useState(false);
    const [showUploaded, setShowUploaded] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [filename, setFilename] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState({});
    const [overwrite, setOverwrite] = useState(false);


    const {TextArea} = Input;


    const onChangeInput = (e) => {
        setFilename(e.target.value);
    };

    const onChangeTextArea = (e) => {
        setDescription(e.target.value);
    };

    const handleOnChangeOverwrite = (e) => {
        console.log("e.target.checked ", e.target.checked)
        setOverwrite(e.target.checked)
    }

    return (
        <>
            <div style={{margin:10,fontWeight:'bold'}}>Model actions:</div>
            <Button value="new" icon='form' onClick={() => newModel(modeler)}>New</Button>

            <Import
                accept={acceptedFile}
                showUploadList={false}
                beforeUpload={file => {
                    const reader = new FileReader();

                    reader.onload = e => {
                        setLoading(true);
                    };

                    reader.addEventListener('load', function () {
                        setLoading(false);
                        const newXml = reader.result;
                        console.log("Imported new model");
                        notifySuccessfullyImported(file.name);
                        renderModel(modeler, newXml);
                        // exportArtifacts();
                    }, false);

                    reader.readAsText(file);

                    // Prevent upload
                    return false;
                }}
            >
                <Button value="import" icon='import'>Import</Button>

            </Import>

            <Button value="export" disabled={true} icon='export'>Export</Button>
            <Button value="save_svg" disabled={true} icon='file-image'>Save Svg</Button>
            <Button value="showXml" disabled={false} icon='eye' onClick={() => setShowPreview(true)}>XML
                Preview</Button>
            <Button value="save" icon='upload' onClick={() => setShowInput(true)}>Upload</Button>

            {/* Loading Spinner  */}
            {
                loading && <div className="spinner">
                    <Spin tip="Loading..."/>
                </div>
            }

            {/* Notify that the model was uploaded */}
            {
                showUploaded && <Modal
                    title="Model uploaded"
                    visible={showUploaded}
                    onOk={
                        () => {
                            setShowUploaded(false);
                            renderModel(modeler, emptyDiagram);
                        }
                    }
                    onCancel={() => setShowUploaded(false)}
                >
                    <UploadedResult filename={filename}/>
                </Modal>
            }

            {
                showPreview && <ModalPreview hide={() => setShowPreview(false)}
                                             modeler={modeler}
                                             showPreview={showPreview}
                />
            }

            {/* Allows to enter a model name before it is uploaded  */}
            {
                showInput && <Modal
                    title="Insert model name"
                    visible={showInput}
                    onOk={
                        () => {
                            setLoading(true);
                            var fileXml;
                            modeler.saveXML({format: true}, function (err, xml) {
                                fileXml = xml;
                            });

                            var svg;
                            modeler.saveSVG({format: true}, function (err, svgGenerated) {
                                if (err) {
                                    console.error("Something went wrong during the svg generation ", err)
                                }
                                svg = svgGenerated;
                            });
                            const body = JSON.stringify({
                                name: filename,
                                description: description,
                                overwrite: overwrite,
                                data: fileXml,
                                svg: svg
                            });

                            console.log(" body", body);
                            axios.post(`/api2/model`,
                                body,
                                {
                                    headers: {
                                        'Accept': 'application/json', 'Content-Type': 'application/json'
                                    }
                                })
                                .then(res => {
                                    setLoading(false);
                                    if (res.status == 201) {
                                        console.log("File uploaded ", res);
                                        setShowInput(false);
                                        setShowUploaded(true);

                                    } else {
                                        setError(res.data);
                                        //todo notifica errore
                                    }
                                }).catch((e) => {
                                setLoading(false);
                                setError(e);
                            })

                        }
                    }
                    onCancel={() => setShowInput(false)}
                >
                    <p>If you click the OK button the current model will be uploaded to the remote server ready then to
                        be processed.</p>
                    <label><strong>Model name:</strong></label>
                    {/* TODO: modify in a form component*/}
                    <Input
                        placeholder="exampleDiagram"
                        onChange={onChangeInput}
                        addonAfter=".bpmn"
                    />
                    <div><Checkbox onChange={handleOnChangeOverwrite}>Overwrite existing file</Checkbox></div>
                    <label><strong>Description:</strong></label>
                    <TextArea
                        onChange={onChangeTextArea}
                        rows={4}/>
                    {error && <div style={{color: 'red'}}>{error.message}</div>}
                </Modal>
            }
        </>
    )
}

function UploadedResult({filename}) {
    const subTitle = <span>{`Model:`} <strong>{filename}.bpmn</strong></span>;
    return (
        <Result
            status="success"
            title="Model successfully uploaded!"
            subTitle={subTitle}
            extra={[
                <Button type="primary" key="console">
                    Process it
                </Button>,
                <Link to={'/deploy'}><Button type="primary" key="console">
                    Go to deploy page
                </Button>
                </Link>
            ]}
        />)
}

const notifySuccessfullyImported = (filename) => {
    const description = <span>{`Model `} <strong>{filename}</strong>  successfully imported</span>;
    notification['success']({
        message: 'Model imported',
        description: description
    });
};

const newModel = (modeler) => {
    confirm({
        title: 'New model',
        content: 'If you click the OK button the current model will be deleted',
        onOk() {
            console.log("Create new model ");
            renderModel(modeler, emptyDiagram)
        },
        onCancel() {
        },
    });
};

// const saveModel = (modeler) => {
//     var downloadLink = $('#js-download-diagram');
//     confirm({
//         title: 'Save a model',
//         content: 'If you click the OK button the current model will be saved.',
//         onOk() {
//             console.log("Saving XML .. ",)
//             saveDiagram(modeler, function (err, xml) {
//                 setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
//             });
//         },
//         onCancel() {
//         },
//     });
// };


const saveModelSvg = (modeler) => {
    confirm({
        title: 'Save a .svg model',
        content: 'If you click the OK button the current model will be saved ina svg format.',
        onOk() {
            //TODO generate a new bpm model
        },
        onCancel() {
        },
    });
};

const exportModel = (modeler) => {
    confirm({
        title: 'Export a model',
        content: 'If you click the OK button the current model will be saved.',
        onOk() {
            //TODO generate a new bpm model
            // do stuff with the SVG
        },
        onCancel() {
        },
    });
};


//TODO think to substitute with https://www.npmjs.com/package/react-modal-resizable-draggable
export const ModalPreview = ({showPreview, hide, modeler, xml}) => {

    const [content, setContent] = useState('');
    useEffect(() => {
        modeler && modeler.saveXML({format: true}, function (err, xml) {
            if (err) {
                message.error('Some error occured', err);
            } else {
                console.log(" xml", xml)
                setContent(xml);
            }
        });

        xml && setContent(xml)
    }, []);

    const customTheme = {
        "attributeKeyColor": "blue",
        "attributeValueColor": "#000FF"
    };

    function copyText() {
        navigator.clipboard.writeText(content)
        message.success('Xml copied!');
    }

    return (
        <Modal
            width={600}
            bodyStyle={{
                margin: 10,
                padding: 10,
                height: 400,
                overflowY: 'scroll',
                backgroundColor: '#FAFAFA',
                fontFamily: 'monospace,monospace'
            }}
            title={<div>XML Preview <Button style={{float: 'right', marginRight: 20}} onClick={copyText}><Icon
                type="copy"/>Copy</Button></div>}
            visible={showPreview}
            onOk={hide}
            onCancel={hide}
        >
            {content && <XMLViewer xml={content} theme={customTheme}/>}
        </Modal>
    )
}
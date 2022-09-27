package com.unicam.chorchain.translator;

import com.unicam.chorchain.model.SmartContract;
import com.unicam.chorchain.model.User;
import com.unicam.chorchain.smartContract.SmartContractService;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.impl.instance.EndEventImpl;
import org.camunda.bpm.model.bpmn.impl.instance.EventBasedGatewayImpl;
import org.camunda.bpm.model.bpmn.impl.instance.ExclusiveGatewayImpl;
import org.camunda.bpm.model.bpmn.impl.instance.ParallelGatewayImpl;
import org.camunda.bpm.model.bpmn.instance.*;
import org.camunda.bpm.model.xml.impl.instance.ModelElementInstanceImpl;
import org.camunda.bpm.model.xml.instance.DomElement;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;

import java.io.File;
import java.io.IOException;
import java.util.*;



/*  nel Task il messaggio sopra si chiama REQUESTS e quello sotto RESPONSE */

@Slf4j
@Getter
public class ChoreographyBpmn {

    public static String choreographyFile;
    public static int startint;
    private static BpmnModelInstance modelInstance;
    public static ArrayList<String> participantsWithoutDuplicates;
    public static ArrayList<String> partecipants;
    public static ArrayList<String> functions;
    public static Collection<FlowNode> allNodes;
    public static int startCounter;
    public static Integer xorCounter;
    public static Integer parallelCounter;
    public static Integer eventBasedCounter;
    public static Integer endEventCounter;
    public ArrayList<DomElement> participantsTask;
    public ArrayList<DomElement> msgTask;
    public ArrayList<SequenceFlow> taskIncoming, taskOutgoing;
    public static ArrayList<String> nodeSet;                    //contiene gli id dei vari oggetti processati fino a quel moemnto, se è qui è già stato processato
    public static String request;
    public static String response;
    public static ArrayList<String> gatewayGuards;
    public static ArrayList<String> toBlock;
    public static List<String> tasks;
    public static SmartContract finalContract;
    public static List<String> elementsID;                      //contiene gli id dei vari oggetti processati fino a quel moemnto, prende gli id elementi che vengono messo in solidity
    private static String startEventAdd;
    private static List<String> roleFortask;                    //contiene tutti i tipi di ruoli visti
    private static LinkedHashMap<String, String> taskIdAndRole;    //Prende gli ID di tutti gli elementi e associa un ruolo (internal,private,public), se GAtawey sarà internal
    /* qui ci sarà l'id del messaggio (message) e il partecipante che lo deve inviare */

    // static String projectPath = System.getProperty("user.dir")+ "/workspace";

    //    public boolean start(File bpmnFile, Map<String, User> participants, List<String> optionalRoles,
//                         List<String> mandatoryRoles) throws Exception {
    public boolean start(File bpmnFile, Map<String, User> participants, List<String> optionalRoles,
                         List<String> mandatoryRoles) throws Exception {
        try {

            ChoreographyBpmn choreographyBpmn = new ChoreographyBpmn();

            choreographyBpmn.readFile(bpmnFile);
            choreographyBpmn.getParticipants();
            choreographyBpmn.FlowNodeSearch(optionalRoles, mandatoryRoles);

            choreographyFile = choreographyBpmn.initial(bpmnFile.getName(), participants, optionalRoles, mandatoryRoles)
                    + choreographyFile;

            choreographyFile += choreographyBpmn.lastFunctions();
//            finalContract = new SmartContract(null, tasks, null, null, gatewayGuards, taskIdAndRole);

            finalContract = new SmartContract();
//            choreography.save(bpmnFile.getName());

            log.debug("Contract creation done");
            log.debug("Ruolii:" + Arrays.toString(roleFortask.toArray()));

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public void mergeMap(String id, String role) {
        taskIdAndRole.put(id, role);
    }

    public ChoreographyBpmn() {
        roleFortask = new ArrayList<String>();
        elementsID = new ArrayList<String>();
        tasks = new ArrayList<String>();
        gatewayGuards = new ArrayList<String>();
        partecipants = new ArrayList<String>();
        startint = 0;
        startCounter = 0;
        xorCounter = 0;
        eventBasedCounter = 0;
        parallelCounter = 0;
        endEventCounter = 0;
        choreographyFile = "";
        this.participantsTask = new ArrayList<DomElement>();
        this.msgTask = new ArrayList<DomElement>();
        ;
        this.taskIncoming = new ArrayList<SequenceFlow>();
        this.taskOutgoing = new ArrayList<SequenceFlow>();
        nodeSet = new ArrayList<>();
        request = "";
        response = "";
        startEventAdd = "";
        taskIdAndRole = new LinkedHashMap<String, String>();
    }

    public void readFile(File bpFile) throws IOException {
        //System.out.println("You chose to open this file: " + bpFile.getName());
        modelInstance = Bpmn.readModelFromFile(bpFile);
        allNodes = modelInstance.getModelElementsByType(FlowNode.class); //Tutti gli elementi totali - i task
    }

    public void getParticipants() {
        Collection<Participant> parti = modelInstance.getModelElementsByType(Participant.class);
        for (Participant p : parti) {
            partecipants.add(p.getName());
        }
        participantsWithoutDuplicates = new ArrayList<>(new HashSet<>(partecipants));
    }

    private static String initial(String filename, Map<String, User> participants, List<String> optionalRoles,
                                  List<String> mandatoryRoles) {
        String intro = "pragma solidity ^0.5.3; \n" + "	pragma experimental ABIEncoderV2;\n" + "	contract "
                + SmartContractService.parseName(filename, "") + "{\n" + "		uint counter;\r\n"
                + "	event stateChanged(uint);  \n" + "	mapping (string=>uint) position;\n"
                + "\n	enum State {DISABLED, ENABLED, DONE} State s; \n" + "	mapping(string => string) operator; \n"
                + "	struct Element{\n	string ID;\n	State status;\n}\n" + "	struct StateMemory{\n	";
        for (String guard : gatewayGuards) {
            intro += guard + ";\n";
        }
        intro += "}\n" + "	Element[] elements;\n	  StateMemory currentMemory;\n" + "	string[] elementsID = [";
        for (String elID : elementsID) {
            // System.out.println();
            if (elID.equals(elementsID.get(elementsID.size() - 1))) {
                // System.out.println("sono uguale: " + elID + " e: " +
                // elementsID.get(elementsID.size()-1));
                intro += "\"" + elID + "\"];\n";
            } else
                intro += "\"" + elID + "\", ";

        }

        intro += "	string[] roleList = [ ";

        for (int i = 0; i < mandatoryRoles.size(); i++) {
            intro += "\"" + mandatoryRoles.get(i) + "\"";
            if ((i + 1) < mandatoryRoles.size())
                intro += ", ";
        }
        intro += " ]; \n";
        intro += "	string[] optionalList = [";
        if (optionalRoles.isEmpty()) {
            intro += "\"\"";
        } else {
            for (int i = 0; i < optionalRoles.size(); i++) {
                intro += "\"" + optionalRoles.get(i) + "\"";
                if ((i + 1) < optionalRoles.size())
                    intro += ", ";
            }
        }

        intro += " ]; \n" + "	mapping(string=>address) roles; \r\n"
                + "	mapping(string=>address) optionalRoles; \r\n";
        String constr = "constructor() public{\r\n" + "    //struct instantiation\r\n"
                + "    for (uint i = 0; i < elementsID.length; i++) {\r\n"
                + "        elements.push(Element(elementsID[i], State.DISABLED));\r\n"
                + "        position[elementsID[i]]=i;\r\n" + "    }\r\n" + "         \r\n"
                + "         //roles definition\r\n" + "         //mettere address utenti in base ai ruoli\r\n";
        int i = 0;
        for (Map.Entry<String, User> sub : participants.entrySet()) {

            constr += "	roles[\"" + sub.getKey() + "\"] = " + sub.getValue().getAddress() + ";\n";
            i++;
        }
        for (String optional : optionalRoles) {
            constr += "	optionalRoles[\"" + optional + "\"] = 0x0000000000000000000000000000000000000000;";
        }

        /*
         * "         roles[\"Buyer\"] = 0x0000000000000000000000000000000000000000;\r\n"
         * +
         * "         roles[\"Buyer\"] = 0x0000000000000000000000000000000000000000;\r\n"
         * +
         * "         roles[\"Buyer\"] = 0x0000000000000000000000000000000000000000;\r\n"
         * +
         * "         roles[\"Buyer\"] = 0x0000000000000000000000000000000000000000;\r\n"
         * +
         */

        constr += "         \r\n" + "         //enable the start process\r\n" + "         init();\r\n" + "    }\r\n"
                + "    ";

        String other = "modifier checkMand(string storage role) \n"
                + "{ \n\trequire(msg.sender == roles[role]); \n\t_; }" + "modifier checkOpt(string storage role) \n"
                + "{ \n\trequire(msg.sender == optionalRoles[role]); \n\t_; }" + "modifier Owner(string memory task) \n"
                + "{ \n\trequire(elements[position[task]].status==State.ENABLED);\n\t_;\n}\n"
                + "function init() internal{\r\n" + "       bool result=true;\r\n"
                + "       	for(uint i=0; i<roleList.length;i++){\r\n"
                + "       	     if(roles[roleList[i]]==0x0000000000000000000000000000000000000000){\r\n"
                + "                result=false;\r\n" + "                break;\r\n" + "            }\r\n"
                + "       	}\r\n" + "       	if(result){\r\n" + "       	    enable(\"" + startEventAdd + "\");\r\n"
                + "				" + parseSid(startEventAdd) + "();\r\n" + "       	}\r\n" + "   }\r\n"
                + "\nfunction subscribe_as_participant(string memory _role) public {\r\n"
                + "        if(optionalRoles[_role]==0x0000000000000000000000000000000000000000){\r\n"
                + "          optionalRoles[_role]=msg.sender;\r\n" + "        }\r\n" + "    }\n"
                + "function() external payable{\r\n" + "    \r\n" + "}";

        return intro + constr + other;
    }

    private String lastFunctions() {
        String descr = " function enable(string memory _taskID) internal { elements[position[_taskID]].status=State.ENABLED; "
                + "     emit stateChanged(counter++);\r\n" + "}\r\n" + "\r\n"
                + "    function disable(string memory _taskID) internal { elements[position[_taskID]].status=State.DISABLED; }\r\n"
                + "\r\n"
                + "    function done(string memory _taskID) internal { elements[position[_taskID]].status=State.DONE; } \r\n"
                + "   \r\n"
                + "    function getCurrentState()public view  returns(Element[] memory, StateMemory memory){\r\n"
                + "        // emit stateChanged(elements, currentMemory);\r\n"
                + "        return (elements, currentMemory);\r\n" + "    }\r\n" + "    \r\n"
                + "    function compareStrings (string memory a, string memory b) internal pure returns (bool) { \r\n"
                + "        return keccak256(abi.encode(a)) == keccak256(abi.encode(b)); \r\n" + "    }\n}";

        return descr;
    }


    //ToDO remove?? Handled externally
//    private static void save(String fileName) throws IOException, Exception {
//        Path rootLocation = Paths.get(projectPath);
//        try {
//            Files.createDirectories(rootLocation);
//        } catch (IOException e) {
//            throw new StorageException("Could not initialize storage", e);
//        }
//        FileWriter wChor = new FileWriter(new File(projectPath
//                + File.separator + SmartContractHelpersService.parseName(fileName, ".sol")));
//        log.debug("File to save {} ", wChor);
//        BufferedWriter bChor = new BufferedWriter(wChor);
//        bChor.write(choreographyFile);
//        bChor.flush();
//        bChor.close();
//        System.out.println("Contract contract created.");
//    }

    private static String typeParse(String toParse) {
        String n = toParse.replace("string", "").replace("uint", "").replace("bool", "");
        // String[] tokens = n.split(" ");
        return n;
    }

    private static String addMemory(String toParse) {
        // System.out.println(toParse);
        String n = toParse.replace("string ", "string memory ");
        // String[] tokens = n.split(" ");
        return n;
    }

    private static String addToMemory(String msg) {

        String add = "";
        String n = msg.replace("string", "").replace("uint", "").replace("bool", "").replace(" ", "");
        String r = n.replace(")", "");
        String[] t = r.split("\\(");
        String[] m = t[1].split(",");

        for (String value : m) {

            add += "currentMemory." + value + "=" + value + ";\n";
        }

        return add;
    }

    private static String createTransaction(String msg) {
        String ret = "";
        String n = msg.replace("address", "").replace("payable", "");
        String r = n.replace(")", "");
        String[] t = r.split("\\(");
        ret = t[1] + ".transfer(msg.value);";

        return ret;
    }

    private static String addGlobal(String name) {
        String r = name.replace(")", "");
        String[] t = r.split("\\(");
        String[] m = t[1].split(",");
        for (String param : m) {
            gatewayGuards.add(param);
        }

        return "";
    }

    // Function for getting the parameters of a function,
    // without the name of the choreography message
    private static String getPrameters(String messageName) {
        // System.out.println("GETPARAM: " + messageName);
        String[] parsedMsgName = messageName.split("\\(");


        return "(" + parsedMsgName[1];
    }

    // If the guard is a string (ex. var=="value") result is compare
    // string(currentMemory.var, "value")
    // if is var==var result is currentMemory.var, var
    private static String addCompareString(ModelElementInstance outgoing) {
        String guards = outgoing.getAttributeValue("name");
        String[] guardValue = guards.split("==");
        String res = "";

        if (guards.contains("\"")) {

            res = "compareStrings(currentMemory." + guardValue[0] + ", " + guardValue[1] + ")==true";
        } else {
            res = "currentMemory." + outgoing.getAttributeValue("name");
        }

        // System.out.println("RESULTT: " + res);
        return res;
    }


    //Estrae l'id dell'elemento lo scrivo con _
    private static String parseSid(String sid) {
        return sid.replace("-", "_");
    }


    public void FlowNodeSearch(List<String> optionalRoles, List<String> mandatoryRoles) {


        // check for all SequenceFlow elements in the BPMN model (mi metto sui connettori - considero che sono ordinati, ma funziona ugale)
        for (SequenceFlow flow : modelInstance.getModelElementsByType(SequenceFlow.class)) {


            // node to be processed, created by the target reference of the sequence flow
            //Prendo la cosa che punta la freccia tramite targetRef e lo metto in node
            ModelElementInstance node = modelInstance.getModelElementById(flow.getAttributeValue("targetRef"));


            // node containing the sourceId of the flow, useful to get the start element
            ModelElementInstance start = modelInstance.getModelElementById(flow.getAttributeValue("sourceRef"));


            if (start instanceof StartEvent) {

                // checking and processing all the outgoing nodes
                //Prendo le frecce che escono dallo start (SequenceFlow.getOutgoing)
                for (SequenceFlow outgoing : ((StartEvent) start).getOutgoing()) {

                    ModelElementInstance nextNode = modelInstance
                            .getModelElementById(outgoing.getAttributeValue("targetRef"));

                    //Formatto il nome dell'event per standrdizzarlo come vogliamo
                    start.setAttributeValue("name", "startEvent_" + startCounter);
                    startCounter++;

                    nodeSet.add(start.getAttributeValue("id"));

                    //aggiunge in taskIDRole - Prende l'id dello Start e ci mette internal
                    mergeMap(start.getAttributeValue("id"), "internal");

                    //fa stessa cosa di nodeSEt
                    elementsID.add(start.getAttributeValue("id"));
                    roleFortask.add("internal");

                    //Aggiungo il nome dell'elemento che ho appena processato che verrà inserito nel db
                    tasks.add(start.getAttributeValue("name"));

                    //Aggiungo l'id dello start
                    startEventAdd = start.getAttributeValue("id");
                    //

                    // nextNode = checkType(nextNode);

                    // System.out.println("NEXT NODE ID AFTER CHECK TYPE: " +
                    // nextNode.getAttributeValue("id"));
                    // id = getNextId(nextNode);
                    String descr = "function " + parseSid(getNextId(start, false)) + "() private {\n"
                            + "	require(elements[position[\"" + start.getAttributeValue("id")
                            + "\"]].status==State.ENABLED);\n" + "	done(\"" + start.getAttributeValue("id") + "\");\n"
                            + "\tenable(\"" + getNextId(nextNode, false) + "\");  \n\t";
                    if (nextNode instanceof Gateway)
                        descr += parseSid(nextNode.getAttributeValue("id")) + " (); \n}\n\n";
                    else
                        descr += "\n}\n\n";
                    choreographyFile += descr;
                }
            }
            if (node instanceof ExclusiveGateway && !nodeSet.contains(getNextId(node, false))) {
                if (node.getAttributeValue("name") == null) {
                    node.setAttributeValue("name", "exclusiveGateway_" + xorCounter);
                    xorCounter++;
                }

                nodeSet.add(getNextId(node, false));
                elementsID.add(getNextId(node, false));
                roleFortask.add("internal");
                mergeMap(getNextId(node, false), "internal");
                tasks.add(node.getAttributeValue("name"));
                String descr = "function " + parseSid(getNextId(node, false)) + "() private {\n"
                        + "	require(elements[position[\"" + node.getAttributeValue("id")
                        + "\"]].status==State.ENABLED);\n" + "	done(\"" + node.getAttributeValue("id") + "\");\n";
                for (SequenceFlow outgoing : ((ExclusiveGateway) node).getOutgoing()) {
                    ModelElementInstance nextElement = modelInstance
                            .getModelElementById(outgoing.getAttributeValue("targetRef"));
                    // checking if there are conditions on the next element, conditions are setted
                    // in the name of the sequence flow
                    if (outgoing.getAttributeValue("name") != null) {

                        descr += "if(" + addCompareString(outgoing) + "){" + "enable(\"" + getNextId(nextElement, false)
                                + "\"); \n ";
                        if (nextElement instanceof Gateway || nextElement instanceof EndEvent) {
                            descr += parseSid(getNextId(nextElement, false)) + "(); \n";
                        }
                        descr += "}\n";
                    } else {
                        descr += "\tenable(\"" + getNextId(nextElement, false) + "\");  \n";
                        if (nextElement instanceof Gateway || nextElement instanceof EndEvent) {
                            descr += parseSid(getNextId(nextElement, false)) + "(); \n";
                        }
                    }

                }
                descr += "}\n\n";
                choreographyFile += descr;
            } else if (node instanceof EventBasedGateway && !nodeSet.contains(getNextId(node, false))) {

                if (node.getAttributeValue("name") == null) {
                    node.setAttributeValue("name", "eventBasedGateway_" + eventBasedCounter);
                    eventBasedCounter++;
                }
                nodeSet.add(getNextId(node, false));
                elementsID.add(getNextId(node, false));
                roleFortask.add("internal");
                mergeMap(getNextId(node, false), "internal");
                tasks.add(node.getAttributeValue("name"));
                String descr = "function " + parseSid(getNextId(node, false)) + "() private {\n"
                        + "	require(elements[position[\"" + node.getAttributeValue("id")
                        + "\"]].status==State.ENABLED);\n" + "	done(\"" + node.getAttributeValue("id") + "\");\n";
                for (SequenceFlow outgoing : ((EventBasedGateway) node).getOutgoing()) {
                    ModelElementInstance nextElement = modelInstance
                            .getModelElementById(outgoing.getAttributeValue("targetRef"));
                    descr += "\tenable(\"" + getNextId(nextElement, false) + "\"); \n";
                }
                descr += "}\n\n";
                choreographyFile += descr;
            } else if (node instanceof ParallelGateway && !nodeSet.contains(getNextId(node, false))) {

                if (node.getAttributeValue("name") == null) {
                    node.setAttributeValue("name", "parallelGateway_" + parallelCounter);
                    parallelCounter++;
                }
                nodeSet.add(getNextId(node, false));
                elementsID.add(getNextId(node, false));
                roleFortask.add("internal");
                mergeMap(getNextId(node, false), "internal");
                tasks.add(node.getAttributeValue("name"));
                String descr = "function " + parseSid(getNextId(node, false)) + "() private { \n"
                        + "	require(elements[position[\"" + node.getAttributeValue("id")
                        + "\"]].status==State.ENABLED);\n" + "	done(\"" + node.getAttributeValue("id") + "\");\n";
                // if the size of incoming nodes is 1 -> flows split
                if (((ParallelGateway) node).getIncoming().size() == 1) {
                    for (SequenceFlow outgoing : ((ParallelGateway) node).getOutgoing()) {
                        ModelElementInstance nextElement = modelInstance
                                .getModelElementById(outgoing.getAttributeValue("targetRef"));
                        descr += "\tenable(\"" + getNextId(nextElement, false) + "\"); \n";
                    }
                    descr += "}\n\n";
                    choreographyFile += descr;
                    // if the size of the outgoing nodes is 1 -> flows converging
                } else if (((ParallelGateway) node).getOutgoing().size() == 1) {
                    descr += "\tif( ";
                    int lastCounter = 0;
                    for (SequenceFlow incoming : ((ParallelGateway) node).getIncoming()) {
                        lastCounter++;
                        ModelElementInstance prevElement = modelInstance
                                .getModelElementById(incoming.getAttributeValue("sourceRef"));
                        descr += "elements[position[\"" + getNextId(prevElement, false) + "\"]].status==State.DONE ";

                        if (lastCounter == ((ParallelGateway) node).getIncoming().size()) {
                            descr += "";
                        } else {
                            descr += "&& ";
                        }

                    }
                    descr += ") { \n";
                    for (SequenceFlow outgoing : ((ParallelGateway) node).getOutgoing()) {
                        ModelElementInstance nextElement = modelInstance
                                .getModelElementById(outgoing.getAttributeValue("targetRef"));
                        descr += "\tenable(\"" + getNextId(nextElement, false) + "\"); \n";
                        if (nextElement instanceof Gateway || nextElement instanceof EndEvent) {
                            descr += parseSid(getNextId(nextElement, false)) + "(); \n";
                        }
                        descr += "}} \n\n";
                        choreographyFile += descr;
                    }
                }
            } else if (node instanceof EndEvent && !nodeSet.contains(getNextId(node, false))) {
                if (node.getAttributeValue("name") == null) {
                    node.setAttributeValue("name", "endEvent_" + endEventCounter);
                    endEventCounter++;
                }
                nodeSet.add(getNextId(node, false));
                elementsID.add(getNextId(node, false));
                roleFortask.add("internal");
                mergeMap(getNextId(node, false), "internal");
                tasks.add(node.getAttributeValue("name"));
                String descr = "function " + parseSid(getNextId(node, false)) + "() private {\n"
                        + "	require(elements[position[\"" + node.getAttributeValue("id")
                        + "\"]].status==State.ENABLED);\n" + "	done(\"" + node.getAttributeValue("id") + "\");  }\n\n";
                choreographyFile += descr;


                // IF per beccara il task, se non è niente ma è solo un ModelElementInstanceImpl è un task
            } else if (node instanceof ModelElementInstanceImpl && !(node instanceof EndEvent)
                    && !(node instanceof ParallelGateway) && !(node instanceof ExclusiveGateway)
                    && !(node instanceof EventBasedGateway) && (checkTaskPresence(getNextId(node, false)) == false)) {

                boolean taskNull = false;
                nodeSet.add(getNextId(node, false));

                request = "";
                response = "";

                String descr = "";
                Participant participant = null;
                String participantName = "";
                ChoreographyTask task = new ChoreographyTask((ModelElementInstanceImpl) node);
                getRequestAndResponse(task);

                participant = modelInstance.getModelElementById(task.getInitialParticipant().getId());

                participantName = participant.getAttributeValue("name");

                String[] req = response.split(" ");
                // String res = typeParse(requestMessage);
                String ret = "";
                String call = "";
                String eventBlock = "";


                //vedo se cè  un event perchè poi se vado sul ramo devo disabilitare l'altro
                if (start instanceof EventBasedGateway) {
                    for (SequenceFlow block : ((EventBasedGateway) start).getOutgoing()) {
                        ModelElementInstance nextElement = modelInstance
                                .getModelElementById(block.getAttributeValue("targetRef"));
                        if (!(getNextId(nextElement, false).equals(getNextId(node, false)))) {
                            eventBlock += "disable(\"" + getNextId(nextElement, false) + "\");\n";
                        }
                    }
                }
                // if there isn't a responseMessage the function created is void
                //se OneWay cè solo un messaggio
                if (task.getType() == ChoreographyTask.TaskType.ONEWAY) {
                    //System.out.println("Task � 1 way");
                    taskNull = false;
                    String pName = getRole(participantName, optionalRoles, mandatoryRoles);


                    /*
                        se cè una funzione payment nel modello vuol  dire che vuoi inviare eth ad un altro account che
                        inserisci in input e la funzione deve essere formatta in modo standard

                        payment(addres to)
                     */

                    if (request.contains("payment")) {
                        //System.out.println("nome richiesta: " + requestMessage);
                        descr += "function " + parseSid(getNextId(node, false)) + addMemory(getPrameters(request))
                                + " public payable " + pName + ") {\n";
                        descr += "	require(elements[position[\"" + getNextId(node, false)
                                + "\"]].status==State.ENABLED);  \n" + "	done(\"" + getNextId(node, false) + "\");\n"
                                + createTransaction(request) + "\n" + eventBlock;
                    } else {

                        descr += "function " + parseSid(getNextId(node, false)) + addMemory(getPrameters(request))
                                + " public " + pName + ") {\n";
                        descr += "	require(elements[position[\"" + getNextId(node, false)
                                + "\"]].status==State.ENABLED);  \n" + "	done(\"" + getNextId(node, false) + "\");\n"
                                + addToMemory(request) + eventBlock;

                        addGlobal(request);
                    }
                    // roleFortask.add(participantName);

                } else if (task.getType() == ChoreographyTask.TaskType.TWOWAY) {
                    taskNull = false;
                    //System.out.println("Task � 2 way");

                    String pName = getRole(participantName, optionalRoles, mandatoryRoles);

                    if (!request.isEmpty()) {
                        //System.out.println("RICHIESTA NON VUOTA");
                        if (request.contains("payment")) {
                            //System.out.println(requestMessage);
                            //System.out.println("RICHIESTA CONTIENE PAGAMENTO");
                            taskNull = false;
                            descr += "function " + parseSid(getNextId(node, false)) + addMemory(getPrameters(request))
                                    + " public payable " + pName + ") {\n";
                            descr += "	require(elements[position[\"" + getNextId(node, false)
                                    + "\"]].status==State.ENABLED);  \n" + "	done(\"" + getNextId(node,
                                    false) + "\");\n"
                                    + createTransaction(request) + "\n" + eventBlock + "}\n";
                        } else {
                            taskNull = false;

                            descr += "function " + parseSid(getNextId(node, false)) + addMemory(getPrameters(request))
                                    + " public " + pName + "){\n";
                            descr += "	require(elements[position[\"" + getNextId(node, false)
                                    + "\"]].status==State.ENABLED);  \n" + "	done(\"" + getNextId(node, false)
                                    + "\");\n" + "	enable(\"" + getNextId(node, true) + "\");\n" + addToMemory(
                                    request)
                                    + eventBlock + "}\n";
                            addGlobal(request);
                        }
                    } else {
                        taskNull = true;
                    }

                    if (!response.isEmpty()) {
                        //System.out.println("RISPOSTA NON VUOTA");
                        if (response.contains("payment")) {
                            //System.out.println(responseMessage);
                            //System.out.println("RISPOSTA CONTIENE PAGAMENTO");
                            taskNull = false;
                            descr += "function " + parseSid(getNextId(node, true)) + addMemory(getPrameters(response))
                                    + " public payable " + pName + ") {\n";
                            descr += "	require(elements[position[\"" + getNextId(node, true)
                                    + "\"]].status==State.ENABLED);  \n" + "	done(\"" + getNextId(node,
                                    true) + "\");\n"
                                    + createTransaction(response) + "\n" + eventBlock;
                        } else {
                            taskNull = false;
                            pName = getRole(task.getParticipantRef().getName(), optionalRoles, mandatoryRoles);
                            descr += "function " + parseSid(getNextId(node, true)) + addMemory(getPrameters(response))
                                    + " public " + pName + "){\n" + "	require(elements[position[\""
                                    + getNextId(node, true) + "\"]].status==State.ENABLED);\n" + "	done(\""
                                    + getNextId(node, true) + "\");\n" + addToMemory(response) + eventBlock;
                            addGlobal(response);
                        }
                    } else {
                        taskNull = true;
                    }

                }
                choreographyFile += descr;
                descr = "";


                // checking the outgoing elements from the task
                //System.out.println("TASK NULL � : " + taskNull);


                //Attiva l'elemento successivo
                if (taskNull == false) {

                    for (SequenceFlow out : task.getOutgoing()) {
                        ModelElementInstance nextElement = modelInstance
                                .getModelElementById(out.getAttributeValue("targetRef"));
                        descr += "\tenable(\"" + getNextId(nextElement, false) + "\");\n";
                        if (nextElement instanceof Gateway || nextElement instanceof EndEvent) {
                            // nextChoreographyTaskElement = checkType(nextChoreographyTaskElement);
                            // creates the call to the next function
                            descr += parseSid(getNextId(nextElement, false)) + "(); \n";

                        }
                        descr += ret;
                        descr += "}\n\n";
                        choreographyFile += descr;

                    }
                }

            }

        }
    }

    public String getRole(String part, List<String> optionalRoles, List<String> mandatoryRoles) {
        String res = "";
        for (int i = 0; i < mandatoryRoles.size(); i++) {

            if ((mandatoryRoles.get(i)).equals(part)) {
                res = "checkMand(roleList[" + i + "]";
                return res;
            }
        }
        for (int o = 0; o < optionalRoles.size(); o++) {
            if ((optionalRoles.get(o)).equals(part)) {
                res = "checkOpt(optionalList[" + o + "]";
                return res;
            }
        }

        return res;
    }


    //Prende REQ and RESP del task in pratica i due messaggi
    public void getRequestAndResponse(ChoreographyTask task) {
        // if there is only the responseMessage
        Participant participant = modelInstance.getModelElementById(task.getInitialParticipant().getId());
        String participantName = participant.getAttributeValue("name");

        //No Request e SI Response 1way
        if (task.getRequestMessage() == null && task.getResponseMessage() != null) {
            // System.out.println("task.getRequestMessage() = null: " + task.getRequestMessage());
            MessageFlow responseMessageFlowRef = task.getResponseMessage();
            MessageFlow responseMessageFlow = modelInstance.getModelElementById(responseMessageFlowRef.getId());
            Message responseMessage = modelInstance
                    .getModelElementById(responseMessageFlow.getAttributeValue("messageRef"));

            if (!responseMessage.getAttributeValue("name").isEmpty()) {
                elementsID.add(responseMessage.getId());
                response = responseMessage.getAttributeValue("name");
                tasks.add(response);
                roleFortask.add(task.getParticipantRef().getName());
                mergeMap(responseMessage.getId(), task.getParticipantRef().getName());
            }

        }
        // if there is only the requestMessage
        //SOLO Request 1Way
        else if (task.getRequestMessage() != null && task.getResponseMessage() == null) {
            MessageFlow requestMessageFlowRef = task.getRequestMessage();
            MessageFlow requestMessageFlow = modelInstance.getModelElementById(requestMessageFlowRef.getId());
            Message requestMessage = modelInstance
                    .getModelElementById(requestMessageFlow.getAttributeValue("messageRef"));
            if (!requestMessage.getAttributeValue("name").isEmpty()) {
                elementsID.add(requestMessage.getId());
                request = requestMessage.getAttributeValue("name");
                tasks.add(request);
                roleFortask.add(participantName);
                mergeMap(requestMessage.getId(), participantName);
            }

        }
        // if there are both
        //2way  1req 1res
        else {
            MessageFlow requestMessageFlowRef = task.getRequestMessage();
            MessageFlow responseMessageFlowRef = task.getResponseMessage();
            MessageFlow requestMessageFlow = modelInstance.getModelElementById(requestMessageFlowRef.getId());
            MessageFlow responseMessageFlow = modelInstance.getModelElementById(responseMessageFlowRef.getId());
            Message requestMessage = modelInstance
                    .getModelElementById(requestMessageFlow.getAttributeValue("messageRef"));
            Message responseMessage = modelInstance
                    .getModelElementById(responseMessageFlow.getAttributeValue("messageRef"));
            if (requestMessage.getAttributeValue("name") != null) {
                elementsID.add(requestMessage.getId());
                request = requestMessage.getAttributeValue("name");
                tasks.add(request);
                roleFortask.add(participantName);
                mergeMap(requestMessage.getId(), participantName);
            }
            if (responseMessage.getAttributeValue("name") != null) {

                elementsID.add(responseMessage.getId());
                response = responseMessage.getAttributeValue("name");
                tasks.add(response);
                roleFortask.add(task.getParticipantRef().getName());
                mergeMap(responseMessage.getId(), task.getParticipantRef().getName());
            }

        }

    }

    // Controller for the node type, if gateway it sets the next function name and
    // the counter
    private static ModelElementInstance checkType(ModelElementInstance nextNode) {
        if (nextNode instanceof ExclusiveGatewayImpl && !nodeSet.contains(getNextId(nextNode, false))) {
            nextNode.setAttributeValue("name", "exclusiveGateway_" + xorCounter);
            xorCounter++;
        } else if (nextNode instanceof EventBasedGatewayImpl && !nodeSet.contains(getNextId(nextNode, false))) {
            nextNode.setAttributeValue("name", "eventBasedGateway_" + eventBasedCounter);
            eventBasedCounter++;
        } else if (nextNode instanceof ParallelGatewayImpl && !nodeSet.contains(getNextId(nextNode, false))) {
            nextNode.setAttributeValue("name", "parallelGateway_" + parallelCounter);
            parallelCounter++;
        } else if (nextNode instanceof EndEventImpl && !nodeSet.contains(getNextId(nextNode, false))) {
            nextNode.setAttributeValue("name", "endEvent_" + endEventCounter);
            endEventCounter++;
        }
        return nextNode;
    }

    // return the next node id, useful to retrieve the first message id in case of
    // Choreography task


    //Passi un elemento e prende l'id di quello succesivo, se è task lo prende della req o della resp (a seconda del boolean)
    // se non è task prende l'id di quello successivo
    private static String getNextId(ModelElementInstance nextNode, boolean msg) {
        String id = "";
        // System.out.println(nextNode.getClass());

        //Se è task
        if (nextNode instanceof ModelElementInstanceImpl && !(nextNode instanceof EndEvent)
                && !(nextNode instanceof ParallelGateway) && !(nextNode instanceof ExclusiveGateway)
                && !(nextNode instanceof EventBasedGateway) && !(nextNode instanceof StartEvent)) {
            ChoreographyTask task = new ChoreographyTask((ModelElementInstanceImpl) nextNode);

            //Se msg è T o F e c'è richiesta
            if (task.getRequestMessage() != null && msg == false) {
                //System.out.println("SONO DENTRO GETrEQUEST != NULL");
                MessageFlow requestMessageFlowRef = task.getRequestMessage();
                MessageFlow requestMessageFlow = modelInstance.getModelElementById(requestMessageFlowRef.getId());
                // //System.out.println("MESSAGAE FLOW REF ID:" + requestMessageFlowRef.getId());
                Message requestMessage = modelInstance
                        .getModelElementById(requestMessageFlow.getAttributeValue("messageRef"));
                if (requestMessage.getName() != null) {
                    //System.out.println("SONO DENTRO REQUEST.GETNAME != NULL");
                    id = requestMessage.getAttributeValue("id");
                } else {
                    //System.out.println("SONO DENTRO LA RISPOSTA PERCH� REQUEST.GETNAME � NULL");
                    MessageFlow responseMessageFlowRef = task.getResponseMessage();
                    MessageFlow responseMessageFlow = modelInstance.getModelElementById(responseMessageFlowRef.getId());
                    Message responseMessage = modelInstance
                            .getModelElementById(responseMessageFlow.getAttributeValue("messageRef"));
                    // if(!responseMessage.getAttributeValue("name").isEmpty()) {
                    id = responseMessage.getAttributeValue("id");
                    // }

                }

                // System.out.println("ID MESSAGE REF: " + id + "uguale a?" +
                // requestMessageFlow.getAttributeValue("messageRef"));
                // System.out.println(requestMessage.getName());

            } else if (task.getRequestMessage() == null && msg == false || task.getResponseMessage() != null && msg == true) {
                //System.out.println("SONO DENTRO GETREQUEST == NULL");
                MessageFlow responseMessageFlowRef = task.getResponseMessage();
                MessageFlow responseMessageFlow = modelInstance.getModelElementById(responseMessageFlowRef.getId());
                Message responseMessage = modelInstance
                        .getModelElementById(responseMessageFlow.getAttributeValue("messageRef"));
                if (responseMessage.getName() != null) {
                    id = responseMessage.getAttributeValue("id");
                }

            }//
            /*
             * else if(task.getResponseMessage()!= null && msg == true) { MessageFlow
             * responseMessageFlowRef = task.getResponseMessage(); id =
             * responseMessageFlowRef.getId(); }
             */

            // Se non sono un task prendo l'id attuale

        } else {
            id = nextNode.getAttributeValue("id");
        }
        //System.out.println("GET ID RETURNS: " + id);
        return id;
    }

    //
    private boolean checkTaskPresence(String sid) {
        // System.out.println(sid);
        boolean isPresent = false;
        for (String id : elementsID) {
            if (sid.equals(id)) {
                isPresent = true;
                return isPresent;
            }
        }
        return isPresent;
    }

}
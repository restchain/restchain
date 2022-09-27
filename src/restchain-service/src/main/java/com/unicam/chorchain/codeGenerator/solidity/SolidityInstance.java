package com.unicam.chorchain.codeGenerator.solidity;

import com.unicam.chorchain.codeGenerator.solidity.element.*;
import com.unicam.chorchain.model.Instance;
import com.unicam.chorchain.model.Participant;
import lombok.Getter;
import lombok.Setter;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;

import java.util.*;
import java.util.stream.Collectors;


/**
 * Contains all the information related to the solidity file.
 * It is working as bridge between the SpringBoot Model by the Instance and the Solidity file to be built.
 * Collects all the needed information and then provides the solidity building by the built method.
 **/
public class SolidityInstance {
    @Getter
    private List<String> mandatoryParticipants;//List of mandatory Participants
    @Getter
    private List<String> optionalParticipants;//List of optional Participants
    @Getter
    private Set<String> structVariables;//List of solidity variables;
    @Getter
    private Set<String> elementsId; //List of used bpmn components that compose functions
    @Getter
    private StringBuilder text;//Growing text of solidity code
    private StringBuilder bpmnFunctions;//Growing text of BPMN functions composing solidity code
    @Getter
    @Setter
    private String startPointId; //If of the starting Point
    private Instance instance;
    @Getter
    private Map<String,Set<String>> interfaces;

    public void addTxt(String text) {
        this.bpmnFunctions.append(text);
    }

    public SolidityInstance(Instance instance) {
        this.instance = instance;
        this.text = new StringBuilder();
        this.elementsId = new HashSet<>();
        this.structVariables = new HashSet<>();
        this.bpmnFunctions = new StringBuilder();
        this.interfaces = new HashMap<>();
        this.mandatoryParticipants = instance.getMandatoryParticipants()
                .stream()
                .filter(p -> p.getUser() != null)
                .map(p -> p.getParticipant().getName())
                .collect(Collectors.toList());

        this.optionalParticipants = instance.getChoreography().getParticipants().stream().filter((p) ->
                !mandatoryParticipants.contains(p.getName())).map(Participant::getName).collect(Collectors.toList());
    }


    /***
     * Provides the solidity generation.
     * @param choreography - Corresponds to the choreography element (bpmn:Choreography) and it is use for retrieves all
     *                     the custom information addressed by this element from the BPMN model such as Types and Constructor
     * @return
     */
    public String build(ModelElementInstance choreography,String pragmaSolidityVersion) {


//        AdditionalType additionalType = new AdditionalType(choreography);
        AdditionalFunction additionalFunction = new AdditionalFunction(choreography);


        //*** starts here ***/
        Struct structGlobal = Struct.builder()
                .variableMap(Types.string, "ID")
                .variableMap("State", "status")
                .name("Element")
                .build();

        Struct structElement = Struct.builder()
                .variables(structVariables)
                .name("StateMemory")
                .build();


        List<String> structs = new ArrayList<>();
        structs.add(structGlobal.toString());
        structs.add(structElement.toString());
//        structs.addAll(additionalType.getStructs());

        List<String> maps = new ArrayList<>();
        maps.add("mapping(string => uint) position;");
        maps.add("mapping(string => string) operator;");
        maps.add("mapping(string => address) roles;");
        maps.add("mapping(string => address) optionalRoles;");

        Event event1 = Event.builder()
                .name("FailedOffer")
                .parameter("uint", "time")
                .parameter("address", "sender")
                .parameter("uint", "amount")
                .parameter("bytes32", "lot")
                .parameter("string", "reason")
                .build();

        List<String> modifiers = new ArrayList<>();
        modifiers.add(
                "modifier checkMand(string storage role){\n\t\trequire(msg.sender == roles[role]);\n\t\t_;\n\t}\n");
        modifiers.add(
                "modifier checkOpt(string storage role){\n\t\trequire(msg.sender == optionalRoles[role]);\n\t\t_;\n\t}\n");
        modifiers.add(
                "modifier Owner(string memory task){\n\t\trequire(elements[position[task]].status == State.ENABLED);\n\t\t_;\n\t}\n");


        Constructor constructor = Constructor.builder()
                .params(additionalFunction.getParameters())
                .bodyElement(printConstructorBody(additionalFunction))
                .build();

        Set<String> variables = new HashSet<>();
        variables.add("Element[] elements;");
        variables.add("StateMemory currentMemory;");
        variables.add("uint counter;");
//        variables.addAll(additionalType.getGlobals());
        variables.add(printRoleList());
        variables.add(printElementsIdList());
        variables.addAll(interfaces.keySet().stream().map(s -> s+"Impl "+s.toLowerCase()+"= new "+s+"Impl();\n\n").collect(Collectors.toSet()));

        Contract sol = Contract.builder()
                .pragmaVersion(pragmaSolidityVersion)
                .fileName(instance.getChoreography().getName())
                .enumElement("enum State {DISABLED, ENABLED, DONE} State s;\n")
                .mappings(maps)
//                .mappings(additionalType.getMappings())
                .variable("address payable public owner;\n\n")
                .modifiers(modifiers)
                .event("event stateChanged(uint);\n")
                .event("event functionDone(string);\n")
                // event invokeREST(nextElementId,callback,RestAPI,param1)
                .event("event callRESTMethod(address id,string callbackFn ,string restApiUri,string fnType);\n")
                .event("event calledREST();\n")
                .structs(structs)
                .variables(variables)
                .constructor(constructor.toString())
                .function(this.bpmnFunctions.toString())
//                .custom(String.join("\n", additionalFunction.getFunctions()))
                .custom(printOtherFunctions())
                .custom(printFunctionInit(this.getStartPointId()))
                .build();


        //creates the interfaces declaration
        StringBuffer interfacesSol = new StringBuffer();
        for (String name : interfaces.keySet()){
            interfacesSol.append(Interface.builder().name(name).functions(interfaces.get(name)).build().toString());
        }

        //Creates the Implementations declaration deriving from the Interface just above (interfaceSol)
        StringBuffer stubImplSol = new StringBuffer();
        for (String name : interfaces.keySet()){
            interfacesSol.append(Stub.builder().name(name+"Impl").interfaceName(name).functions(interfaces.get(name)).build().toString());
        }



        String finalSol = sol.toString()+interfacesSol.toString()+stubImplSol.toString();



        return text.append(finalSol).toString();
    }

    /***
     * Print the function Init included as internal function on the Solidity constructor.
     * From the solidity point of view this function tell which is the starting point of the sequence flow of the
     * functions following the BPMN model.
     * @param startPointId - Bpmn Nname of the start point element that will be pointed and calls by the _init() function
     * @return String representing generated code
     */
    private String printFunctionInit(String startPointId) {
        StringBuilder sb = new StringBuilder();


        sb.append("function _init() internal {\n");
        sb.append("\t\tbool result = true;\n");
        sb.append("\t\tfor (uint i = 0; i < roleList.length; i++) {\n");
        sb.append("\t\t\tif (roles[roleList[i]] == 0x0000000000000000000000000000000000000000) {\n");
        sb.append("\t\t\t\tresult = false;\n");
        sb.append("\t\t\t\tbreak;\n");
        sb.append("\t\t\t}\n");
        sb.append("\t\t}\n");
        sb.append("\t\tif (result) {\n");
        sb.append("\t\t//Questo è lo start\n");
        sb.append("\t\t\t\tenable(\"").append(startPointId).append("\");\n");
        sb.append("\t\t\t\t").append(startPointId.replace("-", "_")).append("();\n");
        sb.append("\t\t\t\temit functionDone(\"Contract creation\"); \n");
        sb.append("\t\t}\n\t}\n");
        return sb.toString();
    }


    private String printConstructorBody(AdditionalFunction additionalFunction) {
        StringBuilder sb = new StringBuilder();
        sb.append("\tfor (uint i = 0; i < elementsID.length; i ++) {\n");
        sb.append("\t\t\telements.push(Element(elementsID[i], State.DISABLED));\n");
        sb.append("\t\t\tposition[elementsID[i]]=i;\n\t\t}\n");
        sb.append("\t\t//roles definition\n\t\t//mettere address utenti in base ai ruoli\n");
        this.instance.getMandatoryParticipants().forEach((p) ->
                sb.append("\t\troles[\"")
                        .append(p.getParticipant().getName())
                        .append("\"] = ")
                        .append(p.getUser().getAddress())
                        .append(";\n"));

        this.optionalParticipants.forEach((a) ->
                sb.append("\t\toptionalRoles[\"")
                        .append(a)
                        .append("\"] = ")
                        .append("0x0000000000000000000000000000000000000000")
                        .append(";\n"));
        if (additionalFunction.getFunctionCalls().size() > 0) {
            sb.append("\t\t//Additional functions\n");
            sb.append("\t\t");
            sb.append(String.join("\n", String.join(";\n", additionalFunction.getFunctionCalls())).concat(";\n"));
        }
        sb.append("\t\t//enable the start process\n\t\t_init()");
        return sb.toString();
    }

    // returns a string of the array declarations about participant roles (mandatory or optional)
    private String printRoleList() {
        StringBuffer sb = new StringBuffer();

        if (this.mandatoryParticipants.size() > 0) {
            sb.append("string [] ").append(Types.Global_RoleList).append(" = ");
            sb.append("[");
            sb.append(this.mandatoryParticipants.stream().map(e -> "\"" + e + "\"").collect(Collectors.joining(",")));
            sb.append("];");
            sb.append("\n");
        }

        if (this.optionalParticipants.size() > 0) {
            sb.append("\t");
            sb.append("string [] ").append(Types.Global_OptionalList).append(" = ");
            sb.append("[");
            sb.append(this.optionalParticipants.stream().map(e -> "\"" + e + "\"").collect(Collectors.joining(",")));
            sb.append("];");
            sb.append("\n");
        }

        return sb.toString();
    }

    private String printOtherFunctions() {
        StringBuilder sb = new StringBuilder();

        sb.append("\tfunction subscribe_as_participant(string memory _role) public {\n");
        sb.append("\t\tif (optionalRoles[_role] == 0x0000000000000000000000000000000000000000) {\n");
        sb.append("\t\t\toptionalRoles[_role] = msg.sender;\n\t\t}\n\t}\n\n");
        sb.append("\tfunction() external payable {}\n\n");
        sb.append(
                "\tfunction enable(string memory _taskID) internal {elements[position[_taskID]].status = State.ENABLED;\n");
        sb.append("\t\temit stateChanged(counter++);\n\t}\n");
        sb.append(
                "\tfunction disable(string memory _taskID) internal {elements[position[_taskID]].status = State.DISABLED;}\n\n");
        sb.append(
                "\tfunction done(string memory _taskID) internal {elements[position[_taskID]].status = State.DONE;\n\t\temit functionDone(_taskID);\n\t}\n");
        sb.append("\tfunction getCurrentState() public view returns (Element[] memory, StateMemory memory){\n");
        sb.append("\t\t// emit stateChanged(elements, currentMemory);\n");
        sb.append("\t\treturn (elements, currentMemory);\n\t}\n\n");
        sb.append("\tfunction compareStrings(string memory a, string memory b) internal pure returns (bool) {\n");
        sb.append("\t\treturn keccak256(abi.encode(a)) == keccak256(abi.encode(b));\n\t}\n");
////        sb.append("\tfunction _RESTCallback(string memory id, string memory returnValue) public {\n");
//        sb.append("\t\t(currentMemory.resultString) = returnValue; \n");
//        sb.append("\t\tenable(\"EndEvent_1qz0n9q\"); EndEvent_1qz0n9q();}\n\n");

        return sb.toString();
    }

    /***
     * Provides the elementsID list included on the solidity file.
     * From the solidity point of view the ElementsID contains all the Ids (BPMN ids) of the BPMN elements involved on
     * the sequence flow and that need to be calls.
     * @return String representing generated code
     */
    private String printElementsIdList() {
        StringBuilder sb = new StringBuilder();
        sb.append("string [] elementsID = [\n\t");
        sb.append(this.elementsId.stream().map(e -> "\t\"" + e + "\"").collect(Collectors.joining(",")));
        sb.append("\n\t];\n");
        return sb.toString();
    }

    public void addElementId(String id) {
        this.elementsId.add(id);
    }

    /***
     * Provides to create the interface  methods
     * @param signatureMethod
     */
    public void elabInterface(SignatureMethod signatureMethod) {
        if(signatureMethod.getInterfaceMethod()){
            if (interfaces.containsKey(signatureMethod.getInterfaceName())){
                interfaces.get(signatureMethod.getInterfaceName()).add(signatureMethod.getSignature());
            } else {
                Set<String> toAdd = new HashSet<String>();
                toAdd.add(signatureMethod.getSignature());
                interfaces.put(signatureMethod.getInterfaceName(),toAdd);
            }
        }
    }
}

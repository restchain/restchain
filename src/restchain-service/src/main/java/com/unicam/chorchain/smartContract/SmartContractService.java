package com.unicam.chorchain.smartContract;

import com.unicam.chorchain.choreography.UploadFile;
import com.unicam.chorchain.codeGenerator.Factories;
import com.unicam.chorchain.codeGenerator.SolidityGenerator;
import com.unicam.chorchain.instance.InstanceDTO;
import com.unicam.chorchain.instance.InstanceMapper;
import com.unicam.chorchain.model.*;
import com.unicam.chorchain.storage.FileSystemStorageService;
import com.unicam.chorchain.storage.FileSystemStorageSolidityService;
import com.unicam.chorchain.translator.ChoreographyBpmn;
import com.unicam.chorchain.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.util.FileUtil;
import org.camunda.bpm.model.bpmn.Bpmn;
import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.instance.StartEvent;
import org.camunda.bpm.model.xml.instance.DomElement;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.*;
import org.web3j.codegen.SolidityFunctionWrapperGenerator;
import org.web3j.crypto.*;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.admin.Admin;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.RemoteCall;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.*;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.Contract;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;
import org.web3j.tx.gas.DefaultGasProvider;
import org.web3j.utils.Numeric;

import javax.annotation.PostConstruct;
import javax.persistence.EntityNotFoundException;
import javax.validation.Valid;
import java.io.*;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.math.BigInteger;
import java.net.ConnectException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SmartContractService {

    @Value("${solidity.dir}")
    private String projectPath;
    @Value("${solidity.pragma.solidity-version}")
    private String pragmaSolidityVersion;
    @Value("${solidity.account.admin}")
    private String adminAccount;
    @Value("${solidity.password.admin}")
    private String passAdminAccount;
    @Value("${solidity.node.url}")
    private String blcokChainUrl;
    @Value("${solidity.gas.limit}")
    private long gasLimit;
    @Value("${solidity.gas.price}")
    private long gasPrice;


    private final FileSystemStorageSolidityService fileSystemStorageSolidityService;
    private final FileSystemStorageService fileSystemStorageService;
    private final UserService userService;
    private final SmartContractRepository repository;
    private final SmartContractMapper mapper;
    private final InstanceMapper instanceMapper;

    private List<String> tasks;
    private String CONTRACT_ADDRESS = "";
    private Web3j web3j;

    private Admin adm;

    private static boolean pendingTransaction = false;

    @PostConstruct
    public void init() {
        web3j = Web3j.build(new HttpService(blcokChainUrl));
        adm = Admin.build(new HttpService(blcokChainUrl));
    }


    public Set<SmartContractDTO> getMySmartContracts() {
        Set<InstanceParticipantUser> instances = userService.findUserByAddress(userService.getLoggedUser()
                .getUsername())
                .getParticipantsAssociated();
        Set<SmartContractDTO> sc = instances.stream()
                .filter(i -> i.getInstance().getSmartContract() != null)
                .map(InstanceParticipantUser::getInstance)
                .map(Instance::getSmartContract)
                .map(mapper::toDTO)
                .collect(Collectors.toSet());
        return sc;
    }

    public Set<SmartContractImplDTO> getMySmartContractImpls() {
        Set<InstanceParticipantUser> instances = userService.findUserByAddress(userService.getLoggedUser()
                .getUsername())
                .getParticipantsAssociated();
        Set<SmartContractImplDTO> sc = instances.stream()
                .filter(i -> i.getInstance().getSmartContract() != null)
                .map(InstanceParticipantUser::getInstance)
                .map(Instance::getSmartContract)
                .map(SmartContract::getSmartContractImpl)
                .flatMap(x -> x.stream())
                .map(mapper::toImplDTO)
                .collect(Collectors.toSet());
        return sc;
    }

    public Set<SmartContractDTO> getMySmartContractImplsBySmartContractId(Long smartContractId) {
        Set<InstanceParticipantUser> instances = userService.findUserByAddress(userService.getLoggedUser()
                .getUsername())
                .getParticipantsAssociated();
        Set<SmartContractDTO> sc = instances.stream()
                .filter(i -> i.getInstance().getSmartContract().getId().equals(smartContractId) && i.getInstance()
                        .getSmartContract() != null)
                .map(InstanceParticipantUser::getInstance)
                .map(Instance::getSmartContract)
                .map(SmartContract::getSmartContractImpl)
                .flatMap(x -> x.stream())
                .map(mapper::toDTO)
                .collect(Collectors.toSet());
        return sc;
    }

    public Set<InstanceDTO> getInstancesWithSmartContract() {
        Set<InstanceParticipantUser> instances = userService.findUserByAddress(userService.getLoggedUser()
                .getUsername())
                .getParticipantsAssociated();
        Set<InstanceDTO> sc = instances.stream()
                .filter(i -> i.getInstance().getSmartContract() != null)
                .map(InstanceParticipantUser::getInstance)
                .map(instanceMapper::toInstanceDTO)
                .collect(Collectors.toSet());

        return sc;
    }


    public SmartContractFullDTO read(@Valid Long id) {
        return mapper.toFullDTO(findSmartContractById(id));
    }

    public SmartContract findSmartContractById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(String.format("SmartContract " + id + " was not found in the database",
                        id)));
    }


    public SmartContractFullDTO createCompileDeployImpl(InstanceImplRequest instanceImplRequest) {
        log.debug("instanceImplRequest {}", instanceImplRequest);
        SmartContract smartContract = findSmartContractById(instanceImplRequest.getSmartContractId());

        //Contract name rename
        String solidityDataImpl = instanceImplRequest.getData().replaceFirst("contract " + smartContract.getInstance()
                .getChoreography()
                .getName(), "contract " + instanceImplRequest.getName());


        Set<String> interfacesToReplace = new HashSet<String>();

        //Replace the whole interfaceImpls name founded
        for(String inter : smartContract.getInterfaces()){
            String newInterfaceImplName = inter.concat(instanceImplRequest.getName() + "Impl");
            interfacesToReplace.add(newInterfaceImplName);
            solidityDataImpl = solidityDataImpl.replace(inter.concat("Impl"), newInterfaceImplName);
        }

        UploadFile solidityFile = new UploadFile(solidityDataImpl,
                instanceImplRequest.getName(),
                ".sol");


        fileSystemStorageSolidityService.storeSolidity(solidityFile, projectPath);

        log.debug("Compiling solidity file ...");
        compile(solidityFile.getFilename());
        try {
            deploy(solidityFile.getFilename());

            log.debug("Deploying on the blockchain ...");
            String contractAddress = deploy(solidityFile.getName());

            log.debug("Storing the SmartContract.....");
            String abi = FileUtil.readAsString(fileSystemStorageSolidityService.load(smartContract.getInstance()
                    .getChoreography()
                    .getName()
                    .concat(".abi"))
                    .toFile());
            String bin = FileUtil.readAsString(fileSystemStorageSolidityService.load(smartContract.getInstance()
                    .getChoreography()
                    .getName()
                    .concat(".bin"))
                    .toFile());

            SmartContract smartContractImpl = new SmartContract(contractAddress,
                    abi,
                    bin,
                    smartContract.getInstance(),
                    smartContract.getFunctionSignatures(),
                    solidityFile.getData());

            smartContractImpl.setName(instanceImplRequest.getName());
            smartContractImpl.setStubInstance(smartContract);

            return mapper.toFullDTO(repository.save(smartContractImpl));
        } catch (SmartContractConnectExceptionException | SmartContractCompilationException e) {
            throw e;
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new SmartContractDeployException(e.getMessage(), e.getCause());
        }
    }


    public SolidityInstanceUploaded generateSolidityCode(Instance instance, Path modelPath,String pragmaSolidityVersion) {

        SolidityGenerator sg = new SolidityGenerator(instance);
        BpmnModelInstance modelInstance = Bpmn.readModelFromFile(modelPath.toFile());

        //Business logic to retrieve the choreography id of the bpmn:choreography element
        Optional<DomElement> choreographyDom = modelInstance.getDocument()
                .getRootElement()
                .getChildElements()
                .stream()
                .filter(e -> e.getLocalName().equals("choreography"))
                .findFirst();

        if (choreographyDom.isPresent()) {
            ModelElementInstance choreography = modelInstance.getModelElementById(choreographyDom.get()
                    .getAttribute("id"));
            sg.setChoreography(choreography);
        }


        //implement a business logic that will match the exact starting orders of loading
        modelInstance.getModelElementsByType(StartEvent.class)
                .forEach(e -> sg.traverse(Factories.bpmnModelFactory.create(e)));
        String code = sg.build(pragmaSolidityVersion);

        //save the generated code to a file
        try {
            UploadFile uploadFile = new UploadFile(code, instance.getChoreography().getName(), ".sol");

            fileSystemStorageSolidityService.storeSolidity(uploadFile, projectPath);
            return new SolidityInstanceUploaded(uploadFile, sg.getSolidityInstance());
        } catch (Exception e) {
            tasks = null;
            e.printStackTrace();
        }
        return null;
    }

    /***
     * Compiles a solidity  file
     * @param fileName - used to retrieve the real file from the filesystem
     */
    public void compile(String fileName) {
        try {
            String solPath = projectPath + File.separator + fileName;
            log.debug("Solidity file: " + solPath);
            String destinationPath = projectPath + File.separator;
            log.debug("destination path " + destinationPath);
            // equivalent to:
            // solc path --bin --abi --overwrite --optimize -o output
            String[] comm = {"solc", solPath, "--bin", "--abi", "--overwrite", "--optimize", "-o", destinationPath};

            Runtime rt = Runtime.getRuntime();
//            try {
            Process p = rt.exec(comm);
            BufferedReader bri = new BufferedReader(new InputStreamReader(p.getInputStream()));
            BufferedReader bre = new BufferedReader(new InputStreamReader(p.getErrorStream()));
            String line;
            while ((line = bri.readLine()) != null) {
                log.debug(line);
            }
            bri.close();

            StringBuilder error = new StringBuilder();
            while ((line = bre.readLine()) != null) {
                log.error(line);
                error.append(line);
            }


            if (error.toString().contains("Error:")) {
                throw new SmartContractCompilationException(error.toString());
            }

            bre.close();
            p.waitFor();

//            } catch (RuntimeException e) {
//                log.error("Something weird happened while processing " + comm, e);
//                throw e;
//            }

        } catch (SmartContractCompilationException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public SmartContract createFromBpmn(Instance instance) {
        try {

            log.debug("Generating solidity file ...");

            SolidityInstanceUploaded solidityInstanceUploaded = generateSolidityCode(instance,
                    fileSystemStorageService.load(instance.getChoreography().getFilename()),pragmaSolidityVersion);


            UploadFile solidityFile = solidityInstanceUploaded.uploadFile;
            log.debug("ElementIds found ...{}", solidityInstanceUploaded.getSolidityInstance().getElementsId());

            log.debug("Compiling solidity file ...");
            compile(solidityFile.getFilename());

            log.debug("Deploying on the blockchain ...");
            String contractAddress = deploy(solidityFile.getName());

            log.debug("Storing the SmartContract.....");
            String abi = FileUtil.readAsString(fileSystemStorageSolidityService.load(instance.getChoreography()
                    .getName()
                    .concat(".abi"))
                    .toFile());
            String bin = FileUtil.readAsString(fileSystemStorageSolidityService.load(instance.getChoreography()
                    .getName()
                    .concat(".bin"))
                    .toFile());
            SmartContract smartContract = new SmartContract(contractAddress,
                    abi,
                    bin,
                    instance,
                    solidityInstanceUploaded.getSolidityInstance().getElementsId(),
                    solidityFile.getData());
            smartContract.setInterfaces(solidityInstanceUploaded.solidityInstance.getInterfaces().keySet());
            repository.save(smartContract);

            return smartContract;
        } catch (SmartContractConnectExceptionException | SmartContractCompilationException e) {
            throw e;
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new SmartContractDeployException(e.getMessage(), e.getCause());
        }
    }

    public String getFileContent(String filePath, boolean newLinePerRow) {
        StringBuilder contentBuilder = new StringBuilder();
        try (Stream<String> stream = Files.lines(Paths.get(filePath), StandardCharsets.UTF_8)) {
            if (newLinePerRow)
                stream.forEach(s -> contentBuilder.append(s));
            else
                stream.forEach(s -> contentBuilder.append(s).append("\n"));
        } catch (IOException e) {
            e.printStackTrace();
        }

        return contentBuilder.toString();
    }


    // TODO, understand and then or remove the removable or left there the needed

    public void wrapper(String fileName) {
        String path = projectPath + File.separator;
        String p = Paths.get("").toAbsolutePath().normalize().toString();
        //System.out.println(p);
        String abiPath = path + parseName(fileName, ".abi");
        String binPath = path + parseName(fileName, ".bin");

        String[] args2 = {"-a", abiPath, "-b", binPath, "-o", "src", "-p",
                projectPath + File.separator + File.separator,};

        SolidityFunctionWrapperGenerator.main(args2);
        //System.out.println("Java contract done");
    }

    public Credentials getCredentialFromPrivateKey(String privateKey) throws IOException, CipherException {
        // return WalletUtils.loadCredentials("andrea",
        // "src/main/resources/UTC--2018-12-06T16-44-54.114315504Z--19a3f868355394b5423106fb31f201da646139af");
        return Credentials.create(privateKey);
    }

    public static String parseName(String name, String extension) {
        String[] oldName = name.split("\\.");

        String newName = oldName[0] + extension;
        return newName;
    }

    public String reflection(String toExec, String role) {
        String finalName = "";
        //System.out.println("sobo dentro al metodo");

        try {
            Class c = Class.forName("com.unicam.resources.Abstract");

            Method methods[] = c.getDeclaredMethods();

            Credentials credentials;

            credentials = WalletUtils.loadCredentials("123",
                    projectPath + "/ChorChain/src/com/unicam/resources/UTC--2019-01-16T15-25-24.286179700Z--1adc6ea9d2ddc4dcb45bfc36f01ca8e266026155");
            //credentials = getCredentialFromPrivateKey("02D671CA1DC73973ED1E8FB53AA73235CC788DA792E41DB4170616EDED86D23D");

            //Credentials credentials1 = WalletUtils.loadCredentials("123", "C:/Users/Alessandro/Desktop/ChorChain/src/com/unicam/resources/UTC--2019-01-25T17-30-24.611307800Z--c3939b1fb6c589fc8636085dd4c52e9b61dab675");
            //Credentials credentials2 = WalletUtils.loadCredentials("123", "C:/Users/Alessandro/Desktop/ChorChain/src/com/unicam/resources/UTC--2019-01-25T17-28-43.107787100Z--bb98c741fc045cd434ad73080c7c90fa13d78958");

            RemoteCall returnv;

            // controllo l'array contenente i metodi per cercare il deploy
            for (Method method : methods) {
                if (method.getName() == "deploy" && toExec == "deploy") {

                    Parameter[] params = method.getParameters();

                    if (params.length == 3
                            && !params[1].getType().toString().equals(TransactionManager.class.toString())) {

                        Object arglist[] = new Object[3];
                        arglist[0] = web3j;
                        arglist[1] = credentials;
                        arglist[2] = new DefaultGasProvider();
                        //System.out.println(arglist.length);
                        returnv = (RemoteCall) method.invoke(c, arglist);
                        // invio la remote call generata dal deploy
                        Object address = returnv.send();
                        CONTRACT_ADDRESS = ((Contract) address).getContractAddress();

                        //System.out.println("Contract deployed at --> " + CONTRACT_ADDRESS + "<--");
                        return null;

                    }
                } else if (method.getName() == "subscribe_as_participant" && toExec == "subscribe_as_participant") {
                    Class[] parameterTypes = new Class[4];
                    parameterTypes[0] = String.class;
                    parameterTypes[1] = Web3j.class;
                    parameterTypes[2] = Credentials.class;
                    parameterTypes[3] = ContractGasProvider.class;

                    Method loadContract = c.getMethod("load", parameterTypes);
                    Contract contract = (Contract) loadContract.invoke(c, CONTRACT_ADDRESS, web3j, credentials,
                            new DefaultGasProvider());

                    // com.unicam.resources.Choreography contract =
                    // com.unicam.resources.Choreography.load(CONTRACT_ADDRESS, web3j, credentials,
                    // new DefaultGasProvider());

                    Object arglist[] = new Object[2];
                    arglist[0] = role;
                    arglist[1] = new BigInteger("0");
                    RemoteCall<TransactionReceipt> returnv1 = (RemoteCall<TransactionReceipt>) method.invoke(
                            contract,
                            arglist);
                    TransactionReceipt t = returnv1.send();
                    if (t != null) {

                        Class[] parameter = new Class[1];
                        parameter[0] = TransactionReceipt.class;
                        Method getEvent = c.getMethod("getInfoEvents", parameter);

                        List<Object> events = (List<Object>) getEvent.invoke(contract, t);
                        for (Object e : events) {
                            Field fi = e.getClass().getDeclaredField("next");
                            //System.out.println(fi.get(e));
                            finalName = (String) fi.get(e);
                            return finalName;
							/*for (SmartContract co : allFunctions) {
								if(co.getName() == finalName) {
									return co;
								}
							}*/

                        }
                    }
                    return null;

                }

            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;

    }


    public String deploy(String name) throws Exception {
        try {
            //Unlocking administration account
            adm.personalUnlockAccount(adminAccount, passAdminAccount).send();

            EthGetTransactionCount ethGetTransactionCount = web3j.ethGetTransactionCount(
                    adminAccount, DefaultBlockParameterName.LATEST).sendAsync().get();
            BigInteger nonce = ethGetTransactionCount.getTransactionCount();

            BigInteger GAS_PRICE = BigInteger.valueOf(gasPrice);
            BigInteger GAS_LIMIT = BigInteger.valueOf(gasLimit);

            //compiled smart contract code
            String compiledSCCode = new String(Files.readAllBytes(Paths.get(projectPath + File.separator + parseName(
                    name,
                    ".bin"))));

            Transaction transaction = Transaction.createContractTransaction(
                    adminAccount,
                    nonce,
                    GAS_PRICE,
                    GAS_LIMIT,
                    BigInteger.ZERO,
                    "0x" + compiledSCCode);

            //send sync
            EthSendTransaction transactionResponse = web3j.ethSendTransaction(transaction).send();

            if (transactionResponse.hasError()) {
                log.error(transactionResponse.getError().getData());
                log.error(transactionResponse.getError().getMessage());
            }
//            String transactionHash = transactionResponse.getTransactionHash();
//            log.info("TxHash: " + transactionHash);

            EthGetTransactionReceipt receipt = web3j.ethGetTransactionReceipt(transactionResponse.getTransactionHash())
                    .send();
            if (receipt.getTransactionReceipt().isPresent()) {
                TransactionReceipt r = receipt.getTransactionReceipt().get();
                String contractAddress = r.getContractAddress();
                log.info("Contract address: {}", contractAddress);
                log.info("Tx receipt: from={}, to={}, gas={}, cumulativeGas={}",
                        r.getFrom(),
                        r.getTo(),
                        r.getGasUsed().intValue(),
                        r.getCumulativeGasUsed().intValue());
                return contractAddress;
            }

            return null;
        } catch (ConnectException e) {
            throw new SmartContractConnectExceptionException("Impossible to reach the block chain node - " + e.getMessage());
        } catch (Exception e) {
            throw new SmartContractDeployException(e.getMessage());
        }
    }

    public SmartContract oldGenerateCode(Instance instance, Path modelPath) {

        log.debug("Create solidity... instance {}", instance.getId(), instance.getChoreography().getName());


        Choreography choreography = instance.getChoreography();
        Set<Participant> setOfMandatoryParticipants = instance.getMandatoryParticipants()
                .stream()
                .map(InstanceParticipantUser::getParticipant).distinct().collect(Collectors.toSet());

        Set<Participant> optionalParticipants = new HashSet<>(choreography.getParticipants());
        optionalParticipants.removeAll(setOfMandatoryParticipants);


        List<String> setStringOptionalParticipants = optionalParticipants.stream()
                .map((p) -> p.getName())
                .collect(Collectors.toList());
        List<String> setStringMandatoryParticipants = setOfMandatoryParticipants.stream()
                .map((p) -> p.getName())
                .collect(Collectors.toList());

        ChoreographyBpmn choreographyBpmn = new ChoreographyBpmn();
//        File f = new File(projectPath + File.separator + "bpmn" + File.separator + fileName);


        HashMap<String, User> myParticipants = new HashMap();

        instance.getMandatoryParticipants()
                .forEach((i) -> myParticipants.put(i.getParticipant().getName(), i.getUser()));

        try {
            choreographyBpmn.start(modelPath.toFile(),
                    myParticipants,
                    setStringOptionalParticipants,
                    setStringMandatoryParticipants);

            UploadFile uploadFile = new UploadFile(choreographyBpmn.choreographyFile, choreography.getName(), ".sol");


            fileSystemStorageSolidityService.storeSolidity(uploadFile, projectPath);

        } catch (Exception e) {
            tasks = null;
            e.printStackTrace();
        }

        return choreographyBpmn.finalContract;
    }


    public String deployOld(String bin) throws Exception {
        if (pendingTransaction == true) {
            log.error("Sembra ci sia una transazione pendente");
            return "ERROR";
        }

        String binar = new String(Files.readAllBytes(Paths.get(projectPath + File.separator + parseName(bin,
                ".bin"))));


//        //Unlocking the account
//        PersonalUnlockAccount personalUnlockAccount = adm.personalUnlockAccount(adminAccount,
//                passAdminAccount).send();
//        //Getting the nonce


        EthGetTransactionCount ethGetTransactionCount = web3j.ethGetTransactionCount(
                adminAccount, DefaultBlockParameterName.LATEST).sendAsync().get();
        BigInteger nonce = ethGetTransactionCount.getTransactionCount();

        BigInteger GAS_PRICE = BigInteger.valueOf(13_000_000_000L);
        BigInteger GAS_LIMIT = BigInteger.valueOf(6_900_000L);

        BigInteger blockGasLimit = web3j.ethGetBlockByNumber(DefaultBlockParameterName.LATEST, false)
                .send()
                .getBlock()
                .getGasLimit();


        Transaction transaction = Transaction.createContractTransaction(
                adminAccount,
                nonce,
                GAS_PRICE,
                GAS_LIMIT,
                BigInteger.ZERO,
                binar);

        EthEstimateGas estimation = web3j.ethEstimateGas(transaction).send();
//        BigInteger amountUsed = estimation.getAmountUsed();
//        log.debug("AMOUNT OF GAS USED: " + amountUsed + "AND current gas block limit(not used): " + blockGasLimit);


        Transaction transaction1 = Transaction.createContractTransaction(
                adminAccount,
                nonce,
                GAS_PRICE,
                GAS_LIMIT,
                BigInteger.ZERO,
                "0x" + binar);

        //send sync
        EthSendTransaction transactionResponse = web3j.ethSendTransaction(transaction1).sendAsync().get();
        pendingTransaction = true;
        if (transactionResponse.hasError()) {
            log.error(transactionResponse.getError().getData());
            log.error(transactionResponse.getError().getMessage());
        }
        String transactionHash = transactionResponse.getTransactionHash();
        log.info("Thash: " + transactionHash);
        EthGetTransactionReceipt transactionReceipt = web3j.ethGetTransactionReceipt(transactionHash).send();

        //Optional<TransactionReceipt> receiptOptional = transactionReceipt.getTransactionReceipt();
        for (int i = 0; i < 222220; i++) {
//            log.debug("Wait: " + i);
            if (!transactionReceipt.getTransactionReceipt().isPresent()) {
                //Thread.sleep(5000);
                transactionReceipt = web3j.ethGetTransactionReceipt(transactionHash).send();

            } else {
                break;
            }
        }
        TransactionReceipt transactionReceiptFinal = transactionReceipt.getTransactionReceipt().get();
        //System.out.println(transactionReceiptFinal.getContractAddress());

        String contractAddress = transactionReceiptFinal.getContractAddress();
        pendingTransaction = false;
        log.debug(contractAddress);
        return contractAddress;


    }

    private static String getStringFromInputStream(InputStream is) {

        BufferedReader br = null;
        StringBuilder sb = new StringBuilder();

        String line;
        try {

            br = new BufferedReader(new InputStreamReader(is));
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }

        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (br != null) {
                try {
                    br.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        return sb.toString();

    }

    public void signOffline(Parameters parameters, SmartContract contractDb, String account,
                            String functionName) throws Exception {
        LinkedHashMap<String, String> hashed = contractDb.getTaskIdAndRole();
        //System.out.println("size di hashed: " + hashed.size());
        int b = 0;
        int z = 0;
//		for(int i = 0; i < contractDb.getTasks().size(); i++) {
//			//System.out.println("iiiiii: " + i);
//			if(contractDb.getTasks().get(i).equals(functionName)) {
//				//System.out.println("task trovato : " + contractDb.getTasks().get(i));
//				//System.out.println("VALORE DI I : " + i);
//				z = i;
//				break;
//			}
//		}

        for (Map.Entry<String, String> params : hashed.entrySet()) {
            //System.out.println("valore di b " + b + " e di i " + z);
            if (b == z) {
                functionName = params.getKey().split("\\(")[0];
                //System.out.println("chiave: " + params.getKey());
                break;
            } else {
                b++;
            }
        }

        //System.out.println("NOME NUOVO DELLA FUNZIONE: " + functionName);

        BigInteger GAS_PRICE = BigInteger.valueOf(7_600_000_000L);
        BigInteger GAS_LIMIT = BigInteger.valueOf(6_700_000L);

        EthGetTransactionCount ethGetTransactionCount = web3j.ethGetTransactionCount(
                account, DefaultBlockParameterName.LATEST).sendAsync().get();
        BigInteger nonce = ethGetTransactionCount.getTransactionCount();
        //System.out.println(nonce);


        List<Type> t = new ArrayList<Type>();
        for (Map.Entry<String, String> params : parameters.getParamsAndValue().entrySet()) {
            if (params.getKey().equals("uint")) {
                int intValue = Integer.parseInt(params.getValue());
                t.add(new Uint(BigInteger.valueOf(intValue)));
            } else if (params.getKey().equals("string")) {
                t.add(new Utf8String(params.getValue()));
            } else if (params.getKey().equals("bool")) {
                boolean boolValue = Boolean.parseBoolean(params.getValue());
                t.add(new Bool(boolValue));
            } else if (params.getKey().equals("address")) {
                t.add(new Address(params.getValue()));
            }
        }


        Function function = new Function(
                functionName,
                t,
                Collections.emptyList()
        );


        String encoded = FunctionEncoder.encode(function);


        RawTransaction ta = RawTransaction.createTransaction(
                nonce,
                // BigInteger.valueOf(131),
                GAS_PRICE,
                GAS_LIMIT,
                //"0xcc8bdb5dd918c9ec86e31b416f627ad0cc5ea22d",
                contractDb.getAddress(),
                encoded
        );

        Credentials credentials = getCredentialFromPrivateKey(parameters.getPrivateKey());
        byte[] signedMessage = TransactionEncoder.signMessage(ta, credentials);
        String hexValue = Numeric.toHexString(signedMessage);
        EthSendTransaction ethSendTransaction = web3j.ethSendRawTransaction(hexValue).sendAsync().get();
        //  if(ethSendTransaction.hasError()) {
        //System.out.println(ethSendTransaction.getError().getData());
        //System.out.println(ethSendTransaction.getError().getMessage());}
        String transactionHash = ethSendTransaction.getTransactionHash();
        EthGetTransactionReceipt transactionReceipt = web3j.ethGetTransactionReceipt(transactionHash).send();

        for (int i = 0; i < 222220; i++) {
            //System.out.println("Wait: " + i);
            if (!transactionReceipt.getTransactionReceipt().isPresent()) {
                transactionReceipt = web3j.ethGetTransactionReceipt(transactionHash).send();
            } else {
                break;
            }
        }
        TransactionReceipt transactionReceiptFinal = transactionReceipt.getTransactionReceipt().get();
        //System.out.println(transactionReceiptFinal.getLogs());
        //System.out.println(transactionReceiptFinal.getLogsBloom());

    }


}

package com.unicam.chorchain.blockchain;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.crypto.CipherException;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.*;
import org.web3j.utils.Numeric;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.math.BigInteger;
import java.security.InvalidAlgorithmParameterException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Slf4j
@Service
public class BlockchainService {

    @Value("${solidity.gas.limit}")
    private BigInteger gasLimit;
    @Value("${solidity.gas.price}")
    private BigInteger gasPrice;

    @Autowired
    private Web3j web3j;
    Credentials credentials;

    public BlockchainService(Web3j web3j) {
        this.web3j = web3j;
    }

    public String getClientVersion() throws IOException {
        Web3ClientVersion web3ClientVersion = web3j.web3ClientVersion().send();
        return web3ClientVersion.getWeb3ClientVersion();
    }


    public void test() throws IOException {
        log.debug("test {}");
        EthAccounts accounts = web3j.ethAccounts().send();
    }

    @PostConstruct
    public void init() throws IOException, CipherException, NoSuchAlgorithmException, NoSuchProviderException, InvalidAlgorithmParameterException {
        EthCoinbase coinbase = web3j.ethCoinbase().send();
        EthAccounts accounts = web3j.ethAccounts().send();
        for (int i = 1; i < accounts.getAccounts().size(); i++) {
            EthGetTransactionCount transactionCount = web3j.ethGetTransactionCount(coinbase.getAddress(),
                    DefaultBlockParameterName.LATEST).send();
            Transaction transaction = Transaction.createEtherTransaction(coinbase.getAddress(),
                    transactionCount.getTransactionCount(),
                    gasPrice,
                    gasLimit,
                    accounts.getAccounts().get(i),
                    BigInteger.valueOf(25_000_000_000L));
            web3j.ethSendTransaction(transaction).send();
            EthGetBalance balance = web3j.ethGetBalance(accounts.getAccounts().get(i), DefaultBlockParameterName.LATEST)
                    .send();
            log.info("Balance: address={}, amount={}", accounts.getAccounts().get(i), balance.getBalance().longValue());
        }
    }

    public BlockchainTransaction process(BlockchainTransaction trx) throws IOException {
        EthAccounts accounts = web3j.ethAccounts().send();
        EthGetTransactionCount transactionCount = web3j.ethGetTransactionCount(trx.getFromId(),
                DefaultBlockParameterName.LATEST).send();
        Transaction transaction = Transaction.createEtherTransaction(trx.getFromId(),
                transactionCount.getTransactionCount(),
                BigInteger.valueOf(trx.getValue()),
                BigInteger.valueOf(21_000),
                trx.getToId(),
                BigInteger.valueOf(trx.getValue()));
        EthSendTransaction response = web3j.ethSendTransaction(transaction).send();
        if (response.getError() != null) {
            trx.setAccepted(false);
            return trx;
        }
        trx.setAccepted(true);
        String txHash = response.getTransactionHash();
        log.info("Tx hash: {}", txHash);
        trx.setId(txHash);
        EthGetTransactionReceipt receipt = web3j.ethGetTransactionReceipt(txHash).send();
        if (receipt.getTransactionReceipt().isPresent()) {
            log.info("Tx receipt: {}", receipt.getTransactionReceipt().get().getCumulativeGasUsed().intValue());
        }
        return trx;
    }

    public BlockchainTransactionWithIpfs processFunction(
            BlockchainTransactionWithIpfs tx) throws ExecutionException, InterruptedException, IOException {

        EthGetTransactionCount ethGetTransactionCount = web3j.ethGetTransactionCount(
                tx.getFromId(), DefaultBlockParameterName.LATEST).sendAsync().get();
        BigInteger nonce = ethGetTransactionCount.getTransactionCount();

        List<Type> params = new ArrayList<>();
        params.add(new Utf8String(tx.getIpfsId()));
        Function function = new Function(
                tx.getFunctionName(),
                params,
                Collections.emptyList()
        );
        String encoded = FunctionEncoder.encode(function);


        RawTransaction ta = RawTransaction.createTransaction(
                nonce,
                // BigInteger.valueOf(131),
                gasPrice, gasLimit,
                //"0xcc8bdb5dd918c9ec86e31b416f627ad0cc5ea22d",
                tx.getContractAddress(),
                encoded
        );
        credentials = Credentials.create(tx.getPrivateKey());


        byte[] signedMessage = TransactionEncoder.signMessage(ta, credentials);
        String hexValue = Numeric.toHexString(signedMessage);
        EthSendTransaction ethSendTransaction = web3j.ethSendRawTransaction(hexValue).sendAsync().get();
        if (ethSendTransaction.hasError()) {
            log.info("ethSendTransaction.getError().getData() {}", ethSendTransaction.getError().getData());
            log.info("ethSendTransaction.getError().getMessage() {}", ethSendTransaction.getError().getMessage());
        }
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
        log.info("transactionReceiptFinal.getLogs() {}", transactionReceiptFinal.getLogs());
        log.info("transactionReceiptFinal.getLogsBloom() {}", transactionReceiptFinal.getLogsBloom());
        return tx;
    }
}
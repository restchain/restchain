package com.unicam.chorchain.smartContract;

import com.unicam.chorchain.model.SmartContract;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.List;

public interface SmartContractRepository extends PagingAndSortingRepository<SmartContract, Long> {
}

package com.unicam.chorchain.user;


import com.unicam.chorchain.model.User;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.Optional;

public interface UserRepository extends PagingAndSortingRepository<User, Long> {

    Optional<User> findByAddress(String address);
    Optional<User> findById(Long id);
}

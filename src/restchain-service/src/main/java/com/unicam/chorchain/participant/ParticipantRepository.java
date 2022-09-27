package com.unicam.chorchain.participant;

import com.unicam.chorchain.model.Participant;
import org.springframework.data.repository.PagingAndSortingRepository;

public interface ParticipantRepository extends PagingAndSortingRepository<Participant, Long> {
}

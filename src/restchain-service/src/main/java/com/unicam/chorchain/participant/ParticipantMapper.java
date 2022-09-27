package com.unicam.chorchain.participant;

import com.unicam.chorchain.model.Participant;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ParticipantMapper {
    ParticipantDTO toDTO(Participant participant);
}

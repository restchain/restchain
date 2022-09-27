package com.unicam.chorchain.instanceParticipantUser;

import com.unicam.chorchain.model.InstanceParticipantUser;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InstanceParticipantUserMapper {
//    @Mapping(target = "userId", source = "user.id")
//    @Mapping(target = "userAddress", source = "user.address")
//    @Mapping(target = "participantId", source = "participant.id")
//    @Mapping(target = "instanceId", source = "instance.id")
//    @Mapping(target = "address", source = "instanceParticipantUser.user.address")
    InstanceParticipantUserDTO toDTO(InstanceParticipantUser instanceParticipantUser);
}

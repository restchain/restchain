package com.unicam.chorchain.instance;

import com.unicam.chorchain.instanceParticipantUser.InstanceParticipantUserMapper;
import com.unicam.chorchain.model.Instance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = InstanceParticipantUserMapper.class)
public interface InstanceMapper {
//    @Mapping(target = "smartContract", source = "smartContract.address")
    InstanceDTO toInstanceDTO(Instance instance);
}

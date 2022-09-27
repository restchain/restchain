package com.unicam.chorchain.choreography;

import com.unicam.chorchain.instance.InstanceMapper;
import com.unicam.chorchain.instanceParticipantUser.InstanceParticipantUserMapper;
import com.unicam.chorchain.model.Choreography;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring",  uses = InstanceMapper.class)
public interface ChoreographyMapper {
    @Mapping(target = "uploadedBy", source = "uploadedBy.address")
    @Mapping(target = "uploaded", source = "created")
    //Prende dal choreography la proprietà user.adress invece di tutto user
//    @Mapping(target = "participantSize", expression = "java(choreography.getParticipants().size())")
//    @Mapping(target = "instanceSize", expression = "java(choreography.getInstances().size())")
    ChoreographyDTO toDTO(Choreography choreography);
}

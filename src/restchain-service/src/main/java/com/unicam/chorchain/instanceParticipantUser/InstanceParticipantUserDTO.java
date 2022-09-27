package com.unicam.chorchain.instanceParticipantUser;

import com.unicam.chorchain.participant.ParticipantDTO;
import com.unicam.chorchain.user.UserDTO;
import lombok.Data;

@Data
public class InstanceParticipantUserDTO {
    private Long id;
//    private Long instanceId;
    private ParticipantDTO participant;
    private UserDTO user;
}

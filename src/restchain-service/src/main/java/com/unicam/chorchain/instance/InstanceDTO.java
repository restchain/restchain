package com.unicam.chorchain.instance;

import com.unicam.chorchain.instanceParticipantUser.InstanceParticipantUserDTO;
import com.unicam.chorchain.smartContract.SmartContractShortDTO;
import com.unicam.chorchain.user.UserDTO;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class InstanceDTO {
    private Long id;
    private UserDTO createdBy;
    private List<InstanceParticipantUserDTO> mandatoryParticipants;
    private LocalDateTime created;
    private SmartContractShortDTO smartContract;
    private boolean done;
    private int pendingParticipants;
}

package com.unicam.chorchain.instance;

import lombok.Data;

import java.util.List;

@Data
public class InstanceRequest {
    private List<String> visibleAt;
    private List<Long> mandatoryParticipants;
    private Long modelId;
}

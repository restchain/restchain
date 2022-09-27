package com.unicam.chorchain.choreography;

import com.unicam.chorchain.instance.InstanceDTO;
import com.unicam.chorchain.participant.ParticipantDTO;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ChoreographyDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime uploaded;
    private String  uploadedBy;
    private String  svg;
    private List<ParticipantDTO> participants;
//    private int participantSize;
    private List<InstanceDTO> instances;
//    private int instanceSize;
}

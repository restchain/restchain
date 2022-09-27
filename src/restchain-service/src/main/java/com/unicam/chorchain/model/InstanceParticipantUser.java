package com.unicam.chorchain.model;

import lombok.*;

import javax.persistence.*;

@Entity
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
@Setter
public class InstanceParticipantUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Instance instance;

    @ManyToOne
    private Participant participant;

    @ManyToOne
    private User user;


    public InstanceParticipantUser(Instance instance, Participant participant) {
        this.instance = instance;
        this.participant = participant;
    }
}

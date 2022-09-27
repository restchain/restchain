package com.unicam.chorchain.model;

import lombok.*;

import javax.persistence.*;

@Entity
@ToString
@EqualsAndHashCode(of = "id")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PRIVATE) //Rende privato il costruttore senza argomenti
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @ManyToOne
    private Choreography choreography;


    public Participant(String name, Choreography choreography) {
        this.setName(name);
        this.setChoreography(choreography);
    }
}



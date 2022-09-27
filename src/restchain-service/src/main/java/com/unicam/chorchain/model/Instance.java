package com.unicam.chorchain.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@Getter
@Setter
public class Instance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Choreography choreography;

    @CreatedDate
    private LocalDateTime created;

    @OneToMany(mappedBy = "instance",cascade = CascadeType.ALL)
    private Set<InstanceParticipantUser> mandatoryParticipants = new HashSet<>(0);

    @ManyToOne(optional = false)
    private User createdBy;

    @OneToOne
    private SmartContract smartContract;

    @Transient
    public boolean isDone() {
        return getMandatoryParticipants().stream()
                .allMatch((m) -> m.getUser() != null);
    }

    @Transient
    public int getPendingParticipants() {
        return (int) getMandatoryParticipants().stream()
                .filter((m) -> m.getUser() == null).count();
    }

    public Instance(Choreography choreography, LocalDateTime created, User createdBy) {
        this.choreography = choreography;
        this.created = created;
        this.createdBy = createdBy;
    }
}

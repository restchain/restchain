package com.unicam.chorchain.model;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@ToString
@EqualsAndHashCode(of="id")
@NoArgsConstructor
@Getter
@Setter
public class Choreography {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false)
	private String filename;

	private String description;

	@ManyToOne(optional = false)
	private User uploadedBy;

	@Column(nullable = false)
	private LocalDateTime created;


	@OneToMany(mappedBy = "choreography",cascade = CascadeType.ALL) //Direttamente agganciata
	private Set<Instance> instances = new HashSet<>(0);

	@OneToMany(mappedBy = "choreography",cascade = CascadeType.ALL)
	private Set<Participant> participants = new HashSet<>(0);

	@Lob
	private String svg;

}

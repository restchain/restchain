package com.unicam.chorchain.choreography;

import com.unicam.chorchain.model.Choreography;
import org.springframework.data.repository.PagingAndSortingRepository;

public interface ChoreographyRepository  extends PagingAndSortingRepository <Choreography,Long>{
}
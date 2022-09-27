package com.unicam.chorchain.user;

import com.unicam.chorchain.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toUserDTO(User user);

    @Mappings({
            @Mapping(target="id", ignore=true),
            @Mapping(target="created", ignore=true)
    })
    User toUser(UserRequest userRequest);
}

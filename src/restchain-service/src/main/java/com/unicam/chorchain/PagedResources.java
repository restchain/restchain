package com.unicam.chorchain;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.Collection;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Data
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public class PagedResources<D> {


    @Data
    @AllArgsConstructor
    public static class PageMetadata {

        @JsonProperty
        private long number;
        @JsonProperty
        private long size;
        @JsonProperty
        private long totalElements;
        @JsonProperty
        private long totalPages;

    }

    @JsonProperty
    private final List<D> elements;
    @JsonProperty
    private final PageMetadata page;

    public static <S,D> PagedResources<D> createResources(Page<S> page, Function<S, D> assembler) {
        return new PagedResources<>(
                page.getContent().stream().map(assembler).collect(Collectors.toList()),
                new PageMetadata(page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages())
        );
    }

    public static <S,D> PagedResources<D> createResources(Collection<S> elements, PageMetadata pageMetadata, Function<S, D> assembler) {
        return new PagedResources<>(
                elements.stream().map(assembler).collect(Collectors.toList()),
                pageMetadata
        );
    }

}

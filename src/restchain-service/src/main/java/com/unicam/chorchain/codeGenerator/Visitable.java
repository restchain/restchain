package com.unicam.chorchain.codeGenerator;

public interface Visitable {
    void accept(Visitor visitor);
}

package com.unicam.chorchain.blockchain;

import lombok.Data;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;

@Data
public class IpfsCall {
    String url;
    String method;
    String params;
    String data;
}

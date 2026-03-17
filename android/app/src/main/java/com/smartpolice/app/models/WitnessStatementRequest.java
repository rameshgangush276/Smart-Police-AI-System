package com.smartpolice.app.models;

public class WitnessStatementRequest {
    private String witnessName;
    private String mobileNumber;
    private String statement;

    public WitnessStatementRequest(String witnessName, String mobileNumber, String statement) {
        this.witnessName = witnessName;
        this.mobileNumber = mobileNumber;
        this.statement = statement;
    }

    public String getWitnessName() { return witnessName; }
    public String getMobileNumber() { return mobileNumber; }
    public String getStatement() { return statement; }
}

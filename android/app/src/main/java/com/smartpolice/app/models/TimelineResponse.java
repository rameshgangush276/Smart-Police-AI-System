package com.smartpolice.app.models;

public class TimelineResponse {
    private boolean complaintRegistered;
    private boolean firRegistered;
    private boolean evidenceCollected;
    private boolean witnessStatements;
    private boolean arrestMade;
    private boolean chargesheetFiled;
    private String currentStatus;

    public boolean isComplaintRegistered() { return complaintRegistered; }
    public boolean isFirRegistered() { return firRegistered; }
    public boolean isEvidenceCollected() { return evidenceCollected; }
    public boolean isWitnessStatements() { return witnessStatements; }
    public boolean isArrestMade() { return arrestMade; }
    public boolean isChargesheetFiled() { return chargesheetFiled; }
    public String getCurrentStatus() { return currentStatus; }
}

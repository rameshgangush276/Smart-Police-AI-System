package com.smartpolice.app.ui.complaint;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.smartpolice.app.R;

public class ComplaintDetailActivity extends AppCompatActivity {

    private TextView tvDetailComplaintId, tvDetailOverview;
    private Button btnUploadEvidence, btnInvestigationTracker, btnRecordWitness, btnGenerateDocument;
    private String complaintId;
    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_complaint_detail);

        tvDetailComplaintId = findViewById(R.id.tvDetailComplaintId);
        tvDetailOverview = findViewById(R.id.tvDetailOverview);
        btnUploadEvidence = findViewById(R.id.btnUploadEvidence);
        btnInvestigationTracker = findViewById(R.id.btnInvestigationTracker);
        btnRecordWitness = findViewById(R.id.btnRecordWitness);
        btnGenerateDocument = findViewById(R.id.btnGenerateDocument);
        Button btnLegalAssistance = findViewById(R.id.btnLegalAssistance);

        // Get intents
        token = getIntent().getStringExtra("OFFICER_TOKEN");
        complaintId = getIntent().getStringExtra("COMPLAINT_ID");
        String compName = getIntent().getStringExtra("COMPLAINANT_NAME");
        String crimeCat = getIntent().getStringExtra("CRIME_CATEGORY");
        String incDate = getIntent().getStringExtra("INCIDENT_DATE");
        String dbId = getIntent().getStringExtra("COMPLAINT_DB_ID");

        tvDetailComplaintId.setText("Case ID: " + complaintId);
        tvDetailOverview.setText("Name: " + compName + "\nCrime: " + crimeCat + "\nDate: " + incDate);

        btnUploadEvidence.setOnClickListener(v -> {
            Intent intent = new Intent(this, com.smartpolice.app.ui.evidence.EvidenceUploadActivity.class);
            intent.putExtra("OFFICER_TOKEN", token);
            intent.putExtra("COMPLAINT_DB_ID", dbId);
            startActivity(intent);
        });

        btnInvestigationTracker.setOnClickListener(v -> {
            Intent intent = new Intent(this, InvestigationTrackerActivity.class);
            intent.putExtra("OFFICER_TOKEN", token);
            intent.putExtra("COMPLAINT_DB_ID", dbId);
            intent.putExtra("COMPLAINT_ID", complaintId);
            startActivity(intent);
        });

        btnRecordWitness.setOnClickListener(v -> {
            Intent intent = new Intent(this, WitnessStatementActivity.class);
            intent.putExtra("OFFICER_TOKEN", token);
            intent.putExtra("COMPLAINT_DB_ID", dbId);
            intent.putExtra("COMPLAINT_ID", complaintId);
            startActivity(intent);
        });

        btnGenerateDocument.setOnClickListener(v -> {
            Intent intent = new Intent(this, DocumentGeneratorActivity.class);
            intent.putExtra("OFFICER_TOKEN", token);
            intent.putExtra("COMPLAINT_DB_ID", dbId);
            intent.putExtra("COMPLAINT_ID", complaintId);
            intent.putExtra("COMPLAINT_CATEGORY", crimeCat);
            startActivity(intent);
        });

        btnLegalAssistance.setOnClickListener(v -> {
            Intent intent = new Intent(this, com.smartpolice.app.ui.legal.LegalAssistanceActivity.class);
            intent.putExtra("OFFICER_TOKEN", token);
            intent.putExtra("COMPLAINT_DB_ID", dbId);
            intent.putExtra("COMPLAINT_ID", complaintId);
            intent.putExtra("CRIME_CATEGORY", crimeCat);
            startActivity(intent);
        });
    }
}

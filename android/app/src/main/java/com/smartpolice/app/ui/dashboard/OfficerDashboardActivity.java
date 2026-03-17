package com.smartpolice.app.ui.dashboard;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.smartpolice.app.R;

public class OfficerDashboardActivity extends AppCompatActivity {

    private TextView tvOfficerName;
    private CardView btnRegisterComplaint;
    private CardView btnViewComplaints;
    private CardView btnHotspotMap;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_officer_dashboard);

        tvOfficerName = findViewById(R.id.tvOfficerName);
        btnRegisterComplaint = findViewById(R.id.btnRegisterComplaint);
        btnViewComplaints = findViewById(R.id.btnViewComplaints);
        btnHotspotMap = findViewById(R.id.btnHotspotMap);

        // Retrieve officer details from intent
        String officerName = getIntent().getStringExtra("OFFICER_NAME");
        String officerToken = getIntent().getStringExtra("OFFICER_TOKEN");
        if (officerName != null && !officerName.isEmpty()) {
            tvOfficerName.setText("Welcome, " + officerName);
        }

        btnRegisterComplaint.setOnClickListener(v -> {
            Intent intent = new Intent(this, com.smartpolice.app.ui.complaint.ComplaintRegistrationActivity.class);
            intent.putExtra("OFFICER_TOKEN", officerToken);
            startActivity(intent);
        });

        btnViewComplaints.setOnClickListener(v -> {
            Intent intent = new Intent(this, com.smartpolice.app.ui.complaint.ComplaintListActivity.class);
            intent.putExtra("OFFICER_TOKEN", officerToken);
            startActivity(intent);
        });

        btnHotspotMap.setOnClickListener(v -> {
            Intent intent = new Intent(this, HotspotMapActivity.class);
            intent.putExtra("OFFICER_TOKEN", officerToken);
            startActivity(intent);
        });

        findViewById(R.id.btnMyProfile).setOnClickListener(v -> {
            Intent intent = new Intent(this, ProfileActivity.class);
            intent.putExtra("OFFICER_TOKEN", officerToken);
            startActivity(intent);
        });

    }
}

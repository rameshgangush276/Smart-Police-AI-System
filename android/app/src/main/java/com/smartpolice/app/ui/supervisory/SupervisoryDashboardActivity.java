package com.smartpolice.app.ui.supervisory;

import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.smartpolice.app.R;

public class SupervisoryDashboardActivity extends AppCompatActivity {

    private TextView tvSupervisorName;
    private CardView btnOfficerWorkload;
    private CardView btnComplianceAlerts;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_supervisory_dashboard);

        tvSupervisorName = findViewById(R.id.tvSupervisorName);
        btnOfficerWorkload = findViewById(R.id.btnOfficerWorkload);
        btnComplianceAlerts = findViewById(R.id.btnComplianceAlerts);

        String supervisorName = getIntent().getStringExtra("OFFICER_NAME");
        if (supervisorName != null && !supervisorName.isEmpty()) {
            tvSupervisorName.setText("Welcome, " + supervisorName);
        }

        btnOfficerWorkload.setOnClickListener(v -> {
            android.content.Intent intent = new android.content.Intent(this, SupervisoryWorkloadActivity.class);
            intent.putExtra("OFFICER_TOKEN", getIntent().getStringExtra("OFFICER_TOKEN"));
            startActivity(intent);
        });

        btnComplianceAlerts.setOnClickListener(v -> {
            Toast.makeText(this, "Opening Compliance Alerts...", Toast.LENGTH_SHORT).show();
            // Implement later
        });
    }
}

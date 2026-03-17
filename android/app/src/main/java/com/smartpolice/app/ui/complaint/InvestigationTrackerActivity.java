package com.smartpolice.app.ui.complaint;

import android.graphics.Color;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.smartpolice.app.R;
import com.smartpolice.app.api.ApiService;
import com.smartpolice.app.api.RetrofitClient;
import com.smartpolice.app.models.TimelineResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class InvestigationTrackerActivity extends AppCompatActivity {

    private TextView tvTrackerCaseId;
    private TextView tvStageRegistered, tvStageFIR, tvStageEvidence, tvStageWitness, tvStageArrest, tvStageChargesheet;
    private Button btnRefreshTracker;
    private ApiService apiService;
    private String token;
    private String complaintDbId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_investigation_tracker);

        tvTrackerCaseId = findViewById(R.id.tvTrackerCaseId);
        tvStageRegistered = findViewById(R.id.tvStageRegistered);
        tvStageFIR = findViewById(R.id.tvStageFIR);
        tvStageEvidence = findViewById(R.id.tvStageEvidence);
        tvStageWitness = findViewById(R.id.tvStageWitness);
        tvStageArrest = findViewById(R.id.tvStageArrest);
        tvStageChargesheet = findViewById(R.id.tvStageChargesheet);
        btnRefreshTracker = findViewById(R.id.btnRefreshTracker);

        token = getIntent().getStringExtra("OFFICER_TOKEN");
        complaintDbId = getIntent().getStringExtra("COMPLAINT_DB_ID");
        String displayId = getIntent().getStringExtra("COMPLAINT_ID");
        
        tvTrackerCaseId.setText("Case Timeline: " + displayId);

        apiService = RetrofitClient.getClient().create(ApiService.class);

        btnRefreshTracker.setOnClickListener(v -> loadTimeline());

        loadTimeline();
    }

    private void loadTimeline() {
        btnRefreshTracker.setEnabled(false);
        btnRefreshTracker.setText("LOADING...");

        String authHeader = "Bearer " + token;
        apiService.getInvestigationTimeline(authHeader, complaintDbId).enqueue(new Callback<TimelineResponse>() {
            @Override
            public void onResponse(Call<TimelineResponse> call, Response<TimelineResponse> response) {
                btnRefreshTracker.setEnabled(true);
                btnRefreshTracker.setText("REFRESH STATUS");
                if (response.isSuccessful() && response.body() != null) {
                    updateUI(response.body());
                } else {
                    Toast.makeText(InvestigationTrackerActivity.this, "Failed to load timeline", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<TimelineResponse> call, Throwable t) {
                btnRefreshTracker.setEnabled(true);
                btnRefreshTracker.setText("REFRESH STATUS");
                Toast.makeText(InvestigationTrackerActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateUI(TimelineResponse timeline) {
        markStage(tvStageRegistered, timeline.isComplaintRegistered());
        markStage(tvStageFIR, timeline.isFirRegistered());
        markStage(tvStageEvidence, timeline.isEvidenceCollected());
        markStage(tvStageWitness, timeline.isWitnessStatements());
        markStage(tvStageArrest, timeline.isArrestMade());
        markStage(tvStageChargesheet, timeline.isChargesheetFiled());
    }

    private void markStage(TextView tv, boolean isComplete) {
        if (isComplete) {
            tv.setTextColor(Color.parseColor("#4CAF50")); // Green
            tv.setCompoundDrawablesWithIntrinsicBounds(0, 0, android.R.drawable.presence_online, 0);
        } else {
            tv.setTextColor(Color.parseColor("#9E9E9E")); // Grey
            tv.setCompoundDrawablesWithIntrinsicBounds(0, 0, 0, 0);
        }
    }
}

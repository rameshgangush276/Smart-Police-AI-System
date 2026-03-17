package com.smartpolice.app.ui.supervisory;

import android.os.Bundle;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.smartpolice.app.R;
import com.smartpolice.app.api.RetrofitClient;
import com.smartpolice.app.api.ApiService;
import com.smartpolice.app.models.WorkloadResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SupervisoryWorkloadActivity extends AppCompatActivity {

    private LinearLayout llWorkloadContainer;
    private Button btnRefreshWorkload;
    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_supervisory_workload);

        llWorkloadContainer = findViewById(R.id.llWorkloadContainer);
        btnRefreshWorkload = findViewById(R.id.btnRefreshWorkload);

        token = getIntent().getStringExtra("OFFICER_TOKEN");

        fetchWorkloadData();

        btnRefreshWorkload.setOnClickListener(v -> fetchWorkloadData());
    }

    private void fetchWorkloadData() {
        llWorkloadContainer.removeAllViews();
        TextView loading = new TextView(this);
        loading.setText("Fetching reporting data...");
        llWorkloadContainer.addView(loading);

        ApiService apiService = RetrofitClient.getRetrofitInstance().create(ApiService.class);
        Call<WorkloadResponse> call = apiService.getOfficerWorkload("Bearer " + token);

        call.enqueue(new Callback<WorkloadResponse>() {
            @Override
            public void onResponse(Call<WorkloadResponse> call, Response<WorkloadResponse> response) {
                llWorkloadContainer.removeAllViews();
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    List<WorkloadResponse.OfficerWorkload> workloads = response.body().getData();
                    
                    if (workloads.isEmpty()) {
                        TextView empty = new TextView(SupervisoryWorkloadActivity.this);
                        empty.setText("No officers found or no case assignments.");
                        llWorkloadContainer.addView(empty);
                        return;
                    }

                    for (WorkloadResponse.OfficerWorkload wl : workloads) {
                        android.view.View view = getLayoutInflater().inflate(R.layout.item_workload, llWorkloadContainer, false);
                        
                        TextView tvName = view.findViewById(R.id.tvWorkloadOfficerName);
                        TextView tvMetrics = view.findViewById(R.id.tvWorkloadMetrics);

                        tvName.setText(wl.getOfficerName() + " (" + wl.getStation() + ")");
                        tvMetrics.setText("Total Assigned: " + wl.getTotalCases() + " | Pending/Active: " + wl.getPendingCases() + " | Closed: " + wl.getClosedCases());

                        llWorkloadContainer.addView(view);
                    }

                } else {
                    Toast.makeText(SupervisoryWorkloadActivity.this, "Failed to load mapping", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<WorkloadResponse> call, Throwable t) {
                llWorkloadContainer.removeAllViews();
                Toast.makeText(SupervisoryWorkloadActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }
}

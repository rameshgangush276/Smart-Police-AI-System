package com.smartpolice.app.ui.complaint;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.smartpolice.app.R;
import com.smartpolice.app.api.ApiService;
import com.smartpolice.app.api.RetrofitClient;
import com.smartpolice.app.models.ComplaintResponse;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ComplaintListActivity extends AppCompatActivity {

    private ListView listViewComplaints;
    private Spinner spinnerStatusFilter;
    private ComplaintAdapter adapter;
    private List<ComplaintResponse.Complaint> complaintList = new ArrayList<>();
    private ApiService apiService;
    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_complaint_list);

        token = getIntent().getStringExtra("OFFICER_TOKEN");
        apiService = RetrofitClient.getClient().create(ApiService.class);

        listViewComplaints = findViewById(R.id.listViewComplaints);
        spinnerStatusFilter = findViewById(R.id.spinnerStatusFilter);

        adapter = new ComplaintAdapter(this, complaintList);
        listViewComplaints.setAdapter(adapter);

        listViewComplaints.setOnItemClickListener((parent, view, position, id) -> {
            ComplaintResponse.Complaint complaint = complaintList.get(position);
            Intent intent = new Intent(ComplaintListActivity.this, ComplaintDetailActivity.class);
            intent.putExtra("OFFICER_TOKEN", token);
            intent.putExtra("COMPLAINT_ID", complaint.getComplaintId());
            intent.putExtra("COMPLAINANT_NAME", complaint.getComplainantName());
            intent.putExtra("CRIME_CATEGORY", complaint.getCrimeCategory());
            intent.putExtra("INCIDENT_DATE", complaint.getIncidentDate());
            intent.putExtra("COMPLAINT_DB_ID", complaint.getId());
            startActivity(intent);
        });

        setupFilterSpinner();
    }

    private void setupFilterSpinner() {
        String[] statuses = {"All", "PENDING", "UNDER_REVIEW", "FIR_REGISTERED", "CLOSED"};
        ArrayAdapter<String> spinnerAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, statuses);
        spinnerStatusFilter.setAdapter(spinnerAdapter);

        spinnerStatusFilter.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                String selectedStatus = statuses[position];
                if ("All".equals(selectedStatus)) {
                    fetchComplaints(null);
                } else {
                    fetchComplaints(selectedStatus);
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });
    }

    private void fetchComplaints(String status) {
        String authHeader = "Bearer " + token;
        apiService.getMyComplaints(authHeader, status, null, null, null).enqueue(new Callback<List<ComplaintResponse.Complaint>>() {
            @Override
            public void onResponse(Call<List<ComplaintResponse.Complaint>> call, Response<List<ComplaintResponse.Complaint>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    complaintList.clear();
                    complaintList.addAll(response.body());
                    adapter.notifyDataSetChanged();
                    if(complaintList.isEmpty()) {
                        Toast.makeText(ComplaintListActivity.this, "No complaints found.", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(ComplaintListActivity.this, "Failed to load complaints", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<ComplaintResponse.Complaint>> call, Throwable t) {
                Toast.makeText(ComplaintListActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }
}

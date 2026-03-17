package com.smartpolice.app.ui.complaint;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
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

public class ComplaintSearchActivity extends AppCompatActivity {

    private EditText etSearchId, etSearchName, etSearchMobile, etSearchCrimeType, etSearchLocation, etSearchStartDate, etSearchEndDate;
    private Button btnSearch;
    private ListView listViewSearchResults;
    
    private ComplaintAdapter adapter;
    private List<ComplaintResponse.Complaint> complaintList = new ArrayList<>();
    private ApiService apiService;
    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_complaint_search);

        token = getIntent().getStringExtra("OFFICER_TOKEN");
        apiService = RetrofitClient.getClient().create(ApiService.class);

        etSearchId = findViewById(R.id.etSearchId);
        etSearchName = findViewById(R.id.etSearchName);
        etSearchMobile = findViewById(R.id.etSearchMobile);
        etSearchCrimeType = findViewById(R.id.etSearchCrimeType);
        etSearchLocation = findViewById(R.id.etSearchLocation);
        etSearchStartDate = findViewById(R.id.etSearchStartDate);
        etSearchEndDate = findViewById(R.id.etSearchEndDate);
        
        btnSearch = findViewById(R.id.btnSearch);
        listViewSearchResults = findViewById(R.id.listViewSearchResults);

        adapter = new ComplaintAdapter(this, complaintList);
        listViewSearchResults.setAdapter(adapter);

        listViewSearchResults.setOnItemClickListener((parent, view, position, id) -> {
            ComplaintResponse.Complaint complaint = complaintList.get(position);
            Intent intent = new Intent(ComplaintSearchActivity.this, ComplaintDetailActivity.class);
            intent.putExtra("OFFICER_TOKEN", token);
            intent.putExtra("COMPLAINT_ID", complaint.getComplaintId());
            intent.putExtra("COMPLAINANT_NAME", complaint.getComplainantName());
            intent.putExtra("CRIME_CATEGORY", complaint.getCrimeCategory());
            intent.putExtra("INCIDENT_DATE", complaint.getIncidentDate());
            intent.putExtra("COMPLAINT_DB_ID", complaint.getId());
            startActivity(intent);
        });

        btnSearch.setOnClickListener(v -> performSearch());

        // Live Fuzzy Search on Name
        etSearchName.addTextChangedListener(new TextWatcher() {
            private final long DELAY = 600; // debounce delay
            private Handler handler = new Handler(Looper.getMainLooper());
            private Runnable runnable;

            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if (runnable != null) {
                    handler.removeCallbacks(runnable);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {
                runnable = () -> {
                    // Only auto-search if not empty to avoid spamming
                    if(s.length() > 0) {
                        performSearch();
                    }
                };
                handler.postDelayed(runnable, DELAY);
            }
        });
    }

    private void performSearch() {
        String idInfo = etSearchId.getText().toString().trim();
        String nameStr = etSearchName.getText().toString().trim();
        String mobileStr = etSearchMobile.getText().toString().trim();
        String typeStr = etSearchCrimeType.getText().toString().trim();
        String locStr = etSearchLocation.getText().toString().trim();
        String startStr = etSearchStartDate.getText().toString().trim();
        String endStr = etSearchEndDate.getText().toString().trim();

        String qParam = null;
        String idParam = idInfo.isEmpty() ? null : idInfo;
        String nameParam = nameStr.isEmpty() ? null : nameStr;
        String mobileParam = mobileStr.isEmpty() ? null : mobileStr;
        String typeParam = typeStr.isEmpty() ? null : typeStr;
        String locParam = locStr.isEmpty() ? null : locStr;
        String startParam = startStr.isEmpty() ? null : startStr;
        String endParam = endStr.isEmpty() ? null : endStr;

        String authHeader = "Bearer " + token;

        btnSearch.setEnabled(false);
        Toast.makeText(this, "Searching...", Toast.LENGTH_SHORT).show();

        apiService.searchComplaints(authHeader, qParam, idParam, nameParam, mobileParam, typeParam, startParam, endParam, locParam).enqueue(new Callback<List<ComplaintResponse.Complaint>>() {
            @Override
            public void onResponse(Call<List<ComplaintResponse.Complaint>> call, Response<List<ComplaintResponse.Complaint>> response) {
                btnSearch.setEnabled(true);
                if (response.isSuccessful() && response.body() != null) {
                    complaintList.clear();
                    complaintList.addAll(response.body());
                    adapter.notifyDataSetChanged();
                    if(complaintList.isEmpty()) {
                        Toast.makeText(ComplaintSearchActivity.this, "No matching complaints found.", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(ComplaintSearchActivity.this, "Failed to load results", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<ComplaintResponse.Complaint>> call, Throwable t) {
                btnSearch.setEnabled(true);
                Toast.makeText(ComplaintSearchActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }
}

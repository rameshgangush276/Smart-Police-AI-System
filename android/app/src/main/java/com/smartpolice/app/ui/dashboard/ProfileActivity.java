package com.smartpolice.app.ui.dashboard;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.smartpolice.app.R;
import com.smartpolice.app.api.ApiService;
import com.smartpolice.app.api.RetrofitClient;
import com.smartpolice.app.models.ProfileResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileActivity extends AppCompatActivity {

    private TextView tvProfileName, tvProfileId;
    private EditText etDesignation, etAadhaar;
    private ImageView ivSignature;
    private Button btnUpdateProfile;

    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        token = getIntent().getStringExtra("OFFICER_TOKEN");

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        tvProfileName = findViewById(R.id.tvProfileName);
        tvProfileId = findViewById(R.id.tvProfileId);
        etDesignation = findViewById(R.id.etDesignation);
        etAadhaar = findViewById(R.id.etAadhaar);
        ivSignature = findViewById(R.id.ivSignature);
        btnUpdateProfile = findViewById(R.id.btnUpdateProfile);

        loadProfile();

        btnUpdateProfile.setOnClickListener(v -> updateProfile());
    }

    private void loadProfile() {
        ApiService apiService = RetrofitClient.getRetrofitInstance().create(ApiService.class);
        apiService.getProfile("Bearer " + token).enqueue(new Callback<ProfileResponse>() {
            @Override
            public void onResponse(Call<ProfileResponse> call, Response<ProfileResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ProfileResponse.Officer officer = response.body().getOfficer();
                    tvProfileName.setText(officer.getName());
                    tvProfileId.setText("ID: " + officer.getOfficerId());
                    etDesignation.setText(officer.getDesignation());
                    etAadhaar.setText(officer.getAadhaarNumber());
                    
                    if (officer.getSignatureImage() != null) {
                        ivSignature.setImageResource(android.R.drawable.checkbox_on_background);
                    }
                }
            }

            @Override
            public void onFailure(Call<ProfileResponse> call, Throwable t) {
                Toast.makeText(ProfileActivity.this, "Failed to load profile", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateProfile() {
        String designation = etDesignation.getText().toString();
        String aadhaar = etAadhaar.getText().toString();

        ApiService apiService = RetrofitClient.getRetrofitInstance().create(ApiService.class);
        
        com.smartpolice.app.models.ProfileUpdateRequest updateData = 
            new com.smartpolice.app.models.ProfileUpdateRequest(designation, aadhaar, "/uploads/signatures/officer_sign.png");
        
        btnUpdateProfile.setEnabled(false);
        apiService.updateProfile("Bearer " + token, updateData).enqueue(new Callback<ProfileResponse>() {
            @Override
            public void onResponse(Call<ProfileResponse> call, Response<ProfileResponse> response) {
                btnUpdateProfile.setEnabled(true);
                if (response.isSuccessful()) {
                    Toast.makeText(ProfileActivity.this, "Profile Updated Successfully!", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(ProfileActivity.this, "Update Failed: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ProfileResponse> call, Throwable t) {
                btnUpdateProfile.setEnabled(true);
                Toast.makeText(ProfileActivity.this, "Update Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}

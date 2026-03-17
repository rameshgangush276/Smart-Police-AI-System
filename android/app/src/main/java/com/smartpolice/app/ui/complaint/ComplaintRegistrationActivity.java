package com.smartpolice.app.ui.complaint;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.view.inputmethod.InputMethodManager;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.smartpolice.app.R;
import com.smartpolice.app.api.ApiService;
import com.smartpolice.app.api.RetrofitClient;
import com.smartpolice.app.models.AiRecommendationRequest;
import com.smartpolice.app.models.AiRecommendationResponse;
import com.smartpolice.app.models.ComplaintRequest;
import com.smartpolice.app.models.ComplaintResponse;

import java.util.ArrayList;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ComplaintRegistrationActivity extends AppCompatActivity {

    private EditText etComplainantName, etMobile, etAddress, etIncidentDate, etCrimeCategory, etIncidentLocation, etDescription, etWitnessDetails;
    private Spinner spinnerGender;
    private Button btnSubmitComplaint, btnVoiceInput, btnGetLocation, btnAiSuggestions;
    private TextView tvAiSuggestions;
    private CustomKeypad customKeypad;
    private ApiService apiService;
    private String token;
    
    private Double currentLat = null;
    private Double currentLon = null;
    
    private static final int SPEECH_REQUEST_CODE = 100;
    private static final int LOCATION_PERMISSION_CODE = 200;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_complaint_registration);

        token = getIntent().getStringExtra("OFFICER_TOKEN");
        apiService = RetrofitClient.getClient().create(ApiService.class);

        etComplainantName = findViewById(R.id.etComplainantName);
        etMobile = findViewById(R.id.etMobile);
        spinnerGender = findViewById(R.id.spinnerGender);
        etAddress = findViewById(R.id.etAddress);
        etIncidentDate = findViewById(R.id.etIncidentDate);
        etCrimeCategory = findViewById(R.id.etCrimeCategory);
        etIncidentLocation = findViewById(R.id.etIncidentLocation);
        etDescription = findViewById(R.id.etDescription);
        etWitnessDetails = findViewById(R.id.etWitnessDetails);
        btnSubmitComplaint = findViewById(R.id.btnSubmitComplaint);
        btnVoiceInput = findViewById(R.id.btnVoiceInput);
        btnGetLocation = findViewById(R.id.btnGetLocation);
        btnAiSuggestions = findViewById(R.id.btnAiSuggestions);
        tvAiSuggestions = findViewById(R.id.tvAiSuggestions);
        customKeypad = findViewById(R.id.customKeypad);

        setupGenderSpinner();
        setupCustomKeypad();

        btnVoiceInput.setOnClickListener(v -> startVoiceRecording());
        btnGetLocation.setOnClickListener(v -> fetchLocation());
        btnSubmitComplaint.setOnClickListener(v -> submitComplaint());
        btnAiSuggestions.setOnClickListener(v -> fetchAiSuggestions());
    }

    private void setupCustomKeypad() {
        View.OnFocusChangeListener focusChangeListener = (v, hasFocus) -> {
            if (hasFocus) {
                // Hide system keyboard
                InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                imm.hideSoftInputFromWindow(v.getWindowToken(), 0);
                
                // Show custom keypad
                customKeypad.setVisibility(View.VISIBLE);
                InputConnection ic = ((EditText) v).onCreateInputConnection(new EditorInfo());
                customKeypad.setInputConnection(ic);
            } else {
                // Check if any other EditText has focus before hiding
                if (!etComplainantName.hasFocus() && !etMobile.hasFocus() && !etAddress.hasFocus() 
                    && !etIncidentDate.hasFocus() && !etCrimeCategory.hasFocus() 
                    && !etIncidentLocation.hasFocus() && !etDescription.hasFocus() 
                    && !etWitnessDetails.hasFocus()) {
                    customKeypad.setVisibility(View.GONE);
                }
            }
        };

        etComplainantName.setOnFocusChangeListener(focusChangeListener);
        etMobile.setOnFocusChangeListener(focusChangeListener);
        etAddress.setOnFocusChangeListener(focusChangeListener);
        etIncidentDate.setOnFocusChangeListener(focusChangeListener);
        etCrimeCategory.setOnFocusChangeListener(focusChangeListener);
        etIncidentLocation.setOnFocusChangeListener(focusChangeListener);
        etDescription.setOnFocusChangeListener(focusChangeListener);
        etWitnessDetails.setOnFocusChangeListener(focusChangeListener);
        
        // Prevent system keyboard from showing on click
        View.OnClickListener clickListener = v -> {
            customKeypad.setVisibility(View.VISIBLE);
            InputConnection ic = ((EditText) v).onCreateInputConnection(new EditorInfo());
            customKeypad.setInputConnection(ic);
            InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(v.getWindowToken(), 0);
        };
        
        etComplainantName.setOnClickListener(clickListener);
        etMobile.setOnClickListener(clickListener);
        // ... add for others if needed
    }

    private void setupGenderSpinner() {
        String[] genders = {"Select Gender", "Male", "Female", "Other"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, genders);
        spinnerGender.setAdapter(adapter);
    }

    private void startVoiceRecording() {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault());
        try {
            startActivityForResult(intent, SPEECH_REQUEST_CODE);
        } catch (Exception e) {
            Toast.makeText(this, "Voice input not supported", Toast.LENGTH_SHORT).show();
        }
    }

    private void fetchLocation() {
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.ACCESS_FINE_LOCATION}, LOCATION_PERMISSION_CODE);
        } else {
            LocationManager locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
            if (locationManager != null) {
                Location loc = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                if (loc == null) loc = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                if (loc != null) {
                    currentLat = loc.getLatitude();
                    currentLon = loc.getLongitude();
                    etIncidentLocation.setText(currentLat + ", " + currentLon);
                    Toast.makeText(this, "Location Fetched!", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(this, "Enable GPS and try again", Toast.LENGTH_SHORT).show();
                }
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == SPEECH_REQUEST_CODE && resultCode == RESULT_OK && data != null) {
            ArrayList<String> result = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (result != null && !result.isEmpty()) {
                String existing = etDescription.getText().toString();
                etDescription.setText(existing + " " + result.get(0));
            }
        }
    }

    private void fetchAiSuggestions() {
        String description = etDescription.getText().toString().trim();
        if (description.isEmpty()) {
            Toast.makeText(this, "Please enter an incident description first", Toast.LENGTH_SHORT).show();
            return;
        }

        btnAiSuggestions.setEnabled(false);
        btnAiSuggestions.setText("ANALYZING...");
        tvAiSuggestions.setVisibility(View.GONE);

        String authHeader = "Bearer " + token;
        AiRecommendationRequest request = new AiRecommendationRequest(description);

        apiService.suggestSections(authHeader, request).enqueue(new Callback<AiRecommendationResponse>() {
            @Override
            public void onResponse(Call<AiRecommendationResponse> call, Response<AiRecommendationResponse> response) {
                btnAiSuggestions.setEnabled(true);
                btnAiSuggestions.setText("GET AI LEGAL SUGGESTIONS");
                if (response.isSuccessful() && response.body() != null) {
                    tvAiSuggestions.setVisibility(View.VISIBLE);
                    StringBuilder sb = new StringBuilder("Suggested Legal Sections:\n\n");
                    for (String section : response.body().getSuggestions()) {
                        sb.append("• ").append(section).append("\n");
                    }
                    tvAiSuggestions.setText(sb.toString().trim());
                } else {
                    Toast.makeText(ComplaintRegistrationActivity.this, "Failed to get suggestions", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<AiRecommendationResponse> call, Throwable t) {
                btnAiSuggestions.setEnabled(true);
                btnAiSuggestions.setText("GET AI LEGAL SUGGESTIONS");
                Toast.makeText(ComplaintRegistrationActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void submitComplaint() {
        String name = etComplainantName.getText().toString().trim();
        String mobile = etMobile.getText().toString().trim();
        String gender = spinnerGender.getSelectedItem().toString();
        if (gender.equals("Select Gender")) gender = "";
        String address = etAddress.getText().toString().trim();
        String date = etIncidentDate.getText().toString().trim();
        String category = etCrimeCategory.getText().toString().trim();
        String location = etIncidentLocation.getText().toString().trim();
        String description = etDescription.getText().toString().trim();
        String witness = etWitnessDetails.getText().toString().trim();

        if (name.isEmpty() || description.isEmpty() || mobile.isEmpty()) {
            Toast.makeText(this, "Name, Mobile, and Description are required", Toast.LENGTH_SHORT).show();
            return;
        }

        btnSubmitComplaint.setEnabled(false);

        ComplaintRequest request = new ComplaintRequest(
                name, "", mobile, gender, address, date, "", location, currentLat, currentLon, category, description, "", witness
        );

        String authHeader = "Bearer " + token;

        apiService.registerComplaint(authHeader, request).enqueue(new Callback<ComplaintResponse>() {
            @Override
            public void onResponse(Call<ComplaintResponse> call, Response<ComplaintResponse> response) {
                btnSubmitComplaint.setEnabled(true);
                if (response.isSuccessful() && response.body() != null) {
                    try {
                        String id = response.body().getComplaint().getComplaintId();
                        Toast.makeText(ComplaintRegistrationActivity.this, "Success! ID: " + id, Toast.LENGTH_LONG).show();
                        
                        // Delay finish so the toast can be seen
                        new android.os.Handler().postDelayed(() -> finish(), 2000);
                    } catch (Exception e) {
                        Toast.makeText(ComplaintRegistrationActivity.this, "Complaint Registered", Toast.LENGTH_SHORT).show();
                        finish();
                    }
                } else {
                    Toast.makeText(ComplaintRegistrationActivity.this, "Failed to register complaint", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ComplaintResponse> call, Throwable t) {
                btnSubmitComplaint.setEnabled(true);
                Toast.makeText(ComplaintRegistrationActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }
}

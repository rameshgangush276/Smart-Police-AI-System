package com.smartpolice.app.ui.complaint;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.smartpolice.app.R;
import com.smartpolice.app.api.RetrofitClient;
import com.smartpolice.app.api.ApiService;
import com.smartpolice.app.models.DocumentGenerateRequest;
import com.smartpolice.app.models.DocumentResponse;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DocumentGeneratorActivity extends AppCompatActivity {

    private TextView tvDocCaseId, tvCaseCategory, tvPlaceholder;
    private Spinner spinnerDocType;
    private Button btnGenerateDoc, btnDownload, btnShare, btnInternalSign, btnAadhaarSign;
    private WebView webViewPreview;
    private ProgressBar progressBar;
    private LinearLayout layoutActions;

    private String complaintDbId, complaintId, category, token;
    private String currentFileId, currentFileUrl;

    private final String[] docTypes = {
            "NOTICE", "ARREST_MEMO", "SEIZURE_MEMO",
            "WITNESS_STATEMENT", "SEARCH_MEMO", "CASE_DIARY", "FINAL_REPORT"
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_document_generator);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        // Init views
        tvDocCaseId = findViewById(R.id.tvDocCaseId);
        tvCaseCategory = findViewById(R.id.tvCaseCategory);
        tvPlaceholder = findViewById(R.id.tvPlaceholder);
        spinnerDocType = findViewById(R.id.spinnerDocType);
        btnGenerateDoc = findViewById(R.id.btnGenerateDoc);
        btnDownload = findViewById(R.id.btnDownload);
        btnShare = findViewById(R.id.btnShare);
        btnInternalSign = findViewById(R.id.btnInternalSign);
        btnAadhaarSign = findViewById(R.id.btnAadhaarSign);
        webViewPreview = findViewById(R.id.webViewPreview);
        progressBar = findViewById(R.id.progressBar);
        layoutActions = findViewById(R.id.layoutActions);

        // Get extras
        token = getIntent().getStringExtra("OFFICER_TOKEN");
        complaintDbId = getIntent().getStringExtra("COMPLAINT_DB_ID");
        complaintId = getIntent().getStringExtra("COMPLAINT_ID");
        category = getIntent().getStringExtra("COMPLAINT_CATEGORY");

        tvDocCaseId.setText("Case ID: " + complaintId);
        tvCaseCategory.setText("Category: " + (category != null ? category : "General"));

        // Setup Spinner
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_item, docTypes);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerDocType.setAdapter(adapter);

        // Setup WebView
        WebSettings settings = webViewPreview.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setDomStorageEnabled(true);
        webViewPreview.setWebViewClient(new WebViewClient());

        btnGenerateDoc.setOnClickListener(v -> generateDocument());

        btnDownload.setOnClickListener(v -> {
            if (currentFileUrl != null) {
                String fullUrl = RetrofitClient.BASE_URL + currentFileUrl;
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(fullUrl));
                startActivity(intent);
            }
        });

        btnShare.setOnClickListener(v -> {
            if (currentFileUrl != null) {
                Intent sendIntent = new Intent();
                sendIntent.setAction(Intent.ACTION_SEND);
                sendIntent.putExtra(Intent.EXTRA_TEXT, "Police Investigation Document: " + RetrofitClient.BASE_URL + currentFileUrl);
                sendIntent.setType("text/plain");
                startActivity(Intent.createChooser(sendIntent, "Share Document Link"));
            }
        });

        btnInternalSign.setOnClickListener(v -> showInternalSignDialog());
        btnAadhaarSign.setOnClickListener(v -> showAadhaarDialog());
    }

    private void showInternalSignDialog() {
        android.widget.EditText etPassword = new android.widget.EditText(this);
        etPassword.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);
        etPassword.setHint("Enter officer password");

        new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Internal Digital Signature")
                .setMessage("Enter your password to verify identity and apply saved signature image.")
                .setView(etPassword)
                .setPositiveButton("Sign", (dialog, which) -> {
                    String password = etPassword.getText().toString();
                    if (!password.isEmpty()) performInternalSign(password);
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void performInternalSign(String password) {
        progressBar.setVisibility(View.VISIBLE);
        ApiService apiService = RetrofitClient.getRetrofitInstance().create(ApiService.class);
        com.smartpolice.app.models.InternalSignRequest request = new com.smartpolice.app.models.InternalSignRequest(currentFileId, password);

        apiService.internalSign("Bearer " + token, request).enqueue(new Callback<com.smartpolice.app.models.GenericResponse>() {
            @Override
            public void onResponse(Call<com.smartpolice.app.models.GenericResponse> call, Response<com.smartpolice.app.models.GenericResponse> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful()) {
                    Toast.makeText(DocumentGeneratorActivity.this, "Document Signed Internally!", Toast.LENGTH_SHORT).show();
                    showPreview(currentFileUrl); // Refresh preview
                } else {
                    Toast.makeText(DocumentGeneratorActivity.this, "Signing Failed: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<com.smartpolice.app.models.GenericResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(DocumentGeneratorActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showAadhaarDialog() {
        android.widget.EditText etAadhaar = new android.widget.EditText(this);
        etAadhaar.setHint("Enter 12-digit Aadhaar Number");
        etAadhaar.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);

        new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Aadhaar e-Sign")
                .setMessage("Submit your Aadhaar number to initiate OTP verification.")
                .setView(etAadhaar)
                .setPositiveButton("Send OTP", (dialog, which) -> {
                    String aadhaar = etAadhaar.getText().toString();
                    if (aadhaar.length() == 12) initiateAadhaarSign(aadhaar);
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void initiateAadhaarSign(String aadhaar) {
        progressBar.setVisibility(View.VISIBLE);
        ApiService apiService = RetrofitClient.getRetrofitInstance().create(ApiService.class);
        com.smartpolice.app.models.AadhaarSignRequest request = new com.smartpolice.app.models.AadhaarSignRequest(currentFileId, aadhaar);

        apiService.initiateAadhaarSign("Bearer " + token, request).enqueue(new Callback<com.smartpolice.app.models.GenericResponse>() {
            @Override
            public void onResponse(Call<com.smartpolice.app.models.GenericResponse> call, Response<com.smartpolice.app.models.GenericResponse> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    showOTPDialog(response.body().getTransactionId());
                } else {
                    Toast.makeText(DocumentGeneratorActivity.this, "Aadhaar Failed", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<com.smartpolice.app.models.GenericResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
            }
        });
    }

    private void showOTPDialog(String txId) {
        android.widget.EditText etOtp = new android.widget.EditText(this);
        etOtp.setHint("Enter 6-digit OTP (123456)");
        etOtp.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);

        new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Verify OTP")
                .setMessage("Enter the OTP sent to your registered mobile number.")
                .setView(etOtp)
                .setPositiveButton("Verify & Sign", (dialog, which) -> {
                    String otp = etOtp.getText().toString();
                    verifyOTP(otp, txId);
                })
                .show();
    }

    private void verifyOTP(String otp, String txId) {
        progressBar.setVisibility(View.VISIBLE);
        ApiService apiService = RetrofitClient.getRetrofitInstance().create(ApiService.class);
        com.smartpolice.app.models.AadhaarSignRequest request = new com.smartpolice.app.models.AadhaarSignRequest(currentFileId, otp, txId);

        apiService.verifyAadhaarOTP("Bearer " + token, request).enqueue(new Callback<com.smartpolice.app.models.GenericResponse>() {
            @Override
            public void onResponse(Call<com.smartpolice.app.models.GenericResponse> call, Response<com.smartpolice.app.models.GenericResponse> response) {
                progressBar.setVisibility(View.GONE);
                if (response.isSuccessful()) {
                    Toast.makeText(DocumentGeneratorActivity.this, "Aadhaar e-Sign Completed!", Toast.LENGTH_SHORT).show();
                    showPreview(currentFileUrl);
                } else {
                    Toast.makeText(DocumentGeneratorActivity.this, "OTP Verification Failed", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<com.smartpolice.app.models.GenericResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
            }
        });
    }

    private void generateDocument() {
        String selectedType = spinnerDocType.getSelectedItem().toString();

        progressBar.setVisibility(View.VISIBLE);
        btnGenerateDoc.setEnabled(false);
        tvPlaceholder.setVisibility(View.GONE);
        webViewPreview.setVisibility(View.GONE);
        layoutActions.setVisibility(View.GONE);

        ApiService apiService = RetrofitClient.getRetrofitInstance().create(ApiService.class);

        // Mock additional data for now, in a real app these would be inputs
        Map<String, String> additionalData = new HashMap<>();
        additionalData.put("accusedName", "Suspect Name");
        additionalData.put("seizedItems", "Electronic devices, Cash, Documents");
        additionalData.put("witnessName", "John Doe");
        additionalData.put("statement", "I saw the incident happen near the main gate.");

        com.smartpolice.app.models.DocumentGenerateRequest request = new com.smartpolice.app.models.DocumentGenerateRequest(complaintDbId, selectedType, additionalData);
        Call<DocumentResponse> call = apiService.generateNewDocument("Bearer " + token, request);

        call.enqueue(new Callback<DocumentResponse>() {
            @Override
            public void onResponse(Call<DocumentResponse> call, Response<DocumentResponse> response) {
                progressBar.setVisibility(View.GONE);
                btnGenerateDoc.setEnabled(true);

                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    DocumentResponse.Document doc = response.body().getDocument();
                    currentFileId = doc.getId();
                    currentFileUrl = doc.getFileUrl();
                    showPreview(currentFileUrl);
                    layoutActions.setVisibility(View.VISIBLE);
                    Toast.makeText(DocumentGeneratorActivity.this, "Document Generated Successfully", Toast.LENGTH_SHORT).show();
                } else {
                    tvPlaceholder.setVisibility(View.VISIBLE);
                    tvPlaceholder.setText("Failed to generate document.");
                    Toast.makeText(DocumentGeneratorActivity.this, "Error: " + response.code(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<DocumentResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnGenerateDoc.setEnabled(true);
                tvPlaceholder.setVisibility(View.VISIBLE);
                tvPlaceholder.setText("Network Error: " + t.getMessage());
            }
        });
    }

    private void showPreview(String url) {
        webViewPreview.setVisibility(View.VISIBLE);
        // Using Google Docs Viewer to preview PDF inside WebView
        String docUrl = RetrofitClient.BASE_URL + url;
        String viewerUrl = "https://docs.google.com/gview?embedded=true&url=" + docUrl;
        webViewPreview.loadUrl(viewerUrl);
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}

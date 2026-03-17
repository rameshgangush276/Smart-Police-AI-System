package com.smartpolice.app.ui.legal;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.cardview.widget.CardView;

import com.smartpolice.app.R;
import com.smartpolice.app.api.RetrofitClient;
import com.smartpolice.app.api.ApiService;
import com.smartpolice.app.models.LegalDraftRequest;
import com.smartpolice.app.models.LegalDraftResponse;
import com.smartpolice.app.models.LegalSection;
import com.smartpolice.app.models.LegalSectionResponse;
import com.smartpolice.app.models.LegalSuggestRequest;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LegalAssistanceActivity extends AppCompatActivity {

    private EditText etCaseDescription;
    private Button btnSuggest;
    private LinearLayout containerSuggestions;
    private TextView tvSuggestionsTitle;
    private ProgressBar progressBar;

    private CardView cardDrafting;
    private Spinner spinnerDraftType;
    private EditText etOfficerInputs;
    private Button btnGenerateDraft;

    private ApiService apiService;
    private String currentCaseId;
    private String crimeCategory;
    private String token;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_legal_assistance);

        currentCaseId = getIntent().getStringExtra("COMPLAINT_DB_ID");
        crimeCategory = getIntent().getStringExtra("CRIME_CATEGORY");
        token = "Bearer " + getIntent().getStringExtra("OFFICER_TOKEN");

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Legal Help: " + getIntent().getStringExtra("COMPLAINT_ID"));
        }

        etCaseDescription = findViewById(R.id.etCaseDescription);
        btnSuggest = findViewById(R.id.btnSuggest);
        containerSuggestions = findViewById(R.id.containerSuggestions);
        tvSuggestionsTitle = findViewById(R.id.tvSuggestionsTitle);
        progressBar = findViewById(R.id.progressBar);

        cardDrafting = findViewById(R.id.cardDrafting);
        spinnerDraftType = findViewById(R.id.spinnerDraftType);
        etOfficerInputs = findViewById(R.id.etOfficerInputs);
        btnGenerateDraft = findViewById(R.id.btnGenerateDraft);

        apiService = RetrofitClient.getRetrofitInstance().create(ApiService.class);

        setupDraftSpinner();

        btnSuggest.setOnClickListener(v -> getLegalSuggestions());
        btnGenerateDraft.setOnClickListener(v -> generateLegalDraft());
    }

    private void setupDraftSpinner() {
        String[] types = {"HIGH_COURT_REPLY", "STATUS_REPORT", "LEGAL_OPINION", "COURT_SUMMARY"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, types);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerDraftType.setAdapter(adapter);
    }

    private void getLegalSuggestions() {
        String description = etCaseDescription.getText().toString().trim();
        if (description.isEmpty()) {
            Toast.makeText(this, "Please enter case description", Toast.LENGTH_SHORT).show();
            return;
        }

        progressBar.setVisibility(View.VISIBLE);
        btnSuggest.setEnabled(false);
        containerSuggestions.removeAllViews();

        LegalSuggestRequest request = new LegalSuggestRequest(description, crimeCategory != null ? crimeCategory : "");
        apiService.suggestLegalSections(token, request).enqueue(new Callback<LegalSectionResponse>() {
            @Override
            public void onResponse(Call<LegalSectionResponse> call, Response<LegalSectionResponse> response) {
                progressBar.setVisibility(View.GONE);
                btnSuggest.setEnabled(true);

                if (response.isSuccessful() && response.body() != null) {
                    displaySuggestions(response.body().getSuggestedSections());
                    tvSuggestionsTitle.setVisibility(View.VISIBLE);
                    cardDrafting.setVisibility(View.VISIBLE);
                } else {
                    Toast.makeText(LegalAssistanceActivity.this, "Analysis failed", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<LegalSectionResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnSuggest.setEnabled(true);
                Toast.makeText(LegalAssistanceActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void displaySuggestions(List<LegalSection> sections) {
        if (sections == null || sections.isEmpty()) {
            TextView empty = new TextView(this);
            empty.setText("No specific sections identified. Please consult legal cell.");
            containerSuggestions.addView(empty);
            return;
        }

        LayoutInflater inflater = LayoutInflater.from(this);
        for (LegalSection section : sections) {
            View view = inflater.inflate(R.layout.item_legal_suggestion, containerSuggestions, false);
            TextView title = view.findViewById(R.id.tvSectionTitle);
            TextView desc = view.findViewById(R.id.tvSectionDesc);
            TextView confidence = view.findViewById(R.id.tvConfidence);

            title.setText(section.getTitle());
            desc.setText(section.getDescription());
            confidence.setText((int)(section.getConfidence() * 100) + "%");

            containerSuggestions.addView(view);
        }
    }

    private void generateLegalDraft() {
        String type = spinnerDraftType.getSelectedItem().toString();
        String inputs = etOfficerInputs.getText().toString().trim();

        progressBar.setVisibility(View.VISIBLE);
        btnGenerateDraft.setEnabled(false);

        LegalDraftRequest request = new LegalDraftRequest(currentCaseId, type, inputs);
        apiService.generateLegalDraft(token, request).enqueue(new Callback<LegalDraftResponse>() {
            @Override
            public void onResponse(Call<LegalDraftResponse> call, Response<LegalDraftResponse> response) {
                progressBar.setVisibility(View.GONE);
                btnGenerateDraft.setEnabled(true);

                if (response.isSuccessful() && response.body() != null) {
                    Toast.makeText(LegalAssistanceActivity.this, "Draft Generated!", Toast.LENGTH_SHORT).show();
                    String url = RetrofitClient.BASE_URL + response.body().getFileUrl();
                    Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(browserIntent);
                } else {
                    Toast.makeText(LegalAssistanceActivity.this, "Generation failed", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<LegalDraftResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnGenerateDraft.setEnabled(true);
                Toast.makeText(LegalAssistanceActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}

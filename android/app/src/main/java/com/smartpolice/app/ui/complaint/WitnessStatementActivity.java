package com.smartpolice.app.ui.complaint;

import android.content.Intent;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.smartpolice.app.R;
import com.smartpolice.app.api.ApiService;
import com.smartpolice.app.api.RetrofitClient;
import com.smartpolice.app.models.WitnessStatementRequest;
import com.smartpolice.app.models.WitnessStatementResponse;

import java.util.ArrayList;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class WitnessStatementActivity extends AppCompatActivity {

    private TextView tvWitnessCaseId;
    private EditText etWitnessName, etWitnessMobile, etWitnessStatement;
    private Button btnWitnessVoice, btnSubmitStatement;
    
    private ApiService apiService;
    private String token;
    private String complaintDbId;
    
    private static final int SPEECH_REQUEST_CODE = 101;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_witness_statement);

        tvWitnessCaseId = findViewById(R.id.tvWitnessCaseId);
        etWitnessName = findViewById(R.id.etWitnessName);
        etWitnessMobile = findViewById(R.id.etWitnessMobile);
        etWitnessStatement = findViewById(R.id.etWitnessStatement);
        btnWitnessVoice = findViewById(R.id.btnWitnessVoice);
        btnSubmitStatement = findViewById(R.id.btnSubmitStatement);

        token = getIntent().getStringExtra("OFFICER_TOKEN");
        complaintDbId = getIntent().getStringExtra("COMPLAINT_DB_ID");
        String displayId = getIntent().getStringExtra("COMPLAINT_ID");

        tvWitnessCaseId.setText("Case ID: " + displayId);

        apiService = RetrofitClient.getClient().create(ApiService.class);

        btnWitnessVoice.setOnClickListener(v -> startVoiceRecording());
        btnSubmitStatement.setOnClickListener(v -> submitStatement());
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

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == SPEECH_REQUEST_CODE && resultCode == RESULT_OK && data != null) {
            ArrayList<String> result = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (result != null && !result.isEmpty()) {
                String existing = etWitnessStatement.getText().toString();
                etWitnessStatement.setText(existing + " " + result.get(0));
            }
        }
    }

    private void submitStatement() {
        String name = etWitnessName.getText().toString().trim();
        String mobile = etWitnessMobile.getText().toString().trim();
        String statementText = etWitnessStatement.getText().toString().trim();

        if (name.isEmpty() || statementText.isEmpty()) {
            Toast.makeText(this, "Name and statement are required", Toast.LENGTH_SHORT).show();
            return;
        }

        btnSubmitStatement.setEnabled(false);
        btnSubmitStatement.setText("SAVING...");

        String authHeader = "Bearer " + token;
        WitnessStatementRequest request = new WitnessStatementRequest(name, mobile, statementText);

        apiService.addWitnessStatement(authHeader, complaintDbId, request).enqueue(new Callback<WitnessStatementResponse>() {
            @Override
            public void onResponse(Call<WitnessStatementResponse> call, Response<WitnessStatementResponse> response) {
                btnSubmitStatement.setEnabled(true);
                btnSubmitStatement.setText("SAVE STATEMENT");
                
                if (response.isSuccessful()) {
                    Toast.makeText(WitnessStatementActivity.this, "Statement recorded successfully", Toast.LENGTH_SHORT).show();
                    finish(); // Go back to hub
                } else {
                    Toast.makeText(WitnessStatementActivity.this, "Failed to record statement", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<WitnessStatementResponse> call, Throwable t) {
                btnSubmitStatement.setEnabled(true);
                btnSubmitStatement.setText("SAVE STATEMENT");
                Toast.makeText(WitnessStatementActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }
}

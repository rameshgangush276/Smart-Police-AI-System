package com.smartpolice.app.ui.evidence;

import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.smartpolice.app.R;
import com.smartpolice.app.api.ApiService;
import com.smartpolice.app.api.RetrofitClient;
import com.smartpolice.app.models.EvidenceResponse;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class EvidenceUploadActivity extends AppCompatActivity {

    private EditText etComplaintId, etDescription;
    private Button btnSelectFile, btnUpload;
    private TextView tvSelectedFile;
    private ProgressBar progressBar;
    
    private ApiService apiService;
    private String token;
    private File realFileToUpload = null;
    private static final int PICK_FILE_REQUEST = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_evidence_upload);

        token = getIntent().getStringExtra("OFFICER_TOKEN");
        apiService = RetrofitClient.getClient().create(ApiService.class);

        etComplaintId = findViewById(R.id.etComplaintId);
        etDescription = findViewById(R.id.etDescription);
        btnSelectFile = findViewById(R.id.btnSelectFile);
        btnUpload = findViewById(R.id.btnUpload);
        tvSelectedFile = findViewById(R.id.tvSelectedFile);
        progressBar = findViewById(R.id.progressBar);

        btnSelectFile.setOnClickListener(v -> openFilePicker());
        btnUpload.setOnClickListener(v -> uploadEvidence());

        // Pre-fill complaint ID if provided
        String prefilledId = getIntent().getStringExtra("COMPLAINT_DB_ID");
        if (prefilledId != null) {
            etComplaintId.setText(prefilledId);
        }
    }

    private void openFilePicker() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("*/*");
        startActivityForResult(intent, PICK_FILE_REQUEST);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_FILE_REQUEST && resultCode == RESULT_OK && data != null) {
            Uri uri = data.getData();
            if (uri != null) {
                try {
                    String fileName = getFileName(uri);
                    File cacheDir = getCacheDir();
                    realFileToUpload = new File(cacheDir, fileName);
                    
                    try (InputStream in = getContentResolver().openInputStream(uri);
                         FileOutputStream out = new FileOutputStream(realFileToUpload)) {
                         byte[] buffer = new byte[1024];
                         int read;
                         while ((read = in.read(buffer)) != -1) {
                             out.write(buffer, 0, read);
                         }
                    }
                    tvSelectedFile.setText(fileName);
                } catch (Exception e) {
                    e.printStackTrace();
                    Toast.makeText(this, "Failed to read file", Toast.LENGTH_SHORT).show();
                }
            }
        }
    }

    private String getFileName(Uri uri) {
        String result = null;
        if (uri.getScheme().equals("content")) {
            try (Cursor cursor = getContentResolver().query(uri, null, null, null, null)) {
                if (cursor != null && cursor.moveToFirst()) {
                    result = cursor.getString(cursor.getColumnIndexOrThrow(OpenableColumns.DISPLAY_NAME));
                }
            }
        }
        if (result == null) {
            result = uri.getPath();
            int cut = result.lastIndexOf('/');
            if (cut != -1) {
                result = result.substring(cut + 1);
            }
        }
        return result;
    }

    private void uploadEvidence() {
        String complaintId = etComplaintId.getText().toString().trim();
        String description = etDescription.getText().toString().trim();

        if (complaintId.isEmpty() || realFileToUpload == null) {
            Toast.makeText(this, "Complaint ID and File are required", Toast.LENGTH_SHORT).show();
            return;
        }

        progressBar.setVisibility(View.VISIBLE);
        btnUpload.setEnabled(false);

        RequestBody reqType = RequestBody.create(MediaType.parse("text/plain"), "PHOTO");
        RequestBody reqDesc = RequestBody.create(MediaType.parse("text/plain"), description);
        
        RequestBody fileBody = RequestBody.create(MediaType.parse("image/jpeg"), realFileToUpload);
        MultipartBody.Part filePart = MultipartBody.Part.createFormData("file", realFileToUpload.getName(), fileBody);

        String authHeader = "Bearer " + token;

        apiService.uploadEvidence(authHeader, complaintId, reqType, reqDesc, filePart).enqueue(new Callback<EvidenceResponse>() {
            @Override
            public void onResponse(Call<EvidenceResponse> call, Response<EvidenceResponse> response) {
                progressBar.setVisibility(View.GONE);
                btnUpload.setEnabled(true);
                
                if (response.isSuccessful()) {
                    Toast.makeText(EvidenceUploadActivity.this, "Upload successful!", Toast.LENGTH_SHORT).show();
                    finish();
                } else {
                    Toast.makeText(EvidenceUploadActivity.this, "Upload failed.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<EvidenceResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnUpload.setEnabled(true);
                Toast.makeText(EvidenceUploadActivity.this, "Network Error", Toast.LENGTH_SHORT).show();
            }
        });
    }
}

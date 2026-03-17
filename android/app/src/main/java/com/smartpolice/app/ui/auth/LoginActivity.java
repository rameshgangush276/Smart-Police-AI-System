package com.smartpolice.app.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewStub;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.smartpolice.app.R;
import com.smartpolice.app.api.ApiService;
import com.smartpolice.app.api.RetrofitClient;
import com.smartpolice.app.models.LoginRequest;
import com.smartpolice.app.models.LoginResponse;
import com.smartpolice.app.ui.keyboard.QwertyKeyboardManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText etOfficerId;
    private EditText etPassword;
    private Button btnLogin;
    private ProgressBar progressBar;
    private QwertyKeyboardManager keyboardManager;

    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        etOfficerId = findViewById(R.id.etOfficerId);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        progressBar = findViewById(R.id.progressBar);

        // Lazy initialize keyboard when field is touched
        View.OnTouchListener lazyKeyboardListener = (v, event) -> {
            if (event.getAction() == android.view.MotionEvent.ACTION_UP) {
                ensureKeyboardInitialized();
                if (keyboardManager != null) {
                    keyboardManager.setActiveField((EditText) v);
                    keyboardManager.show();
                }
                v.requestFocus();
            }
            return true;
        };

        etOfficerId.setOnTouchListener(lazyKeyboardListener);
        etPassword.setOnTouchListener(lazyKeyboardListener);
        etOfficerId.setShowSoftInputOnFocus(false);
        etPassword.setShowSoftInputOnFocus(false);

        // Login button submits
        btnLogin.setOnClickListener(v -> {
            if (keyboardManager != null) {
                keyboardManager.hide();
            }
            performLogin();
        });
    }

    private void ensureKeyboardInitialized() {
        if (keyboardManager == null) {
            ViewStub stub = findViewById(R.id.qwerty_keyboard_stub);
            if (stub != null) {
                View inflated = stub.inflate();
                keyboardManager = new QwertyKeyboardManager(this, inflated);
            }
        }
    }

    private void performLogin() {
        String officerId = etOfficerId.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (officerId.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please enter Officer ID and Password", Toast.LENGTH_SHORT).show();
            return;
        }

        progressBar.setVisibility(View.VISIBLE);
        btnLogin.setEnabled(false);

        apiService = RetrofitClient.getClient().create(ApiService.class);
        LoginRequest request = new LoginRequest(officerId, password);
        apiService.login(request).enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                progressBar.setVisibility(View.GONE);
                btnLogin.setEnabled(true);

                if (response.isSuccessful() && response.body() != null) {
                    LoginResponse loginResponse = response.body();
                    Toast.makeText(LoginActivity.this, "Welcome " + loginResponse.getOfficer().getName(), Toast.LENGTH_LONG).show();

                    if ("OFFICER".equals(loginResponse.getOfficer().getRole())) {
                        Intent intent = new Intent(LoginActivity.this, com.smartpolice.app.ui.dashboard.OfficerDashboardActivity.class);
                        intent.putExtra("OFFICER_NAME", loginResponse.getOfficer().getName());
                        intent.putExtra("OFFICER_TOKEN", loginResponse.getToken());
                        startActivity(intent);
                        finish();
                    } else if ("SUPERVISOR".equals(loginResponse.getOfficer().getRole())) {
                        Intent intent = new Intent(LoginActivity.this, com.smartpolice.app.ui.supervisory.SupervisoryDashboardActivity.class);
                        intent.putExtra("OFFICER_NAME", loginResponse.getOfficer().getName());
                        intent.putExtra("OFFICER_TOKEN", loginResponse.getToken());
                        startActivity(intent);
                        finish();
                    } else {
                        Toast.makeText(LoginActivity.this, "Unknown role", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(LoginActivity.this, "Login Failed: Invalid credentials", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnLogin.setEnabled(true);
                Toast.makeText(LoginActivity.this, "Network Error (" + RetrofitClient.BASE_URL + "): " + t.getMessage(), Toast.LENGTH_LONG).show();
                Log.e("LoginActivity", "Error: ", t);
            }
        });
    }
}

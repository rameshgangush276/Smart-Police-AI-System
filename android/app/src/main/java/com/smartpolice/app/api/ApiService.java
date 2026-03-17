package com.smartpolice.app.api;

import com.smartpolice.app.models.LoginRequest;
import com.smartpolice.app.models.LoginResponse;

import com.smartpolice.app.models.ComplaintRequest;
import com.smartpolice.app.models.ComplaintResponse;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;
import retrofit2.http.GET;
import java.util.List;
import retrofit2.http.Header;
import retrofit2.http.PUT;
import com.smartpolice.app.models.AiRecommendationRequest;
import com.smartpolice.app.models.AiRecommendationResponse;
import retrofit2.http.Multipart;
import retrofit2.http.Part;
import retrofit2.http.Path;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;

import com.smartpolice.app.models.EvidenceResponse;

public interface ApiService {
    
    @POST("/api/auth/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @POST("/api/complaints/register")
    Call<ComplaintResponse> registerComplaint(@Header("Authorization") String token, @Body ComplaintRequest request);

    @GET("/api/complaints/my-cases")
    Call<List<ComplaintResponse.Complaint>> getMyComplaints(
        @Header("Authorization") String token,
        @retrofit2.http.Query("status") String status,
        @retrofit2.http.Query("crimeType") String crimeType,
        @retrofit2.http.Query("startDate") String startDate,
        @retrofit2.http.Query("endDate") String endDate
    );

    @GET("/api/complaints/{id}")
    Call<com.smartpolice.app.models.ComplaintDetailResponse> getComplaintById(
        @Header("Authorization") String token,
        @Path("id") String id
    );

    @GET("/api/complaints/search")
    Call<List<ComplaintResponse.Complaint>> searchComplaints(
        @Header("Authorization") String token,
        @retrofit2.http.Query("q") String query,
        @retrofit2.http.Query("complaintId") String complaintId,
        @retrofit2.http.Query("name") String name,
        @retrofit2.http.Query("mobileNumber") String mobileNumber,
        @retrofit2.http.Query("crimeType") String crimeType,
        @retrofit2.http.Query("startDate") String startDate,
        @retrofit2.http.Query("endDate") String endDate,
        @retrofit2.http.Query("location") String location
    );

    @Multipart
    @POST("/api/complaints/{id}/evidence")
    Call<EvidenceResponse> uploadEvidence(
            @Header("Authorization") String token,
            @Path("id") String complaintId,
            @Part("type") RequestBody type,
            @Part("description") RequestBody description,
            @Part MultipartBody.Part file
    );

    @POST("/api/ai/suggest-sections")
    Call<AiRecommendationResponse> suggestSections(
            @Header("Authorization") String token,
            @Body AiRecommendationRequest request
    );

    @GET("/api/complaints/{id}/timeline")
    Call<com.smartpolice.app.models.TimelineResponse> getInvestigationTimeline(
            @Header("Authorization") String token,
            @Path("id") String complaintId
    );

    @POST("/api/complaints/{id}/statements")
    Call<com.smartpolice.app.models.WitnessStatementResponse> addWitnessStatement(
            @Header("Authorization") String token,
            @Path("id") String complaintId,
            @Body com.smartpolice.app.models.WitnessStatementRequest request
    );

    @GET("/api/complaints/{id}/generate-document")
    Call<com.smartpolice.app.models.DocumentResponse> generateDocument(
            @Header("Authorization") String token,
            @Path("id") String complaintId
    );

    @GET("/api/supervision/workload")
    Call<com.smartpolice.app.models.WorkloadResponse> getOfficerWorkload(
            @Header("Authorization") String token
    );

    @GET("/api/analytics/hotspots")
    Call<com.smartpolice.app.models.HotspotResponse> getHotspots(
            @Header("Authorization") String token
    );

    @POST("/api/documents/generate")
    Call<com.smartpolice.app.models.DocumentResponse> generateNewDocument(
            @Header("Authorization") String token,
            @Body com.smartpolice.app.models.DocumentGenerateRequest request
    );

    @GET("/api/documents/case/{caseId}")
    Call<com.smartpolice.app.models.DocumentResponse> getDocumentsByCase(
            @Header("Authorization") String token,
            @Path("caseId") String caseId
    );

    @GET("/api/auth/profile")
    Call<com.smartpolice.app.models.ProfileResponse> getProfile(@Header("Authorization") String token);

    @PUT("/api/auth/profile")
    Call<com.smartpolice.app.models.ProfileResponse> updateProfile(@Header("Authorization") String token, @Body com.smartpolice.app.models.ProfileUpdateRequest request);

    @POST("/api/signatures/internal")
    Call<com.smartpolice.app.models.GenericResponse> internalSign(
            @Header("Authorization") String token,
            @Body com.smartpolice.app.models.InternalSignRequest request
    );

    @POST("/api/signatures/aadhaar/initiate")
    Call<com.smartpolice.app.models.GenericResponse> initiateAadhaarSign(
            @Header("Authorization") String token,
            @Body com.smartpolice.app.models.AadhaarSignRequest request
    );

    @POST("/api/signatures/aadhaar/verify")
    Call<com.smartpolice.app.models.GenericResponse> verifyAadhaarOTP(
            @Header("Authorization") String token,
            @Body com.smartpolice.app.models.AadhaarSignRequest request
    );

    @POST("/api/legal/suggest-sections")
    Call<com.smartpolice.app.models.LegalSectionResponse> suggestLegalSections(
            @Header("Authorization") String token,
            @Body com.smartpolice.app.models.LegalSuggestRequest request
    );

    @POST("/api/legal/generate-draft")
    Call<com.smartpolice.app.models.LegalDraftResponse> generateLegalDraft(
            @Header("Authorization") String token,
            @Body com.smartpolice.app.models.LegalDraftRequest request
    );
}
